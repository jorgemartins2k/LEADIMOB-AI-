import OpenAI from "openai";
import { db } from "@/lib/db";
import { leads, conversations, users, properties, launches, events } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { sendWhatsAppMessage } from "@/lib/zapi";
import { notifyBrokerByWhatsApp } from "./notify";

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
}

export async function processLeadMessage({ phone, message }: ProcessMessageParams) {
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
    const [brokerProperties, brokerLaunches, brokerEvents] = await Promise.all([
        db.query.properties.findMany({
            where: and(eq(properties.userId, broker.id), eq(properties.status, "available")),
            limit: 10,
        }),
        db.query.launches.findMany({
            where: eq(launches.userId, broker.id),
            limit: 5,
        }),
        db.query.events.findMany({
            where: (e, { eq, gte }) => and(
                eq(e.userId, broker.id),
                gte(e.eventDate, new Date().toISOString().split('T')[0])
            ),
            limit: 5,
        }),
    ]);

    // 5. Build system prompt (Raquel personality)
    const systemPrompt = `Você é Raquel, a assistente virtual inteligente do corretor de imóveis ${broker.name}.
Seu objetivo é atender ${lead.name} de forma consultiva, educada e persuasiva pelo WhatsApp.

DIRETRIZES:
- JAMAIS use emojis. A comunicação deve ser estritamente profissional e direta.
- Seja prestativa e focada em QUALIFICAR o lead (entender necessidades, orçamento, prazo).
- Use os lançamentos e eventos abaixo APENAS se o prazo do cliente for compatível (médio/longo prazo).
- Se perguntada se é humana, diga que é a assistente do ${broker.name}.
- Quando o cliente demonstrar forte interesse, urgência ou aceitar visita, use [LEAD_AQUECIDO].
- Mantenha um tom profissional, direto e humano.

PORTFÓLIO DO CORRETOR:
IMÓVEIS: ${JSON.stringify(brokerProperties.map(p => ({ title: p.title, price: p.price, city: p.city, bedrooms: p.bedrooms })))}
LANÇAMENTOS: ${JSON.stringify(brokerLaunches.map(l => ({ name: l.name, from: l.priceFrom, city: l.city })))}
EVENTOS: ${JSON.stringify(brokerEvents.map(e => ({ name: e.name, date: e.eventDate, location: e.location })))}
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
    const systemPrompt = `Você é Raquel, assistente do corretor de imóveis ${broker.name}.
Você está fazendo o PRIMEIRO CONTATO com ${lead.name}. Este lead foi cadastrado pelo corretor e VOCÊ está iniciando a conversa.

REGRAS PARA A PRIMEIRA MENSAGEM:
- PROIBIDO usar emojis. Totalmente proibido.
- OBRIGATÓRIO: Ao se apresentar, mencione que é assistente do corretor de imóveis ${broker.name}.
- NÃO use a palavra "virtual". Você é assistente real dele.
- Seja CURTA (máximo 2-3 frases).
- Pergunte se é um bom momento para conversarem.
- NÃO mencione "sistema", "banco de dados" ou termos técnicos.
${lead.notes ? `\nCONTEXTO DO CORRETOR SOBRE ESTE LEAD: "${lead.notes}". Use isso para tornar a abordagem mais contextual.` : ''}`;

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
