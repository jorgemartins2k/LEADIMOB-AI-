"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { leads, users } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";
import { getLeadLimitStatus } from "@/lib/utils/lead-limits";

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
    if (!openaiClient) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("Sua chave de API da OpenAI (OPENAI_API_KEY) não foi encontrada ou está inválida no servidor.");
        }
        openaiClient = new OpenAI({ apiKey });
    }
    return openaiClient;
}

export async function extractLeadsFromContent(content: string, type: 'image' | 'pdf' | 'text', mimeType?: string): Promise<{ leads: any[]; error?: string }> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) return { leads: [], error: "Sessão expirada. Por favor, faça login novamente." };

        const prompt = `
            VOCÊ É A RAQUEL - ESPECIALISTA EM EXTRAÇÃO DE DADOS.
            Extraia Nome e Telefone dos leads deste conteúdo.
            
            REGRAS:
            1. Telefone: Apenas números com DDD (ex: 11999998888).
            2. Se não houver leads claros, retorne {"leads": []}.
            3. Não invente dados.
            4. O JSON deve ser estritamente: {"leads": [{"name": "...","phone": "..."}]}
        `;

        let response;
        if (type === 'image') {
            const finalMime = mimeType || 'image/jpeg';
            response = await getOpenAIClient().chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${finalMime};base64,${content}`,
                                },
                            },
                        ],
                    },
                ],
                response_format: { type: "json_object" },
            });
        } else {
            if (type === 'pdf') {
                return { leads: [], error: "A leitura direta de arquivo PDF ainda não é suportada. Por favor, tire um print (foto/screenshot) da sua lista e envie como imagem para a Raquel ler." };
            }

            response = await getOpenAIClient().chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: prompt },
                    { role: "user", content: content },
                ],
                response_format: { type: "json_object" },
            });
        }

        const rawContent = response.choices[0].message.content || '{"leads": []}';
        console.log("[Raquel] Resposta bruta da OpenAI:", rawContent);
        const result = JSON.parse(rawContent);
        const extractedLeads = result.leads || [];
        return { leads: extractedLeads, error: undefined };
    } catch (error: any) {
        console.error("Erro na extração de leads:", error);
        return { leads: [], error: error.message || "Erro na leitura inteligente. Tente usar uma imagem mais nítida." };
    }
}

export async function bulkInsertLeads(leadsData: { name: string; phone: string }[]) {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) return { error: "Não autorizado" };

        const user = await db.query.users.findFirst({
            where: eq(users.clerkUserId, clerkUserId),
        });

        if (!user) return { error: "Usuário não encontrado" };

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
                    name: leadData.name || "Lead Importado",
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
        return { results };
    } catch (error: any) {
        console.error("Erro na importação:", error);
        return { error: "Erro ao salvar os leads. Tente novamente." };
    }
}
