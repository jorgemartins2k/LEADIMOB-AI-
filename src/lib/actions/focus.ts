"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, workSchedules } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getOrCreateInternalUser } from "@/lib/auth-utils";

export async function getDailyFocus() {
    try {
        const user = await getOrCreateInternalUser();

        if (!user.dailyFocus || !user.dailyFocusDate) {
            return null;
        }

        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        const todayStr = now.toISOString().split('T')[0];
        const focusDateStr = new Date(user.dailyFocusDate).toISOString().split('T')[0];

        // Se a data do foco for menor que hoje, limpa (ex: foi marcado ontém e o expediente já passou)
        if (focusDateStr < todayStr) {
            await clearDailyFocus(user.id);
            return null;
        }

        // Se a data do foco for hoje, verifica se já passou do fim do expediente
        if (focusDateStr === todayStr) {
            const currentDayOfWeek = now.getDay(); // 0 is Sunday in JS
            const schedule = await db.query.workSchedules.findFirst({
                where: and(
                    eq(workSchedules.userId, user.id),
                    eq(workSchedules.dayOfWeek, currentDayOfWeek)
                )
            });

            if (schedule && currentHour > schedule.endTime) {
                // Passou do horário de expediente de hoje
                await clearDailyFocus(user.id);
                return null;
            }
        }

        // Se a data for hoje e ainda estiver no expediente, ou se for amanhã (marcado pós-expediente)
        return user.dailyFocus;

    } catch (error) {
        console.error("Error fetching daily focus:", error);
        return null;
    }
}

export async function setDailyFocus(focusText: string) {
    try {
        const user = await getOrCreateInternalUser();

        if (!focusText || focusText.trim() === "") {
            await clearDailyFocus(user.id);
            return { success: true, text: null };
        }

        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        const currentDayOfWeek = now.getDay();

        let focusDate = new Date(); // Hoje por padrão

        // Pegar o expediente de hoje para ver se marcou DEPOIS do expediente
        const schedule = await db.query.workSchedules.findFirst({
            where: and(
                eq(workSchedules.userId, user.id),
                eq(workSchedules.dayOfWeek, currentDayOfWeek)
            )
        });

        // Se o corretor setar isso depois do expediente, assume que é para o próximo dia útil
        if (schedule && currentHour > schedule.endTime) {
            focusDate.setDate(focusDate.getDate() + 1);
        }

        await db.update(users).set({
            dailyFocus: focusText,
            dailyFocusDate: focusDate.toISOString().split('T')[0]
        }).where(eq(users.id, user.id));

        return { success: true, text: focusText };
    } catch (error) {
        console.error("Error setting daily focus:", error);
        return { error: "Erro ao salvar foco diário" };
    }
}

async function clearDailyFocus(userId: string) {
    await db.update(users).set({
        dailyFocus: null,
        dailyFocusDate: null
    }).where(eq(users.id, userId));
}
