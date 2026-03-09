"use server";

import { db } from "@/lib/db";
import { leads, properties, launches, appointments } from "@/lib/db/schema";
import { eq, and, gte, sql, count, desc } from "drizzle-orm";
import { getOrCreateInternalUser } from "@/lib/auth-utils";

export async function getDashboardStats() {
    try {
        const user = await getOrCreateInternalUser();
        const userId = user.id;

        // 1. Leads Ativos
        const leadsCountResult = await db
            .select({ value: count() })
            .from(leads)
            .where(eq(leads.userId, userId));

        // 2. Meus Imóveis
        const propertiesCountResult = await db
            .select({ value: count() })
            .from(properties)
            .where(eq(properties.userId, userId));

        // 3. Lançamentos
        const launchesCountResult = await db
            .select({ value: count() })
            .from(launches)
            .where(eq(launches.userId, userId));

        // 4. Agenda Hoje (Contagem e Lista)
        const today = new Date().toISOString().split('T')[0];

        const todayAppointmentsCountResult = await db
            .select({ value: count() })
            .from(appointments)
            .where(
                and(
                    eq(appointments.userId, userId),
                    eq(appointments.appointmentDate, today)
                )
            );

        const todayAppointmentsList = await db
            .select()
            .from(appointments)
            .where(
                and(
                    eq(appointments.userId, userId),
                    eq(appointments.appointmentDate, today)
                )
            )
            .orderBy(appointments.appointmentTime)
            .limit(3);

        // 5. Raquel Insights (Leads quentes/muito quentes nas últimas 24h)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const hotLeadsInsightResult = await db
            .select({ value: count() })
            .from(leads)
            .where(
                and(
                    eq(leads.userId, userId),
                    sql`${leads.temperature} IN ('quente', 'very_hot')`,
                    gte(leads.updatedAt, twentyFourHoursAgo)
                )
            );

        return {
            leads: leadsCountResult[0].value || 0,
            properties: propertiesCountResult[0].value || 0,
            launches: launchesCountResult[0].value || 0,
            appointmentsCount: todayAppointmentsCountResult[0].value || 0,
            appointments: todayAppointmentsList,
            hotLeadsInsight: hotLeadsInsightResult[0].value || 0
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
            leads: 0,
            properties: 0,
            launches: 0,
            appointmentsCount: 0,
            appointments: [],
            hotLeadsInsight: 0
        };
    }
}
