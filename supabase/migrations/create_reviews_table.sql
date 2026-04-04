-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_type TEXT NOT NULL CHECK (review_type IN ('image', 'text')),
  image_url TEXT,
  review_text TEXT,
  reviewer_name TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews table
-- Allow authenticated users to do everything
CREATE POLICY "Allow authenticated users to do everything on reviews"
ON reviews
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow anonymous users to view active reviews
CREATE POLICY "Allow anonymous users to view active reviews"
ON reviews
FOR SELECT
TO anon
USING (is_active = true);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_reviews_active_order ON reviews (is_active, display_order, created_at DESC);