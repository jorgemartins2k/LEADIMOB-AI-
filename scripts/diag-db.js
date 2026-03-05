const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function check() {
    const sql = postgres(process.env.DATABASE_URL);

    console.log('--- Diagnóstico de Banco de Dados ---');

    try {
        const tables = ['users', 'leads', 'properties', 'launches', 'launch_units', 'events', 'appointments'];

        for (const table of tables) {
            console.log(`\nVerificando tabela: ${table}`);
            const columns = await sql`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = ${table}
                ORDER BY ordinal_position;
            `;
            console.table(columns.map(c => ({
                coluna: c.column_name,
                tipo: c.data_type,
                nulo: c.is_nullable,
                default: c.column_default
            })));
        }

        const userCount = await sql`SELECT count(*) FROM users`;
        console.log(`\nTotal de usuários: ${userCount[0].count}`);

        if (userCount[0].count > 0) {
            const lastUser = await sql`SELECT id, name, clerk_user_id FROM users LIMIT 1`;
            console.log('Exemplo de usuário:', lastUser[0]);
        }

    } catch (err) {
        console.error('Erro no diagnóstico:', err);
    } finally {
        await sql.end();
    }
}

check();
