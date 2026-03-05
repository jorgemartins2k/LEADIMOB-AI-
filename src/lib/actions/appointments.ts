"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { appointments, users } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const appointmentSchema = z.object({
    leadId: z.string().uuid().optional(),
    propertyId: z.string().uuid().optional(),
    launchId: z.string().uuid().optional(),
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
    appointmentDate: z.string().min(1, "Informe a data do agendamento"),
    appointmentTime: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
});

import { getOrCreateInternalUser } from "@/lib/auth-utils";

export async function getAppointments() {
    const user = await getOrCreateInternalUser();
    return db.query.appointments.findMany({
        where: and(eq(appointments.userId, user.id)),
        orderBy: [asc(appointments.appointmentDate), asc(appointments.appointmentTime)],
        with: {
            // lead: true,
            // property: true,
            // launch: true,
        }
    });
}

export async function createAppointment(data: z.infer<typeof appointmentSchema>) {
    try {
        const user = await getOrCreateInternalUser();
        const validated = appointmentSchema.parse(data);

        await db.insert(appointments).values({
            userId: user.id,
            leadId: validated.leadId || null,
            propertyId: validated.propertyId || null,
            launchId: validated.launchId || null,
            title: validated.title,
            appointmentDate: validated.appointmentDate,
            appointmentTime: validated.appointmentTime || null,
            notes: validated.notes || null,
            status: validated.status,
        });

        revalidatePath("/agenda");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (err: any) {
        console.error(err);
        return { error: err.message || "Erro ao agendar compromisso." };
    }
}

export async function updateAppointmentStatus(id: string, status: "scheduled" | "completed" | "cancelled") {
    const user = await getOrCreateInternalUser();

    await db
        .update(appointments)
        .set({ status, updatedAt: new Date() })
        .where(and(eq(appointments.id, id), eq(appointments.userId, user.id)));

    revalidatePath("/agenda");
    return { success: true };
}

export async function deleteAppointment(id: string) {
    const user = await getOrCreateInternalUser();

    await db
        .delete(appointments)
        .where(and(eq(appointments.id, id), eq(appointments.userId, user.id)));

    revalidatePath("/agenda");
    return { success: true };
}
