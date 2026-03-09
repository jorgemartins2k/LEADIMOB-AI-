"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getOrCreateInternalUser } from "@/lib/auth-utils";

export async function saveNotificationPreferences(data: {
    dailyReport: boolean;
    hotLeadAlert: boolean;
    browserPush: boolean;
    weeklyPerformance: boolean;
}) {
    try {
        const user = await getOrCreateInternalUser();

        await db
            .update(users)
            .set({
                dailyReport: data.dailyReport,
                hotLeadAlert: data.hotLeadAlert,
                browserPush: data.browserPush,
                weeklyPerformance: data.weeklyPerformance,
                updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

        revalidatePath("/configuracoes");
        return { success: true };
    } catch (error: any) {
        console.error("Error saving preferences:", error);
        return { error: error.message || "Erro ao salvar preferências." };
    }
}

export async function getNotificationPreferences() {
    try {
        const user = await getOrCreateInternalUser();

        const userData = await db.query.users.findFirst({
            where: eq(users.id, user.id),
            columns: {
                dailyReport: true,
                hotLeadAlert: true,
                browserPush: true,
                weeklyPerformance: true,
            },
        });
        if (!userData) return { error: "Usuário não encontrado" };
        return { success: true, preferences: userData };
    } catch (error: any) {
        console.error("Error fetching preferences:", error);
        return { error: error.message || "Erro ao buscar preferências." };
    }
}
