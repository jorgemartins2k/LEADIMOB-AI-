"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { getOrCreateInternalUser } from "@/lib/auth-utils";
import { formatWhatsAppNumber } from "@/lib/utils";
import { initiateRaquelContact } from "@/lib/ai/raquel";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const testSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    phone: z.string().min(10, "Informe um telefone válido (DDD + Número)"),
    source: z.string().optional(),
    temperature: z.enum(["frio", "morno", "quente"]).optional(),
    notes: z.string().optional(),
});

export async function createImmediateTestLead(data: z.infer<typeof testSchema>) {
    const user = await getOrCreateInternalUser();
    const validated = testSchema.parse(data);

    // FORMAT PHONE
    const formattedPhone = formatWhatsAppNumber(validated.phone);

    try {
        // 1. DELETE EXISING LEAD WITH SAME PHONE FOR RAPID TESTING
        // This avoids quarantine completely and cleans up old tests
        await db.delete(leads).where(
            and(
                eq(leads.userId, user.id),
                eq(leads.phone, formattedPhone)
            )
        );

        // 2. INSERT LEAD DIRECTLY IGNORING LIMITS AND QUARANTINE
        const [newLead] = await db.insert(leads).values({
            userId: user.id,
            name: validated.name,
            phone: formattedPhone,
            source: validated.source || "indicacao",
            temperature: validated.temperature || "quente",
            notes: validated.notes || "",
            status: "waiting",
            scheduledDate: new Date().toISOString().split('T')[0],
        }).returning({ id: leads.id });

        // 3. FORCE IMMEDIATE AI CONTACT IGNORING BUSINESS HOURS
        console.log(`[TESTE IA] Iniciando contato imediato para o lead teste ${newLead.id}...`);
        const aiResult = await initiateRaquelContact(newLead.id);

        if (aiResult && !aiResult.success) {
            throw new Error(`Z-API falhou ao enviar: ${JSON.stringify(aiResult.error)}`);
        }

        // 4. Update status to active as if scheduler did it
        await db.update(leads)
            .set({ status: "active", updatedAt: new Date() })
            .where(eq(leads.id, newLead.id));

        revalidatePath("/leads");
        return { success: true };
    } catch (err: any) {
        console.error("Test environment error:", err);
        return { error: `Falha no teste: ${err.message}` };
    }
}
