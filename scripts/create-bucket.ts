
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing Supabase URL or Service Role Key in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createBucket() {
    const bucketName = "property-photos";

    console.log(`Checking/Creating bucket: ${bucketName}...`);

    const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/*']
    });

    if (error) {
        if (error.message.includes("already exists")) {
            console.log(`Bucket "${bucketName}" already exists.`);
        } else {
            console.error("Error creating bucket:", error.message);
        }
    } else {
        console.log(`Bucket "${bucketName}" created successfully!`);
    }
}

createBucket();
