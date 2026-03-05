const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const sql = postgres(process.env.DATABASE_URL);

    console.log('--- Verificando e Atualizando Schema ---');

    try {
        // 1. Users Table
        console.log('Atualizando tabela users...');
        await sql.unsafe(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS creci TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS presentation TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'start';
            ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_cycle_start DATE NOT NULL DEFAULT CURRENT_DATE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_report BOOLEAN DEFAULT TRUE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS hot_lead_alert BOOLEAN DEFAULT TRUE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS browser_push BOOLEAN DEFAULT TRUE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS weekly_performance BOOLEAN DEFAULT TRUE;
        `);

        // 2. Campaigns Table
        console.log('Atualizando tabela campaigns...');
        await sql.unsafe(`
            ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS slug TEXT;
        `);

        // Fill slugs for existing campaigns if any
        const existingCampaigns = await sql`SELECT id, title FROM campaigns WHERE slug IS NULL`;
        for (const camp of existingCampaigns) {
            const slug = camp.title.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
            await sql`UPDATE campaigns SET slug = ${slug} WHERE id = ${camp.id}`;
        }

        const missingSlugCheck = await sql`SELECT count(*) FROM campaigns WHERE slug IS NULL`;
        if (parseInt(missingSlugCheck[0].count) === 0) {
            try {
                await sql.unsafe(`
                    ALTER TABLE campaigns ALTER COLUMN slug SET NOT NULL;
                    ALTER TABLE campaigns ADD CONSTRAINT campaigns_slug_unique UNIQUE (slug);
                `);
            } catch (e) {
                console.log('Nota: Constraint de slug já existe ou não pôde ser aplicada.');
            }
        }

        // 3. Leads Table
        console.log('Atualizando tabela leads...');
        await sql.unsafe(`
            ALTER TABLE leads ADD COLUMN IF NOT EXISTS temperature TEXT NOT NULL DEFAULT 'morno';
        `);

        console.log('--- Schema Atualizado com Sucesso! ---');
    } catch (err) {
        console.error('Erro ao atualizar schema:', err);
    } finally {
        await sql.end();
    }
}

run();
