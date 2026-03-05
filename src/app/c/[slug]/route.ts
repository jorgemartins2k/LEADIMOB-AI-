import { db } from "@/lib/db";
import { campaigns, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    const { slug } = params;

    try {
        // 1. Find campaign
        const campaign = await db.query.campaigns.findFirst({
            where: eq(campaigns.slug, slug),
        });

        if (!campaign) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        // 2. Find broker (user)
        const broker = await db.query.users.findFirst({
            where: eq(users.id, campaign.userId),
        });

        if (!broker || !broker.whatsapp) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        // 3. Increment totalClicks
        await db.update(campaigns)
            .set({ totalClicks: sql`${campaigns.totalClicks} + 1` })
            .where(eq(campaigns.id, campaign.id));

        // 4. Redirect to WhatsApp with pre-filled message
        // Identifying the campaign helps Raquel know where the lead came from if they send the message.
        const message = encodeURIComponent(`Olá ${broker.name}, vi seu anúncio "${campaign.title}" e gostaria de mais informações. [REF:${campaign.id}]`);
        const cleanPhone = broker.whatsapp.replace(/\D/g, "");
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;

        return NextResponse.redirect(new URL(whatsappUrl));
    } catch (error) {
        console.error("Tracking route error:", error);
        return NextResponse.redirect(new URL("/", request.url));
    }
}
