import { db } from "@/lib/db";
import { workSchedules } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Checks if a user is currently within their defined business hours.
 * Returns true if the user is in an active schedule slot, false otherwise.
 */
export async function isCurrentlyInBusinessHours(userId: string): Promise<boolean> {
    // Forçar fuso de Brasília (America/Sao_Paulo) independente de onde o servidor está rodando
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    // database day: 0 (Sun) - 6 (Sat)
    const dayOfWeek = now.getDay();

    const schedules = await db.query.workSchedules.findMany({
        where: and(
            eq(workSchedules.userId, userId),
            eq(workSchedules.dayOfWeek, dayOfWeek),
            eq(workSchedules.isActive, true)
        )
    });

    if (schedules.length === 0) return false;

    // Current time as string for comparison (HH:mm:ss)
    const currentTime = now.toTimeString().split(' ')[0];

    return schedules.some(slot => {
        return currentTime >= slot.startTime && currentTime <= slot.endTime;
    });
}

/**
 * Gets the next available start time for AI contact based on work schedules.
 * If currently in business hours, it might return 'now'.
 */
export async function getNextBusinessSessionStart(userId: string): Promise<Date | null> {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));

    // Check next 7 days
    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() + i);
        const dayOfWeek = checkDate.getDay();

        const schedules = await db.query.workSchedules.findMany({
            where: and(
                eq(workSchedules.userId, userId),
                eq(workSchedules.dayOfWeek, dayOfWeek),
                eq(workSchedules.isActive, true)
            ),
            orderBy: (sc, { asc }) => [asc(sc.startTime)]
        });

        for (const slot of schedules) {
            const [hours, minutes, seconds] = slot.startTime.split(':').map(Number);
            const startDateTime = new Date(checkDate);
            startDateTime.setHours(hours, minutes, seconds || 0, 0);

            if (startDateTime > now) {
                return startDateTime;
            }
        }
    }

    return null;
}
