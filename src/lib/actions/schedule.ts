"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, workSchedules } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getOrCreateInternalUser } from "@/lib/auth-utils";

export async function getWorkSchedules() {
    try {
        const user = await getOrCreateInternalUser();
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
        const user = await getOrCreateInternalUser();

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
