"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { campaigns, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getOrCreateInternalUser } from "@/lib/auth-utils";

export async function getCampaigns() {
    try {
        const user = await getOrCreateInternalUser();

        return await db.query.campaigns.findMany({
            where: eq(campaigns.userId, user.id),
            orderBy: [desc(campaigns.createdAt)],
            with: {
                property: true,
                launch: true,
            }
        });
    } catch (e: any) {
        console.error("Error fetching campaigns:", e);
        return [];
    }
}

export async function createCampaign(data: {
    title: string;
    contentType: string;
    propertyId?: string | null;
    launchId?: string | null;
}) {
    try {
        const user = await getOrCreateInternalUser();

        // Link generation
        const slug = data.title.toLowerCase().replace(/\s+/g, '-').substring(0, 20) + '-' + Math.random().toString(36).substring(2, 6);
        const trackingLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://leadimob.ai'}/c/${slug}`;

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
    try {
        const user = await getOrCreateInternalUser();

        await db.delete(campaigns).where(and(eq(campaigns.id, id), eq(campaigns.userId, user.id)));
        revalidatePath("/campanhas");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Erro ao excluir campanha." };
    }
}
