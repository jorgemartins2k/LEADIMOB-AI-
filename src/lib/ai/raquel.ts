import OpenAI from "openai";
import { db } from "@/lib/db";
import { leads, conversations, users, properties, launches, bestLeadsRanking, aiMistakesLog } from "@/lib/db/schema";
import { eq, and, asc, sql, desc } from "drizzle-orm";
import { sendWhatsAppMessage } from "@/lib/zapi";
import { notifyBrokerByWhatsApp } from "./notify";
import fs from "fs";
import path from "path";
import os from "os";

const getOpenAI = () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing OPENAI_API_KEY environment variable");
    }
    return new OpenAI({ apiKey });
};

interface ProcessMessageParams {
    phone: string;
    message: string;
    audioUrl?: string; // Optional audio URL from Z-API
}

export async function processLeadMessage({ phone, message, audioUrl }: ProcessMessageParams) {
    // 0. Handle Audio Transcription if needed
    if (audioUrl && !message) {
        try {
            const transcription = await transcribeAudio(audioUrl);
            message = transcription;
        } catch (err) {
            console.error("Audio transcription error:", err);
            // If transcription fails, we might still proceed if there's a text message,
            // but if it's only audio, we can't do much.
            if (!message) return;
        }
    }
    // 1. Find the lead by phone number
    // We need to normalize the phone or search for contains
    const lead = await db.query.leads.findFirst({
        where: (l, { eq, or, ilike }) =>
            or(
                eq(l.phone, phone),
                ilike(l.phone, `%${phone.slice(-8)}%`) // Fallback to last 8 digits
            ),
        with: {
            // Find the broker (user) associated
            // user: true, 
        }
    });

    if (!lead || lead.status === "transferred" || lead.status === "discarded") {
        console.log(`Lead not found or inactive for phone: ${phone}`);
        return;
    }

    // 2. Resolve the broker (user)
    const broker = await db.query.users.findFirst({
        where: eq(users.id, lead.userId),
    });

    if (!broker) return;

    // 3. Fetch conversation history
    const history = await db.query.conversations.findMany({
        where: eq(conversations.leadId, lead.id),
        orderBy: [asc(conversations.sentAt)],
        limit: 15,
    });

    // 4. Fetch broker's portfolio
    const [brokerProperties, brokerLaunches] = await Promise.all([
        db.query.properties.findMany({
            where: and(eq(properties.userId, broker.id), eq(properties.status, "available")),
            limit: 10,
        }),
        db.query.launches.findMany({
            where: eq(launches.userId, broker.id),
            limit: 5,
        }),
    ]);

    const [rankingCases, recentLessons] = await Promise.all([
        db.query.bestLeadsRanking.findMany({
            where: eq(bestLeadsRanking.userId, broker.id),
            orderBy: [asc(bestLeadsRanking.rank)],
            limit: 3,
        }),
        db.query.aiMistakesLog.findMany({
            where: eq(aiMistakesLog.userId, broker.id),
            orderBy: [desc(aiMistakesLog.createdAt)],
            limit: 5,
        })
    ]);

    const rankingText = rankingCases.length > 0
        ? rankingCases.map((c, i) => `EXEMPLO ${i + 1}:\nPerfil: ${c.leadSummary}\nDestaque: ${c.interactionHighlights}`).join("\n\n")
        : "Ainda não há casos modelo salvos.";

    const lessonsText = recentLessons.length > 0
        ? recentLessons.map(l => `- ${l.lessonLearned}`).join("\n")
        : "Nenhum erro registrado ainda. Continue mantendo a precisão.";

    // 5. Build system prompt (Raquel personality)
    const systemPrompt = `Você é Raquel, a assistente virtual inteligente do corretor de imóveis ${broker.name}.
Seu objetivo é atender ${lead.name} de forma consultiva, educada e persuasiva pelo WhatsApp.

===== LIÇÕES APRENDIDAS (NÃO REPITA ESTES ERROS) =====
${lessonsText}

===== EXEMPLOS DE ATENDIMENTO NOTA 10 (MODELOS) =====
Use estes exemplos reais do seu histórico para manter o padrão de excelência:
${rankingText}

DIRETRIZES:
- VOCÊ É A RAQUEL — ASSISTENTE DO CORRETOR ${broker.name}.
- Seu objetivo não é apenas triagem, é gerar valor e qualificar profundamente o cliente ${lead.name}.
- **BREVIDADE (MÁXIMO 2-3 FRASES)**: Suas respostas devem ser curtas e diretas, típicas de WhatsApp. Evite parágrafos longos. Seja objetiva para não cansar o cliente.
- **SEM EMOJIS**: É terminantemente PROIBIDO o uso de emojis. Mesmo que o cliente ou o histórico contenham emojis, VOCÊ não deve usar nenhum.
- **TOM CONSULTIVO**: Você é autoridade no setor. Dê dicas baseadas no que o cliente disser.
- **ORDEM OBRIGATÓRIA**: 
  1. Objetivo e Perfil (Moradia ou investimento? Casa ou Apartamento?).
  2. Localização e Proximidade (Onde quer morar?).
  3. Composição Familiar (Mora sozinho ou com família? Tem filhos?).
  4. Preferências (Quartos/suítes, vagas de garagem, lazer).
  5. Prazo de mudança.
  6. **INVESTIMENTO/VALOR (ÚLTIMA PERGUNTA)**.
- Se perguntada se é humana, diga que é a assistente do ${broker.name}. PROIBIDO usar o termo "consultora" — use "assistente".
- Quando o cliente estiver qualificado e aquecido, use [LEAD_AQUECIDO].

${broker.dailyFocus ? `[ATENÇÃO! FOCO DE VENDAS DE HOJE]: ${broker.dailyFocus}. Introduza este tema se fizer sentido no contexto.` : ""}

[INSTRUÇÕES DO CORRETOR]:
${broker.presentation || "Tom polido e focado em alta qualidade de atendimento."}

PORTFÓLIO DO CORRETOR:
IMÓVEIS: ${JSON.stringify(brokerProperties.map(p => ({ title: p.title, price: p.price, city: p.city, bedrooms: p.bedrooms })))}
LANÇAMENTOS: ${JSON.stringify(brokerLaunches.map(l => ({ name: l.name, from: l.priceFrom, city: l.city })))}
`;

    // 6. Save lead message
    await db.insert(conversations).values({
        leadId: lead.id,
        userId: broker.id,
        role: "user",
        content: message,
    });

    // 7. Call GPT-4o
    const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4o",
        temperature: 0, // Precisão total, sem emojis
        messages: [
            { role: "system", content: systemPrompt },
            ...history.map(h => ({
                role: h.role as "assistant" | "user",
                content: h.content,
            })),
            { role: "user", content: message },
        ],
    });

    const reply = completion.choices[0].message.content || "";

    // 8. Save Raquel's reply
    await db.insert(conversations).values({
        leadId: lead.id,
        userId: broker.id,
        role: "assistant",
        content: reply,
    });

    // 9. Send via Z-API
    await sendWhatsAppMessage({ phone: lead.phone, message: reply });

    // 10. Check if lead is warm
    const isWarm = reply.includes("[LEAD_AQUECIDO]");
    const isPassBroker = reply.includes("[PASSAR_CORRETOR]");

    if (isWarm || isPassBroker) {
        await db.update(leads)
            .set({ status: "warm", updatedAt: new Date() })
            .where(eq(leads.id, lead.id));

        // Notify broker only if preference is enabled
        if (broker.hotLeadAlert) {
            await notifyBrokerByWhatsApp({
                lead,
                broker,
                reason: isPassBroker ? "pass_broker" : "warm"
            });
        }

        // 11. Evaluate and Rank (Continuous Improvement)
        evaluateAndRankLead(lead.id, broker.id).catch(err => console.error("Ranking error:", err));
        auditAndLogMistakes(lead.id, broker.id, message, completion.choices[0].message.content || "").catch(err => console.error("Audit error:", err));
    }
}

