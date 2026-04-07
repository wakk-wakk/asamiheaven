-- Add image_path column to services table for Supabase Storage
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_path TEXT;

-- Create storage bucket for service images
-- Note: This needs to be run in Supabase Dashboard > Storage or via API
-- Run this SQL in the SQL Editor:
--   insert into storage.buckets (id, name, public) values ('services-images', 'services-images', true);

-- Enable Row Level Security on the bucket (run in Supabase Dashboard)
-- alter bucket storage.buckets enable row level security;

-- Create policies for the services-images bucket
-- These policies allow authenticated users to upload/delete images
-- and anyone to view (select) images

-- Policy: Allow authenticated users to upload files
-- create policy "Allow authenticated users to upload files"
-- on storage.objects for insert
-- with check (bucket_id = 'services-images' and auth.role() = 'authenticated');

-- Policy: Allow authenticated users to update their uploaded files
-- create policy "Allow authenticated users to update files"
-- on storage.objects for update
-- with check (bucket_id = 'services-images' and auth.role() = 'authenticated');

-- Policy: Allow authenticated users to delete files
-- create policy "Allow authenticated users to delete files"
-- on storage.objects for delete
-- using (bucket_id = 'services-images' and auth.role() = 'authenticated');

-- Policy: Allow public to view files (since bucket is public)
-- create policy "Allow public to view files"
-- on storage.objects for select
-- using (bucket_id = 'services-images');

-- Note: The above storage policies need to be created via Supabase Dashboard
-- Go to Storage > services-images bucket > Policies and add these policies