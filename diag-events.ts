import { db } from './src/lib/db';
import { events, users } from './src/lib/db/schema';

async function diag() {
    console.log("Checking users...");
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users.`);
    allUsers.forEach(u => console.log(`- ${u.name} (Clerk: ${u.clerkUserId}, Internal: ${u.id})`));

    console.log("\nChecking events...");
    const allEvents = await db.select().from(events);
    console.log(`Found ${allEvents.length} events in total.`);
    allEvents.forEach(e => {
        console.log(`- ${e.name} (Date: ${e.eventDate}, UserID: ${e.userId})`);
    });
}

diag().catch(console.error).finally(() => process.exit());
