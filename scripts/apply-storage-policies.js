
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
    const [key, ...value] = line.split("=");
    if (key && value) {
        env[key.trim()] = value.join("=").trim();
    }
});

const databaseUrl = env.DATABASE_URL;

if (!databaseUrl) {
    console.error("Missing DATABASE_URL in .env.local");
    process.exit(1);
}

// Remove pgbouncer=true for direct script execution if necessary, 
// but postgres-js usually handles it.
const sql = postgres(databaseUrl);

async function applyPolicies() {
    console.log("Applying storage policies to 'property-photos' bucket...");

    try {
        // We use a transaction or multiple queries to ensure everything is set
        // We'll use DO blocks to avoid "already exists" errors
        await sql.unsafe(`
      DO $$ 
      BEGIN
        -- Public Read Access
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Access' AND tablename = 'objects' AND schemaname = 'storage') THEN
          CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING ( bucket_id = 'property-photos' );
        END IF;

        -- Allow Public Uploads
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Public Uploads' AND tablename = 'objects' AND schemaname = 'storage') THEN
          CREATE POLICY "Allow Public Uploads" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'property-photos' );
        END IF;

        -- Allow Public Delete
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Public Delete' AND tablename = 'objects' AND schemaname = 'storage') THEN
          CREATE POLICY "Allow Public Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'property-photos' );
        END IF;
      END $$;
    `);

        console.log("Policies applied successfully!");
    } catch (error) {
        console.error("Error applying policies:", error);
    } finally {
        await sql.end();
    }
}

applyPolicies();
