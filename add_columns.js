require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);

async function main() {
    try {
        await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_count integer DEFAULT 0`;
        await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_follow_up_at timestamptz`;
        console.log('✅ Columns added successfully.');
    } catch (e) {
        console.error('❌ Error adding columns:', e.message);
    } finally {
        await sql.end();
    }
}
main();
