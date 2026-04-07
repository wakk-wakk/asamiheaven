-- Add image_path column to therapists table for Supabase Storage
ALTER TABLE therapists ADD COLUMN IF NOT EXISTS image_path TEXT;