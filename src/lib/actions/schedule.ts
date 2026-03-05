"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, workSchedules } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getWorkSchedules() {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) return [];

        const user = await db.query.users.findFirst({
            where: eq(users.clerkUserId, clerkUserId),
        });

        if (!user) return [];

        return db.query.workSchedules.findMany({
            where: eq(workSchedules.userId, user.id),
        });
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function saveWorkSchedules(data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
}[]): Promise<{ success?: boolean; error?: string }> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) throw new Error("Não autorizado");

        // 1. Buscar o ID interno do usuário no Supabase
        const user = await db.query.users.findFirst({
            where: eq(users.clerkUserId, clerkUserId),
        });

        if (!user) throw new Error("Usuário não encontrado no banco");

        // 2. Salvar individualmente (upsert logic)
        for (const schedule of data) {
            await db
                .insert(workSchedules)
                .values({
                    userId: user.id,
                    dayOfWeek: schedule.dayOfWeek,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    isActive: schedule.isActive,
                })
                .onConflictDoUpdate({
                    target: [workSchedules.userId, workSchedules.dayOfWeek],
                    set: {
                        startTime: schedule.startTime,
                        endTime: schedule.endTime,
                        isActive: schedule.isActive,
                        updatedAt: new Date(),
                    },
                });
        }

        revalidatePath("/configuracoes");
        return { success: true };
    } catch (error: any) {
        console.error(error);
        return { error: error.message || "Erro ao salvar horários." };
    }
}
