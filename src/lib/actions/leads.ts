"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { leads, users } from "@/lib/db/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getOrCreateInternalUser } from "@/lib/auth-utils";
import { initiateRaquelContact } from "@/lib/ai/raquel";
import { isCurrentlyInBusinessHours } from "@/lib/utils/business-hours";

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

    // 0. Check business hours
    const inBusinessHours = await isCurrentlyInBusinessHours(user.id);
    if (inBusinessHours) {
        return { error: "Não é permitido lançar leads durante o horário de atendimento. O sistema automatizado está em operação." };
    }

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


        // 3. Trigger Raquel (AI Contact) 
        // Logic: Since this is outside business hours (blocked by check above),
        // we naturally wait for the next automation cycle or next business hours start.
        // However, if the user wants them contacted in the NEXT session, we don't call it now.
        // If we call it now, Raquel might message at night.
        // User says: "são contactados pela AI no proximo expediente".

        // So we just save with "waiting" status and don't call initiateRaquelContact here.
        // A background worker or the next session start will trigger them.

        revalidatePath("/leads");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (err: any) {
        console.error("Database error in createLead:", err);
        return { error: `Erro no banco de dados: ${err.message || String(err)}` };
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

export async function cleanupLeads() {
    const user = await getOrCreateInternalUser();

    try {
        await db.delete(leads).where(eq(leads.userId, user.id));
        revalidatePath("/leads");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Erro ao limpar lista:", error);
        return { error: "Erro ao limpar a lista de leads." };
    }
}

/**
 * Checks if current user is in business hours (called from frontend)
 */
export async function checkBusinessStatus() {
    const user = await getOrCreateInternalUser();
    return isCurrentlyInBusinessHours(user.id);
}

export async function processAutomation() {
    const user = await getOrCreateInternalUser();

    // 1. Check if in business hours
    const inBusinessHours = await isCurrentlyInBusinessHours(user.id);
    if (!inBusinessHours) return { success: false, message: "Fora do horário de expediente." };

    // 2. Find all 'waiting' leads for this user
    const pendingLeads = await db.query.leads.findMany({
        where: and(
            eq(leads.userId, user.id),
            eq(leads.status, "waiting")
        )
    });

    if (pendingLeads.length === 0) return { success: true, message: "Sem leads pendentes." };

    // 3. Trigger Raquel for each
    let successCount = 0;
    for (const lead of pendingLeads) {
        try {
            await initiateRaquelContact(lead.id);
            // Update status so we don't contact again
            await db.update(leads)
                .set({ status: "active", updatedAt: new Date() })
                .where(eq(leads.id, lead.id));
            successCount++;
        } catch (err) {
            console.error(`Erro ao processar lead ${lead.id}:`, err);
        }
    }

    revalidatePath("/leads");
    return { success: true, contacted: successCount };
}
