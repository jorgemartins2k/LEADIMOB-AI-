"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { leads, users } from "@/lib/db/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getOrCreateInternalUser } from "@/lib/auth-utils";
import { initiateRaquelContact } from "@/lib/ai/raquel";

const leadSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    phone: z.string().min(10, "Informe um telefone válido (DDD + Número)"),
    source: z.string().optional(),
    temperature: z.enum(["frio", "morno", "quente"]).optional(),
    notes: z.string().optional(),
});

export async function getLeads() {
    const user = await getOrCreateInternalUser();
    return db.query.leads.findMany({
        where: and(eq(leads.userId, user.id)),
        orderBy: [desc(leads.createdAt)],
    });
}

export async function checkQuarantine(phone: string) {
    const user = await getOrCreateInternalUser();

    // Clean phone string (remove non-digits if needed, but assuming standard format)
    // cleanPhone not used yet, but keeping for reference if needed later

    const existingLead = await db.query.leads.findFirst({
        where: and(
            eq(leads.userId, user.id),
            eq(leads.phone, phone), // or cleanPhone depending on storage format
            gte(leads.quarantineUntil, new Date().toISOString().split('T')[0])
        ),
    });

    return existingLead;
}

export async function createLead(data: z.infer<typeof leadSchema>) {
    const user = await getOrCreateInternalUser();
    const validated = leadSchema.parse(data);

    try {
        // 1. Check quarantine
        const inQuarantine = await checkQuarantine(validated.phone);
        if (inQuarantine) {
            return { error: `Este lead está em quarentena até ${new Date(inQuarantine.quarantineUntil!).toLocaleDateString()}.` };
        }

        // 2. Insert
        const result = await db.insert(leads).values({
            userId: user.id,
            name: validated.name,
            phone: validated.phone,
            source: validated.source || "manual",
            temperature: validated.temperature || "morno",
            notes: validated.notes,
            status: "waiting",
            quarantineUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days
        }).returning({ insertedId: leads.id });

        const newLeadId = result[0].insertedId;

        // 3. Trigger Raquel
        try {
            await initiateRaquelContact(newLeadId);
        } catch (raquelErr) {
            console.error("Erro ao iniciar contato da Raquel:", raquelErr);
            // Non-blocking error, lead is already saved
        }

        revalidatePath("/leads");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (err) {
        console.error(err);
        return { error: "Erro ao criar lead no banco de dados." };
    }
}

export async function deleteLead(id: string) {
    const user = await getOrCreateInternalUser();

    await db
        .delete(leads)
        .where(and(eq(leads.id, id), eq(leads.userId, user.id)));

    revalidatePath("/leads");
    return { success: true };
}
