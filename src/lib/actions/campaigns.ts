"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { campaigns, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCampaigns() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Não autorizado");

    const user = await db.query.users.findFirst({
        where: eq(users.clerkUserId, clerkUserId),
    });

    if (!user) throw new Error("Usuário não encontrado");

    return await db.query.campaigns.findMany({
        where: eq(campaigns.userId, user.id),
        orderBy: [desc(campaigns.createdAt)],
    });
}

export async function createCampaign(data: {
    title: string;
    contentType: string;
    propertyId?: string | null;
    launchId?: string | null;
}) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Não autorizado");

    const user = await db.query.users.findFirst({
        where: eq(users.clerkUserId, clerkUserId),
    });

    if (!user) throw new Error("Usuário não encontrado");

    // Link generation
    const slug = data.title.toLowerCase().replace(/\s+/g, '-').substring(0, 20) + '-' + Math.random().toString(36).substring(2, 6);
    const trackingLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://leadimob.ai'}/c/${slug}`;

    try {
        await db.insert(campaigns).values({
            userId: user.id,
            title: data.title,
            slug,
            contentType: data.contentType,
            trackingLink,
            propertyId: data.propertyId || null,
            launchId: data.launchId || null,
            status: "active",
        });

        revalidatePath("/campanhas");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating campaign:", error);
        return { error: error.message || "Erro ao criar campanha." };
    }
}

export async function deleteCampaign(id: string) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Não autorizado");

    try {
        await db.delete(campaigns).where(eq(campaigns.id, id));
        revalidatePath("/campanhas");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Erro ao excluir campanha." };
    }
}
