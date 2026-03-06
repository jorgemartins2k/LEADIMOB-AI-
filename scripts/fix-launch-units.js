const postgres = require('postgres');

async function fix() {
    const url = "postgresql://postgres.wwwtuduxxcslpcpgjzya:Leadimob2026@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
    const sql = postgres(url);

    console.log('--- Corrigindo Esquema de Produção (launch_units) ---');

    try {
        console.log('Adicionando coluna target_audience à tabela launch_units...');
        await sql`
            ALTER TABLE launch_units 
            ADD COLUMN IF NOT EXISTS target_audience text[] DEFAULT '{}' NOT NULL;
        `;
        console.log('Sucesso: Coluna target_audience adicionada!');

    } catch (err) {
        console.error('Erro ao corrigir esquema:', err);
    } finally {
        await sql.end();
    }
}

fix();