async function auditAndLogMistakes(leadId: string, userId: string, userMsg: string, aiReply: string) {
    try {
        const completion = await getOpenAI().chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Você é um auditor crítico de conversas de IA." },
                { role: "user", content: `Analise o diálogo e identifique erros ou alucinações.\n\nMSG CLIENTE: ${userMsg}\nRESP IA: ${aiReply}\n\nResponda JSON com has_error, error_context, user_correction, lesson_learned.` }
            ],
            response_format: { type: "json_object" }
        });

        const data = JSON.parse(completion.choices[0].message.content || "{}");

        if (data.has_error) {
            await db.insert(aiMistakesLog).values({
                userId,
                leadId,
                errorContext: data.error_context || "Hallucinação",
                userCorrection: data.user_correction || "Correção do usuário",
                lessonLearned: data.lesson_learned || "Evitar assumir dados não fornecidos"
            });
            console.log(`⚠️ Erro da IA registrado: ${data.lesson_learned}`);
        }
    } catch (err) {
        console.error("Erro na auditoria:", err);
    }
}

async function evaluateAndRankLead(leadId: string, userId: string) {
    try {
        const history = await db.query.conversations.findMany({
            where: eq(conversations.leadId, leadId),
            orderBy: [asc(conversations.sentAt)],
            limit: 20,
        });

        const chatStr = history.map(h => `${h.role}: ${h.content}`).join("\n");

        const completion = await getOpenAI().chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Você é um auditor de qualidade de atendimento imobiliário." },
                { role: "user", content: `Analise a conversa abaixo e gere um resumo técnico JSON com "summary" e "highlights".\n\nCONVERSA:\n${chatStr}` }
            ],
            response_format: { type: "json_object" }
        });

        const data = JSON.parse(completion.choices[0].message.content || "{}");

        // Use a transaction or manual update to shift ranks
        await db.transaction(async (tx) => {
            // Shift ranks for this user
            await tx.execute(sql`UPDATE best_leads_ranking SET rank = rank + 1 WHERE user_id = ${userId}`);

            // Insert Rank 1
            await tx.insert(bestLeadsRanking).values({
                userId,
                leadId,
                rank: 1,
                leadSummary: data.summary || "Lead qualificado",
                interactionHighlights: data.highlights || "Bom atendimento"
            });

            // Delete > 100
            await tx.execute(sql`DELETE FROM best_leads_ranking WHERE user_id = ${userId} AND rank > 100`);
        });

        console.log(`✅ Lead ${leadId} avaliado e rankeado.`);
    } catch (err) {
        console.error("Erro ao avaliar lead para ranking:", err);
    }
}

