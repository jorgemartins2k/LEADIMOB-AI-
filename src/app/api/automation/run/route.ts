import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { processUserAutomation } from "@/lib/actions/leads";

/**
 * background automation endpoint.
 * can be triggered by a CRON job (e.g. Vercel Cron)
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    // Basic security check (Optional: define CRON_SECRET in .env)
    if (process.env.CRON_SECRET && key !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        console.log("[Automation] Starting background process...");

        // 1. Get all users
        const allUsers = await db.select().from(users);

        const results = [];

        // 2. Process each user
        for (const user of allUsers) {
            try {
                const result = await processUserAutomation(user.id);
                if (result.success && result.contacted! > 0) {
                    results.push({
                        userName: user.name,
                        contacted: result.contacted
                    });
                }
            } catch (userErr) {
                console.error(`[Automation] Error processing user ${user.id}:`, userErr);
            }
        }

        console.log(`[Automation] Finished. Processed ${results.length} active sessions.`);

        return NextResponse.json({
            success: true,
            sessions_active: results.length,
            details: results
        });
    } catch (error: any) {
        console.error("[Automation] Critical Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
