/*
# Create campaigns table for LeadGen Machine

1. New Tables
   - `campaigns`
     - `id` (uuid, primary key)
     - `created_at` (timestamp)
     - `input` (jsonb) - stores campaign input data
     - `output` (jsonb) - stores generated campaign content
     - `status` (text) - campaign generation status

2. Security
   - Enable RLS on `campaigns` table
   - Add policy for public access (since this is a demo MVP)
*/

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  input jsonb NOT NULL,
  output jsonb,
  status text DEFAULT 'generating'
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Allow public access for demo purposes
-- In production, you'd want to restrict this to authenticated users
CREATE POLICY "Allow public access to campaigns"
  ON campaigns
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);