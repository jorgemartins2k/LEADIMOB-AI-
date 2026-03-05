"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, workSchedules, properties, launches } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

export async function getOnboardingStatus() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Não autorizado");

    const user = await db.query.users.findFirst({
        where: eq(users.clerkUserId, clerkUserId),
    });

    if (!user) return null;

    // 1. Check Profile
    const profileCompleted = !!(user.name && user.creci && user.presentation);

    // 2. Check WhatsApp
    const whatsappCompleted = !!user.whatsapp;

    // 3. Check Schedule
    const schedulesCount = await db
        .select({ value: count() })
        .from(workSchedules)
        .where(eq(workSchedules.userId, user.id));
    const scheduleCompleted = schedulesCount[0].value > 0;

    // 4. Check Properties/Launches
    const propertiesCount = await db
        .select({ value: count() })
        .from(properties)
        .where(eq(properties.userId, user.id));

    const launchesCount = await db
        .select({ value: count() })
        .from(launches)
        .where(eq(launches.userId, user.id));

    const inventoryCompleted = propertiesCount[0].value > 0 || launchesCount[0].value > 0;

    return [
        { id: "profile", completed: profileCompleted },
        { id: "whatsapp", completed: whatsappCompleted },
        { id: "schedule", completed: scheduleCompleted },
        { id: "properties", completed: inventoryCompleted },
    ];
}
