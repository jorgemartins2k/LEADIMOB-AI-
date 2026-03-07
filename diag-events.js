const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("DATABASE_URL not found in .env.local");
    process.exit(1);
}

const client = postgres(connectionString);

async function diag() {
    let output = "Checking tables directly...\n\n";

    try {
        const allUsers = await client`SELECT id, name, clerk_user_id FROM users`;
        output += `Found ${allUsers.length} users.\n`;
        allUsers.forEach(u => {
            output += `- ${u.name} (Clerk: ${u.clerk_user_id}, Internal: ${u.id})\n`;
        });

        const allEvents = await client`SELECT id, name, event_date, user_id FROM events`;
        output += `\nFound ${allEvents.length} events in total.\n`;
        allEvents.forEach(e => {
            output += `- ${e.name} (Date: ${e.event_date}, UserID: ${e.user_id})\n`;
        });

        const allAppointments = await client`SELECT id, title, appointment_date, user_id FROM appointments`;
        output += `\nFound ${allAppointments.length} appointments in total.\n`;
        allAppointments.forEach(a => {
            output += `- ${a.title} (Date: ${a.appointment_date}, UserID: ${a.user_id})\n`;
        });

        fs.writeFileSync('diag_output.txt', output);
        console.log("Diagnostic written to diag_output.txt");

    } catch (err) {
        console.error("Error during query:", err);
    }
}

diag().catch(console.error).finally(() => {
    client.end();
    process.exit();
});
