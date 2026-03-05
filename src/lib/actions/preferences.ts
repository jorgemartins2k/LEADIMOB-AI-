"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveNotificationPreferences(data: {
    dailyReport: boolean;
    hotLeadAlert: boolean;
    browserPush: boolean;
    weeklyPerformance: boolean;
}) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { error: "Não autorizado" };

    try {
        await db
            .update(users)
            .set({
                dailyReport: data.dailyReport,
                hotLeadAlert: data.hotLeadAlert,
                browserPush: data.browserPush,
                weeklyPerformance: data.weeklyPerformance,
                updatedAt: new Date(),
            })
            .where(eq(users.clerkUserId, clerkUserId));

        revalidatePath("/configuracoes");
        return { success: true };
    } catch (error: any) {
        console.error("Error saving preferences:", error);
        return { error: error.message || "Erro ao salvar preferências." };
    }
}

export async function getNotificationPreferences() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { error: "Não autorizado" };

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.clerkUserId, clerkUserId),
            columns: {
                dailyReport: true,
                hotLeadAlert: true,
                browserPush: true,
                weeklyPerformance: true,
            },
        });
        if (!user) return { error: "Usuário não encontrado" };
        return { success: true, preferences: user };
    } catch (error: any) {
        console.error("Error fetching preferences:", error);
        return { error: error.message || "Erro ao buscar preferências." };
    }
}
