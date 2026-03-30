"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { eq, and, desc, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getOrCreateInternalUser } from "@/lib/auth-utils";

export async function getCrmLeads() {
    const user = await getOrCreateInternalUser();

    // Fetch all leads EXCEPT the ones strictly waiting in the daily queue
    // We also fetch waiting ones because the user might drag them or want full visibility in the CRM
    return db.query.leads.findMany({
        where: and(eq(leads.userId, user.id)),
        orderBy: [desc(leads.updatedAt)],
    });
}

export async function updateLeadStatus(leadId: string, newStatus: string) {
    const user = await getOrCreateInternalUser();

    try {
        await db.update(leads)
            .set({
                status: newStatus,
                updatedAt: new Date(),
                // Se finalizar, zera o contador de follow-up
                ...(newStatus === 'completed' || newStatus === 'won' || newStatus === 'abandoned' ? { followUpCount: 0 } : {})
            })
            .where(and(eq(leads.id, leadId), eq(leads.userId, user.id)));

        revalidatePath("/crm");
        revalidatePath("/leads");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (err: any) {
        console.error("Database error in updateLeadStatus:", err);
        return { error: `Erro no banco de dados: ${err.message || String(err)}` };
    }
}
