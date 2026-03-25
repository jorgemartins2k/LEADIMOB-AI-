
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

async function setup() {
    try {
        console.log("Criando tabela broker_notifications...");
        await sql`
            CREATE TABLE IF NOT EXISTS broker_notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
                type TEXT NOT NULL DEFAULT 'hot_lead',
                message TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'unread',
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;
        console.log("Setup concluído com sucesso!");
    } catch (err) {
        console.error("Erro no setup:", err);
    } finally {
        await sql.end();
    }
}

setup();
