const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

// Carregar .env.local manualmente para garantir que pegamos o DATABASE_URL
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=(.*)/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1].trim() : null;

if (!dbUrl) {
    console.error("Erro: DATABASE_URL não encontrado no .env.local");
    process.exit(1);
}

const sql = postgres(dbUrl);

async function fix() {
    console.log("Tentando adicionar colunas na tabela 'users'...");
    try {
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;`;
        console.log("✅ Coluna 'city' verificada/adicionada.");
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS metropolitan_regions TEXT;`;
        console.log("✅ Coluna 'metropolitan_regions' verificada/adicionada.");
        console.log("🎉 Banco de dados sincronizado com sucesso!");
    } catch (err) {
        console.error("❌ Erro ao atualizar o banco:", err);
    } finally {
        await sql.end();
        process.exit();
    }
}

fix();
