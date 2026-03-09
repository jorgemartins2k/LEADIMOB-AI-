"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getOrCreateInternalUser } from "@/lib/auth-utils";

export async function updateProfile(data: {
    name: string;
    whatsapp?: string;
    realEstateAgency?: string;
    creci?: string;
    presentation?: string;
    email?: string;
}): Promise<{ success?: boolean; error?: string }> {
    try {
        const user = await getOrCreateInternalUser();

        await db
            .update(users)
            .set({
                name: data.name,
                whatsapp: data.whatsapp,
                email: data.email,
                realEstateAgency: data.realEstateAgency,
                creci: data.creci,
                presentation: data.presentation,
                updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

        revalidatePath("/configuracoes");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Erro ao atualizar perfil." };
    }
}

export async function getProfile() {
    return getOrCreateInternalUser();
}

export async function saveAvatarUrl(avatarUrl: string) {
    try {
        const user = await getOrCreateInternalUser();

        await db
            .update(users)
            .set({ avatarUrl, updatedAt: new Date() })
            .where(eq(users.id, user.id));

        revalidatePath("/configuracoes");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Erro ao salvar foto." };
    }
}
