
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
        console.log("Criando tabela best_leads_ranking...");
        await sql`
            CREATE TABLE IF NOT EXISTS best_leads_ranking (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
                rank SMALLINT NOT NULL,
                lead_summary TEXT NOT NULL,
                interaction_highlights TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;

        console.log("Criando RPC increment_lead_ranks...");
        await sql`
            CREATE OR REPLACE FUNCTION increment_lead_ranks(p_user_id UUID)
            RETURNS VOID AS $$
            BEGIN
              UPDATE best_leads_ranking
              SET rank = rank + 1
              WHERE user_id = p_user_id;
            END;
            $$ LANGUAGE plpgsql;
        `;

        console.log("Setup concluído com sucesso!");
    } catch (err) {
        console.error("Erro no setup:", err);
    } finally {
        await sql.end();
    }
}

setup();
