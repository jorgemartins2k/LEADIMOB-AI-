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
import { getLeadLimitStatus } from "@/lib/utils/lead-limits";
import { formatWhatsAppNumber } from "@/lib/utils";

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

    const existingLead = await db.query.leads.findFirst({
        where: and(
            eq(leads.userId, user.id),
            eq(leads.phone, phone),
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
        return { error: "⚠️ Não é permitido lançar leads durante o expediente da Raquel. O sistema automatizado está em operação." };
    }

    // 0.1 Check daily limit
    const limitStatus = await getLeadLimitStatus(user.id);
    if (limitStatus.remaining <= 0) {
        const planName = limitStatus.plan === 'start' ? 'Iniciante' :
            limitStatus.plan === 'pro' ? 'Pro' :
                limitStatus.plan === 'premium' ? 'Enterprise' :
                    limitStatus.plan.toUpperCase();
        return { error: `🚫 Você atingiu o limite de ${limitStatus.dailyLimit} leads para hoje (proporcional ao seu plano ${planName}). Novas vagas abrem amanhã! 🕒` };
    }

    try {
        const formattedPhone = formatWhatsAppNumber(validated.phone);

        // 1. Check quarantine
        const inQuarantine = await checkQuarantine(formattedPhone);
        if (inQuarantine) {
            return { error: `🔒 Este número está em quarentena até ${new Date(inQuarantine.quarantineUntil!).toLocaleDateString()}. Só é possível atender o mesmo lead a cada 15 dias.` };
        }

        // 2. Insert
        const result = await db.insert(leads).values({
            userId: user.id,
            name: validated.name,
            phone: formattedPhone,
            source: validated.source || "manual",
            temperature: validated.temperature || "frio",
            notes: validated.notes,
            status: "waiting",
            scheduledDate: new Date().toISOString().split('T')[0],
            quarantineUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }).returning({ insertedId: leads.id });

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
    await db.delete(leads).where(and(eq(leads.id, id), eq(leads.userId, user.id)));
    revalidatePath("/leads");
    return { success: true };
}

export async function cleanupLeads() {
    const user = await getOrCreateInternalUser();
    try {
        await db.delete(leads).where(
            and(
                eq(leads.userId, user.id),
                eq(leads.status, "waiting")
            )
        );
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
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return false;
    const user = await db.query.users.findFirst({
        where: eq(users.clerkUserId, clerkUserId),
    });
    if (!user) return false;
    return await isCurrentlyInBusinessHours(user.id);
}

/**
 * Server action to get lead limit status for the client
 */
export async function getLeadLimitServerAction() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Não autorizado");

    const user = await db.query.users.findFirst({
        where: eq(users.clerkUserId, clerkUserId),
    });

    if (!user) throw new Error("Usuário não encontrado");

    return await getLeadLimitStatus(user.id);
}

export async function processAutomation() {
    const user = await getOrCreateInternalUser();
    return processUserAutomation(user.id);
}

/**
 * Core automation logic for a specific user.
 */
export async function processUserAutomation(userId: string) {
    const inBusinessHours = await isCurrentlyInBusinessHours(userId);
    if (!inBusinessHours) return { success: false, message: "Fora do horário de expediente." };

    const pendingLeads = await db.query.leads.findMany({
        where: and(
            eq(leads.userId, userId),
            eq(leads.status, "waiting")
        )
    });

    if (pendingLeads.length === 0) return { success: true, message: "Sem leads pendentes." };

    let successCount = 0;
    for (const lead of pendingLeads) {
        try {
            await initiateRaquelContact(lead.id);
            await db.update(leads)
                .set({ status: "active", updatedAt: new Date() })
                .where(eq(leads.id, lead.id));
            successCount++;
        } catch (err) {
            console.error(`Erro ao processar lead ${lead.id} do usuário ${userId}:`, err);
        }
    }

    revalidatePath("/leads");
    return { success: true, contacted: successCount };
}
