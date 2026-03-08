"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { leads, users } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";
import { getLeadLimitStatus } from "@/lib/utils/lead-limits";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function extractLeadsFromContent(content: string, isImageValue: boolean = false) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Não autorizado");

    const prompt = `
        Você é um assistente especializado em extração de dados imobiliários.
        Analise o conteúdo fornecido (pode ser texto ou uma descrição de imagem) e extraia uma lista de leads.
        Para cada lead, identifique o NOME e o WHATSAPP (Telefone com DDD).
        
        Regras:
        1. Se o número não tiver DDD, tente inferir pelo contexto ou deixe apenas o número.
        2. Formate o WHATSAPP apenas com dígitos (ex: 11999998888).
        3. Se houver nomes incompletos ou óbvios "apelidos", extraia como estão.
        4. Retorne APENAS um JSON no formato: [{"name": "...", "phone": "..."}, ...]
        5. Se não encontrar nenhum lead, retorne um array vazio [].
    `;

    try {
        let response;
        if (isImageValue) {
            // content is base64
            response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${content}`,
                                },
                            },
                        ],
                    },
                ],
                response_format: { type: "json_object" },
            });
        } else {
            response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: prompt },
                    { role: "user", content: content },
                ],
                response_format: { type: "json_object" },
            });
        }

        const result = JSON.parse(response.choices[0].message.content || '{"leads": []}');
        return result.leads || result; // Handle both {"leads": [...]} and [...]
    } catch (error) {
        console.error("Erro na extração de leads:", error);
        throw new Error("Falha ao extrair leads do arquivo.");
    }
}

export async function bulkInsertLeads(leadsData: { name: string; phone: string }[]) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Não autorizado");

    const user = await db.query.users.findFirst({
        where: eq(users.clerkUserId, clerkUserId),
    });

    if (!user) throw new Error("Usuário não encontrado");

    // 0. Check daily limit status
    let { remaining, dailyLimit, plan } = await getLeadLimitStatus(user.id);

    const results = {
        imported: 0,
        skipped: 0, // In quarantine
        limited: 0, // Hit daily limit
        errors: 0,
    };

    const quarantineDays = 15;

    for (const leadData of leadsData) {
        try {
            // Check if we still have slots
            if (remaining <= 0) {
                results.limited++;
                continue;
            }

            // Clean phone
            const cleanPhone = leadData.phone.replace(/\D/g, '');
            if (!cleanPhone || cleanPhone.length < 10) {
                results.errors++;
                continue;
            }

            // Check quarantine (15 days)
            const existingLead = await db.query.leads.findFirst({
                where: and(
                    eq(leads.userId, user.id),
                    eq(leads.phone, cleanPhone),
                    gte(leads.quarantineUntil, new Date().toISOString().split('T')[0])
                ),
            });

            if (existingLead) {
                results.skipped++;
                continue;
            }

            // Insert
            await db.insert(leads).values({
                userId: user.id,
                name: leadData.name,
                phone: cleanPhone,
                source: "import",
                status: "waiting",
                scheduledDate: new Date().toISOString().split('T')[0],
                quarantineUntil: new Date(Date.now() + quarantineDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });

            results.imported++;
            remaining--; // Use up a slot
        } catch (error) {
            console.error("Erro ao importar lead individual:", error);
            results.errors++;
        }
    }

    revalidatePath("/leads");
    revalidatePath("/dashboard");
    return results;
}
