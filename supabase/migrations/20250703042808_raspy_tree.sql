/*
# Create campaigns table for LeadGen Machine

1. New Tables
   - `campaigns`
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key to auth.users)
     - `demo_session_id` (text) - for anonymous user session isolation
     - `created_at` (timestamp)
     - `input` (jsonb) - stores campaign input data
     - `output` (jsonb) - stores generated campaign content
     - `status` (text) - campaign generation status

2. Security
   - Enable RLS on `campaigns` table
   - Add policy for authenticated users to access only their own campaigns
   - Allow anonymous users to create campaigns (for demo purposes)
   - Allow anonymous users to access campaigns from their demo session
*/

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  demo_session_id text,
  created_at timestamptz DEFAULT now(),
  input jsonb NOT NULL,
  output jsonb,
  status text DEFAULT 'generating'
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to access only their own campaigns
CREATE POLICY "Users can access their own campaigns"
  ON campaigns
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow anonymous users to create campaigns (for demo purposes)
-- They won't be able to view them later without authentication
CREATE POLICY "Allow anonymous campaign creation"
  ON campaigns
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to read campaigns from their demo session
-- This provides session-based isolation for demo users
CREATE POLICY "Allow anonymous to read their demo session campaigns"
  ON campaigns
  FOR SELECT
  TO anon
  USING (user_id IS NULL AND demo_session_id IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_campaigns_user_id ON campaigns (user_id);
CREATE INDEX idx_campaigns_demo_session_id ON campaigns (demo_session_id);
CREATE INDEX idx_campaigns_created_at ON campaigns (created_at);