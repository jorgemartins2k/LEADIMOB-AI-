
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
        const users = await sql`SELECT name, whatsapp FROM users`;
        console.log("Brokers registrados:");
        users.forEach(u => console.log(`- ${u.name}: ${u.whatsapp}`));
    } catch (err) {
        console.error("Erro ao verificar brokers:", err);
    } finally {
        await sql.end();
    }
}

check();
