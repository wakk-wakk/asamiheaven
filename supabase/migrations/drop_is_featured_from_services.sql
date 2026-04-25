-- Drop the is_featured column from services table
ALTER TABLE services DROP COLUMN IF EXISTS is_featured;
