import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL + "&sslmode=require";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../src/lib/db/schema";
const client = postgres(connectionString);
const dbOverride = drizzle(client, { schema });

import { formatWhatsAppNumber } from "../src/lib/utils";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Fetching leads...");
    const allLeads = await dbOverride.query.leads.findMany();
    let updatedCount = 0;

    for (const l of allLeads) {
        const clean = formatWhatsAppNumber(l.phone);
        let updates: any = {};

        // Se a limpeza mudou o número (adicionou o 55 ou removeu ()-)
        if (clean !== l.phone) {
            updates.phone = clean;
        }

        // Se o lead foi criado hoje e está "active",
        // significa que a IA tentou ligar e falhou por causa do número mal formatado.
        const createdDate = l.createdAt ? new Date(l.createdAt).toISOString().split('T')[0] : null;
        const today = new Date().toISOString().split('T')[0];

        if (createdDate === today && l.status === "active") {
            updates.status = "waiting";
            console.log(`Resetting status to 'waiting' for lead ${l.name}`);
        }

        if (Object.keys(updates).length > 0) {
            console.log(`Updating lead ${l.id} - ${l.phone} -> ${clean}`);
            await dbOverride.update(schema.leads).set(updates).where(eq(schema.leads.id, l.id));
            updatedCount++;
        }
    }

    console.log(`Finished processing. Updated ${updatedCount} leads.`);
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
