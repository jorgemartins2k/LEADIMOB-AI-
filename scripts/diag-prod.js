const postgres = require('postgres');

async function check() {
    const url = "postgresql://postgres.wwwtuduxxcslpcpgjzya:Leadimob2026@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
    const sql = postgres(url);

    console.log('--- Diagnóstico de Produção (Lista Completa de Colunas) ---');

    try {
        const columns = await sql`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'users' AND table_schema = 'public'
            ORDER BY ordinal_position;
        `;

        if (columns.length === 0) {
            console.log('ERRO: Tabela public.users NÃO ENCONTRADA!');
        } else {
            console.log('Colunas encontradas em public.users:');
            columns.forEach(c => console.log(`- ${c.column_name}`));
        }

    } catch (err) {
        console.error('Erro no diagnóstico:', err);
    } finally {
        await sql.end();
    }
}

check();
