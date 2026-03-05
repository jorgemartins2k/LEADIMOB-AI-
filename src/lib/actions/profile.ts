"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: {
    name: string;
    whatsapp?: string;
    realEstateAgency?: string;
    creci?: string;
    presentation?: string;
    email?: string;
}): Promise<{ success?: boolean; error?: string }> {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Não autorizado");

    try {
        await db
            .update(users)
            .set({
                name: data.name,
                whatsapp: data.whatsapp,
                realEstateAgency: data.realEstateAgency,
                creci: data.creci,
                presentation: data.presentation,
                updatedAt: new Date(),
            })
            .where(eq(users.clerkUserId, clerkUserId));

        revalidatePath("/configuracoes");
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Erro ao atualizar perfil." };
    }
}

export async function getProfile() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Não autorizado");

    const user = await db.query.users.findFirst({
        where: eq(users.clerkUserId, clerkUserId),
    });

    return user;
}

export async function saveAvatarUrl(avatarUrl: string) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { error: "Não autorizado" };

    try {
        await db
            .update(users)
            .set({ avatarUrl, updatedAt: new Date() })
            .where(eq(users.clerkUserId, clerkUserId));

        revalidatePath("/configuracoes");
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Erro ao salvar foto." };
    }
}
