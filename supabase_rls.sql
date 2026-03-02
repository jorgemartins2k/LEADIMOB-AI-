-- 1. Enable RLS for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE launches ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for users (based on clerk_user_id)
-- Note: This assumes you have a way to match internal UUID to auth.uid() if using Supabase Auth,
-- but since we use Clerk, we usually handle access on the Server Side (Next.js Server Actions).
-- However, for Supabase Storage to work with the Client SDK, we need some policies.

-- STORAGE POLICIES (Required for ImageUpload component)
-- We'll allow public read and authenticated upload.

-- First, ensure the bucket 'property-photos' exists (run this in Supabase UI or use this SQL)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('property-photos', 'property-photos', true);

-- Policy for Public Read Access
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'property-photos' );

-- Policy for Authenticated Uploads
-- Since we are using the Anon Key for uploads from the client (simplified), 
-- we allow all uploads for now. In production, you'd want to restrict this.
CREATE POLICY "Allow Public Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'property-photos' );

-- Policy for Deletion
CREATE POLICY "Allow Public Delete" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'property-photos' );
