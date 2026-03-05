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
    const user = await getOrCreateInternalUser();
    return db.query.events.findMany({
        where: and(eq(events.userId, user.id)),
        orderBy: [desc(events.eventDate)],
    });
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

export async function deleteEvent(id: string) {
    const user = await getOrCreateInternalUser();

    await db
        .delete(events)
        .where(and(eq(events.id, id), eq(events.userId, user.id)));

    revalidatePath("/eventos");
    revalidatePath("/agenda");
    return { success: true };
}
