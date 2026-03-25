import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const { db } = require("../src/lib/db");
const { launches, launchUnits, users, campaigns, appointments } = require("../src/lib/db/schema");
const { eq, like, and } = require("drizzle-orm");

async function run() {
    try {
        console.log("Searching for Ecoville Figueira...");
        const launch = await db.query.launches.findFirst({
            where: like(launches.name, "%ECOVILLE%")
        });

        if (!launch) {
            console.log("ECOVILLE FIGUEIRA not found.");
            process.exit(0);
        }

        console.log(`Found launch: ${launch.name} (ID: ${launch.id})`);

        console.log("Attempting campaigns update...");
        await db.update(campaigns).set({ launchId: null }).where(eq(campaigns.launchId, launch.id));
        console.log("Campaigns updated.");

        console.log("Attempting appointments update...");
        await db.update(appointments).set({ launchId: null }).where(eq(appointments.launchId, launch.id));
        console.log("Appointments updated.");

        console.log("Attempting launchUnits delete...");
        await db.delete(launchUnits).where(eq(launchUnits.launchId, launch.id));
        console.log("Launch units deleted.");

        console.log("Attempting launch delete...");
        await db.delete(launches).where(eq(launches.id, launch.id));
        console.log("Launch deleted successfully!");

    } catch (err: any) {
        console.error("DIAGNOSTIC ERROR:");
        console.error(err);
    }
    process.exit(0);
}

run();
