/*
  # Create emails table for lead capture

  1. New Tables
    - `emails`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `email` (text, required)
      - `campaign_id` (uuid, optional reference)
      - `pdf_downloaded` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `emails` table
    - Add policy for authenticated users to access only their own emails
    - Add policy for anonymous users to insert emails (for demo purposes)

  3. Indexes
    - Add index on email column for lookups
    - Add index on campaign_id for joins
    - Add index on user_id for security
*/

-- Drop table if it exists to avoid conflicts
DROP TABLE IF EXISTS emails;

-- Create emails table
CREATE TABLE emails (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  campaign_id uuid,
  pdf_downloaded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can access their own emails"
  ON emails
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow anonymous users to insert emails (for demo purposes)
CREATE POLICY "emails_insert_policy" ON emails
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous users to read emails they created (temporary access)
CREATE POLICY "emails_select_anonymous_policy" ON emails
  FOR SELECT TO anon
  USING (user_id IS NULL);

-- Create indexes
CREATE INDEX idx_emails_email ON emails (email);
CREATE INDEX idx_emails_campaign_id ON emails (campaign_id);
CREATE INDEX idx_emails_user_id ON emails (user_id);