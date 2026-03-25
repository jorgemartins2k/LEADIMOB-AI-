
import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error("DATABASE_URL is missing!");
    process.exit(1);
}

const sql = postgres(dbUrl);

async function cleanup() {
    try {
        console.log("Limpando notificações pendentes...");

        // 1. Limpa a tabela de notificações do painel
        const deletedNotifications = await sql`DELETE FROM broker_notifications RETURNING id`;
        console.log(`✅ ${deletedNotifications.length} notificações removidas.`);

        // 2. Reseta status de leads que estavam em fluxo de alerta
        const updatedLeads = await sql`
            UPDATE leads 
            SET status = 'active', transferred_at = NULL 
            WHERE status IN ('hot_alert_sent', 'hot_alert_retry', 'hot_alert_final')
            RETURNING id
        `;
        console.log(`✅ ${updatedLeads.length} leads resetados para status 'active'.`);

        console.log("Cleanup concluído com sucesso! Pronto para começar do zero. 🚀");
    } catch (err) {
        console.error("Erro no cleanup:", err);
    } finally {
        await sql.end();
    }
}

cleanup();
