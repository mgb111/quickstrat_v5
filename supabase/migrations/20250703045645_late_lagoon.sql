/*
  # Create emails table for lead capture

  1. New Tables
    - `emails`
      - `id` (uuid, primary key)
      - `email` (text, required)
      - `campaign_id` (uuid, optional reference)
      - `pdf_downloaded` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `emails` table
    - Add policy for anonymous users to insert emails
    - Add policy for authenticated users to read emails

  3. Indexes
    - Add index on email column for lookups
    - Add index on campaign_id for joins
*/

-- Drop table if it exists to avoid conflicts
DROP TABLE IF EXISTS emails;

-- Create emails table
CREATE TABLE emails (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  campaign_id uuid,
  pdf_downloaded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "emails_insert_policy" ON emails
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "emails_select_policy" ON emails
  FOR SELECT TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX idx_emails_email ON emails (email);
CREATE INDEX idx_emails_campaign_id ON emails (campaign_id);