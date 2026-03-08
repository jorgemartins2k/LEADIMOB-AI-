import { db } from "@/lib/db";
import { leads, users } from "@/lib/db/schema";
import { eq, and, gte, count, sql } from "drizzle-orm";

export const PLAN_LIMITS = {
    start: 150,
    pro: 450,
    premium: 900,
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

/**
 * Gets the number of days in the current month
 */
export function getDaysInCurrentMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/**
 * Calculates the daily limit for a specific plan
 */
export function calculateDailyLimit(plan: string | null) {
    const monthlyLimit = PLAN_LIMITS[plan as PlanType] || PLAN_LIMITS.start;
    const daysInMonth = getDaysInCurrentMonth();
    return Math.ceil(monthlyLimit / daysInMonth);
}

/**
 * Returns how many leads have been added today by the user
 */
export async function getLeadsAddedToday(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    const result = await db
        .select({ value: count() })
        .from(leads)
        .where(
            and(
                eq(leads.userId, userId),
                eq(leads.scheduledDate, today) // leads use scheduledDate for the day they were added
            )
        );

    return result[0]?.value || 0;
}

/**
 * Returns the status of leads for today: limit, current count, and remaining slots
 */
export async function getLeadLimitStatus(userId: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { plan: true }
    });

    const dailyLimit = calculateDailyLimit(user?.plan || 'start');
    const addedToday = await getLeadsAddedToday(userId);
    const remaining = Math.max(0, dailyLimit - addedToday);

    return {
        dailyLimit,
        addedToday,
        remaining,
        plan: user?.plan || 'start'
    };
}
