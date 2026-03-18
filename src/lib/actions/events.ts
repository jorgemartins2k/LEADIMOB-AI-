"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { events, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const eventSchema = z.object({
    name: z.string().min(3, "O nome do evento deve ter pelo menos 3 caracteres"),
    eventDate: z.string().min(1, "Informe a data do evento"),
    eventTime: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    targetAudience: z.array(z.string()).default([]),
    standard: z.enum(["economico", "medio", "alto"]).optional(),
});

import { getOrCreateInternalUser } from "@/lib/auth-utils";

export async function getEvents() {
    try {
        const user = await getOrCreateInternalUser();
        if (!user) return [];

        const results = await db.select().from(events)
            .where(eq(events.userId, user.id))
            .orderBy(desc(events.eventDate));

        return results;
    } catch (error) {
        console.error("Error in getEvents server action:", error);
        return [];
    }
}

export async function createEvent(data: z.infer<typeof eventSchema>) {
    try {
        const user = await getOrCreateInternalUser();
        const validated = eventSchema.parse(data);

        await db.insert(events).values({
            userId: user.id,
            name: validated.name,
            eventDate: validated.eventDate, // String YYYY-MM-DD
            eventTime: validated.eventTime || null,
            location: validated.location || null,
            description: validated.description || null,
            targetAudience: validated.targetAudience,
            standard: validated.standard || null,
        });

        revalidatePath("/eventos");
        revalidatePath("/agenda");
        return { success: true };
    } catch (err: any) {
        console.error(err);
        return { error: err.message || "Erro ao agendar evento." };
    }
}

export async function getEventById(id: string) {
    try {
        const user = await getOrCreateInternalUser();
        const event = await db.query.events.findFirst({
            where: and(eq(events.id, id), eq(events.userId, user.id))
        });
        if (!event) return null;
        return {
            ...event,
            id: String(event.id),
            userId: String(event.userId),
            targetAudience: Array.isArray(event.targetAudience) ? event.targetAudience : []
        };
    } catch (error) {
        console.error("Critical Error fetching event by ID:", error);
        return null;
    }
}

export async function updateEvent(id: string, data: z.infer<typeof eventSchema>) {
    try {
        const user = await getOrCreateInternalUser();
        const validated = eventSchema.parse(data);

        await db.update(events).set({
            name: validated.name,
            eventDate: validated.eventDate,
            eventTime: validated.eventTime || null,
            location: validated.location || null,
            description: validated.description || null,
            targetAudience: validated.targetAudience,
            standard: validated.standard || null,
        }).where(and(eq(events.id, id), eq(events.userId, user.id)));

        revalidatePath("/eventos");
        revalidatePath("/agenda");
        revalidatePath(`/eventos/${id}`);
        return { success: true };
    } catch (err: any) {
        console.error(err);
        return { error: err.message || "Erro ao atualizar evento." };
    }
}

export async function deleteEvent(id: string) {
    const user = await getOrCreateInternalUser();

    await db
        .delete(events)
        .where(and(eq(events.id, id), eq(events.userId, user.id)));

    revalidatePath("/eventos");
    revalidatePath("/agenda");
    return { success: true };
}
