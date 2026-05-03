-- Create visitor_contacts table for phone capture leads
CREATE TABLE visitor_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  consent BOOLEAN NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent TEXT
);

-- Phone validation constraint using regex
ALTER TABLE visitor_contacts
ADD CONSTRAINT phone_format_check
CHECK (phone ~ '^\+?[1-9]\d{1,14}$');

-- Enable RLS
ALTER TABLE visitor_contacts ENABLE ROW LEVEL SECURITY;

-- Public insert policy for client-side submissions
CREATE POLICY "Allow public inserts" ON visitor_contacts
FOR INSERT
TO public
WITH CHECK (true);

-- Index for efficient ordering by creation time
CREATE INDEX idx_visitor_contacts_created_at_desc ON visitor_contacts (created_at DESC);