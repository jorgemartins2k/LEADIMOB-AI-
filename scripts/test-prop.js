require('dotenv').config({ path: '.env.local' });
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { eq, and } = require('drizzle-orm');

// TENTATIVA DIRETA: Recriando a lógica do drizzle exatamente como o actions faz
async function main() {
    try {
        console.log("Inicializando conexão...");
        const queryClient = postgres(process.env.DATABASE_URL);
        const db = drizzle(queryClient);

        console.log("Conectado! Lendo propriedade...");

        // Simulação do ID passado pelo Vercel
        const id = '143eca9b-f512-4019-b678-623c365d1eed';

        // A tabela no drizzle
        const { pgTable, uuid, text, numeric, smallint, boolean, timestamp } = require('drizzle-orm/pg-core');
        const users = pgTable('users', { id: uuid('id').primaryKey() });
        const properties = pgTable('properties', {
            id: uuid('id').primaryKey().defaultRandom(),
            userId: uuid('user_id').notNull().references(() => users.id),
            title: text('title').notNull(),
        });

        // Simulando a query (ignoring user.id filter para ver se ela existe no geral)
        const result = await db.select().from(properties).where(eq(properties.id, id));

        console.log("Resultado da Query:", result);
        console.log("Teste finalizado com sucesso.");
        process.exit(0);

    } catch (err) {
        console.error("ERRO FATAL:", err);
        process.exit(1);
    }
}

main();
