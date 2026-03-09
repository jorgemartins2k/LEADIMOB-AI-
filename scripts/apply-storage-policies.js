
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
  const buckets = ["property-photos", "profile-photos"];

  for (const bucketName of buckets) {
    console.log(`Applying storage policies to '${bucketName}' bucket...`);

    try {
      await sql.unsafe(`
                DO $$ 
                BEGIN
                    -- Public Read Access
                    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Access ${bucketName}' AND tablename = 'objects' AND schemaname = 'storage') THEN
                        EXECUTE format('CREATE POLICY "Public Read Access %s" ON storage.objects FOR SELECT USING ( bucket_id = %L )', '${bucketName}', '${bucketName}');
                    END IF;

                    -- Allow Public Uploads
                    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Public Uploads ${bucketName}' AND tablename = 'objects' AND schemaname = 'storage') THEN
                        EXECUTE format('CREATE POLICY "Allow Public Uploads %s" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = %L )', '${bucketName}', '${bucketName}');
                    END IF;

                    -- Allow Public Delete
                    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Public Delete ${bucketName}' AND tablename = 'objects' AND schemaname = 'storage') THEN
                        EXECUTE format('CREATE POLICY "Allow Public Delete %s" ON storage.objects FOR DELETE USING ( bucket_id = %L )', '${bucketName}', '${bucketName}');
                    END IF;
                END $$;
            `);
      console.log(`Policies for '${bucketName}' applied successfully!`);
    } catch (error) {
      console.error(`Error applying policies for '${bucketName}':`, error);
    }
  }
  await sql.end();
}

applyPolicies();
