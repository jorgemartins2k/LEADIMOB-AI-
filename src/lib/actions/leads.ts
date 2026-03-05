"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { leads, users } from "@/lib/db/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { initiateRaquelContact } from "@/lib/ai/raquel";

const leadSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    phone: z.string().min(10, "Informe um telefone válido (DDD + Número)"),
    source: z.string().optional(),
    temperature: z.enum(["frio", "morno", "quente"]).optional(),
    notes: z.string().optional(),
});

async function getInternalUser() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Não autorizado");

    const user = await db.query.users.findFirst({
        where: eq(users.clerkUserId, clerkUserId),
    });

    if (!user) throw new Error("Usuário não encontrado");
    return user;
}

export async function getLeads() {
    const user = await getInternalUser();
    return db.query.leads.findMany({
        where: and(eq(leads.userId, user.id)),
        orderBy: [desc(leads.createdAt)],
    });
}

export async function checkQuarantine(phone: string) {
    const user = await getInternalUser();

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
    const user = await getInternalUser();
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
        await initiateRaquelContact(newLeadId);

        revalidatePath("/leads");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (err) {
        console.error(err);
        return { error: "Erro ao criar lead no banco de dados." };
    }
}

export async function deleteLead(id: string) {
    const user = await getInternalUser();

    await db
        .delete(leads)
        .where(and(eq(leads.id, id), eq(leads.userId, user.id)));

    revalidatePath("/leads");
    return { success: true };
}
