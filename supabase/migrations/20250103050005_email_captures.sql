-- Create email_captures table for lead magnets and tools
CREATE TABLE IF NOT EXISTS email_captures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  source VARCHAR(100) NOT NULL, -- e.g., 'saas_checklist', 'promotion_guide', 'lead_magnet'
  metadata JSONB DEFAULT '{}', -- Store additional data like scores, responses, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_captures_email ON email_captures(email);
CREATE INDEX IF NOT EXISTS idx_email_captures_source ON email_captures(source);
CREATE INDEX IF NOT EXISTS idx_email_captures_created_at ON email_captures(created_at);

-- Enable RLS
ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated and anonymous users (for lead magnets)
CREATE POLICY "Allow email capture inserts" ON email_captures
  FOR INSERT WITH CHECK (true);

-- Only allow admins to view email captures
CREATE POLICY "Admin can view email captures" ON email_captures
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    auth.jwt() ->> 'email' = 'manishbhanushali1101@gmail.com'
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_email_captures_updated_at 
  BEFORE UPDATE ON email_captures 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 