-- Fix demo access by making user_id nullable and updating policies
-- This allows the app to work without authentication for demo purposes

-- Make user_id nullable in campaigns table
ALTER TABLE campaigns ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "campaigns_select_policy" ON campaigns;
DROP POLICY IF EXISTS "campaigns_insert_policy" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update_policy" ON campaigns;

-- Create new policies that allow anonymous access for demo
CREATE POLICY "campaigns_select_policy" ON campaigns
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "campaigns_insert_policy" ON campaigns
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "campaigns_update_policy" ON campaigns
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Also update leads policies to allow anonymous access
DROP POLICY IF EXISTS "leads_select_policy" ON leads;
CREATE POLICY "leads_select_policy" ON leads
  FOR SELECT TO anon, authenticated
  USING (true);

-- Update emails policies to allow anonymous access
DROP POLICY IF EXISTS "emails_select_policy" ON emails;
CREATE POLICY "emails_select_policy" ON emails
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "emails_update_policy" ON emails;
CREATE POLICY "emails_update_policy" ON emails
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true); 