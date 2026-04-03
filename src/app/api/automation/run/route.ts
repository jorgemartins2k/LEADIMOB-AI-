import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { processUserAutomation } from "@/lib/actions/leads";

/**
 * Endpoint de automação em background — disparado pelo Vercel Cron a cada 10 minutos.
 * Segurança: verificação via CRON_SECRET (variável de ambiente, nunca hardcoded).
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    // Verificação de segurança via CRON_SECRET no ambiente
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && key !== cronSecret) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    try {
        console.log("[Automation] Iniciando varredura de leads...");

        const allUsers = await db.select().from(users);
        const results = [];

        for (const user of allUsers) {
            try {
                const result = await processUserAutomation(user.id);
                if (result.success && (result.contacted ?? 0) > 0) {
                    results.push({
                        userName: user.name,
                        contacted: result.contacted,
                    });
                }
            } catch (userErr) {
                console.error(`[Automation] Erro ao processar usuário ${user.id}:`, userErr);
            }
        }

        console.log(`[Automation] Finalizado. ${results.length} sessões ativas.`);

        return NextResponse.json({
            success: true,
            sessions_active: results.length,
            details: results,
        });
    } catch (error: any) {
        console.error("[Automation] Erro crítico:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
