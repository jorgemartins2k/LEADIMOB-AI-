const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function check() {
    const sql = postgres(process.env.DATABASE_URL);
    try {
        console.log('\nVerificando tabela: leads');
        const columns = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'leads'
            ORDER BY ordinal_position;
        `;
        console.table(columns.map(c => ({
            coluna: c.column_name,
            tipo: c.data_type,
            nulo: c.is_nullable,
            default: c.column_default
        })));
    } catch (err) {
        console.error('Erro:', err);
    } finally {
        await sql.end();
    }
}
check();
