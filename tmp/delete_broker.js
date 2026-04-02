
const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local from root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('ERRO: DATABASE_URL nao encontrada no .env.local');
    process.exit(1);
}

const sql = postgres(connectionString);

async function deleteBroker(email) {
    try {
        console.log(`Buscando corretor com e-mail: ${email}...`);

        const users = await sql`
            SELECT id, name FROM users WHERE email = ${email}
        `;

        if (users.length === 0) {
            console.log(`Corretor com e-mail ${email} nao encontrado.`);
            return;
        }

        const user = users[0];
        console.log(`Encontrado: ${user.name} (ID: ${user.id})`);

        console.log(`Excluindo corretor...`);
        const result = await sql`
            DELETE FROM users WHERE id = ${user.id}
        `;

        console.log(`Sucesso! Corretor ${user.name} (${email}) foi excluido.`);
        console.log('As tabelas relacionadas foram limpas via CASCADE.');

    } catch (error) {
        console.error('Erro durante a exclusao:', error);
    } finally {
        await sql.end();
    }
}

deleteBroker('jorgemartins2k@gmail.com');
