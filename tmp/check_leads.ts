
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

async function check() {
    try {
        const leads = await sql`SELECT name, phone FROM leads LIMIT 10`;
        console.log("Leads no banco:");
        leads.forEach(l => console.log(`- ${l.name}: ${l.phone}`));
    } catch (err) {
        console.error("Erro ao verificar leads:", err);
    } finally {
        await sql.end();
    }
}

check();