export async function initiateRaquelContact(leadId: string) {
    const lead = await db.query.leads.findFirst({
        where: eq(leads.id, leadId),
    });
    if (!lead) return;

    const broker = await db.query.users.findFirst({
        where: eq(users.id, lead.userId),
    });
    if (!broker) return;

    // Build intro prompt
    const systemPrompt = `Você é Raquel, consultora estratégica do corretor de imóveis ${broker.name}.
Você está fazendo o PRIMEIRO CONTATO com ${lead.name}. Sua abordagem deve ser consultiva, profissional e humana.

REGRAS PARA A PRIMEIRA MENSAGEM:
- PROIBIDO usar emojis. Mesmo que o histórico contenha emojis, NÃO use nenhum.
- OBRIGATÓRIO: Ao se apresentar, mencione que é consultora do corretor de imóveis ${broker.name}.
- NÃO use a palavra "virtual". Você é a assistente real dele.
- Seja CURTA (máximo 2 frases).
- Pergunte se é um bom momento para conversarem.
- NÃO mencione "sistema" ou termos técnicos.
- Demonstre autoridade e prontidão para realizar um atendimento consultivo.

${broker.presentation ? `[INSTRUCÕES DO CORRETOR]: ${broker.presentation}` : ""}
`;

    const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Envie a primeira mensagem de apresentação para ${lead.name}. Lembre-se: seja breve, natural e humana.` },
        ],
    });

    const reply = completion.choices[0].message.content || "";

    // Save conversation
    await db.insert(conversations).values({
        leadId: lead.id,
        userId: broker.id,
        role: "assistant",
        content: reply,
    });

    // Send via Z-API
    const res = await sendWhatsAppMessage({ phone: lead.phone, message: reply });
    return res;
}

/**
 * Audio Transcription using OpenAI Whisper
 */
async function transcribeAudio(url: string): Promise<string> {
    const openai = getOpenAI();
    const tempPath = path.join(os.tmpdir(), `audio-${Date.now()}.ogg`);

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to download audio");

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(tempPath, buffer);

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempPath),
            model: "whisper-1",
        });

        return transcription.text;
    } finally {
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
    }
}
