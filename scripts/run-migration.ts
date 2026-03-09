import postgres from 'postgres';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);

async function run() {
    try {
        console.log('--- Inicidando Migração Manual ---');

        // Caminho para o arquivo SQL gerado
        const migrationPath = path.join(process.cwd(), 'drizzle', '0001_low_centennial.sql');
        const sqlContent = fs.readFileSync(migrationPath, 'utf8');

        // Divide o SQL em comandos individuais usando o marcador do drizzle
        const commands = sqlContent.split('--> statement-breakpoint');

        for (const command of commands) {
            const trimmedCommand = command.trim();
            if (trimmedCommand) {
                console.log('Executando comando...');
                await sql.unsafe(trimmedCommand);
                console.log('Comando executado com sucesso.');
            }
        }

        console.log('--- Migração Concluída com Sucesso ---');
    } catch (error) {
        console.error('Erro durante a migração:', error);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

run();
