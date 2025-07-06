-- Allow anonymous access for demo purposes
-- This migration updates policies to work without authentication

-- Drop existing policies
DROP POLICY IF EXISTS "campaigns_select_policy" ON campaigns;
DROP POLICY IF EXISTS "campaigns_insert_policy" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update_policy" ON campaigns;

DROP POLICY IF EXISTS "leads_select_policy" ON leads;
DROP POLICY IF EXISTS "leads_insert_policy" ON leads;

DROP POLICY IF EXISTS "emails_select_policy" ON emails;
DROP POLICY IF EXISTS "emails_insert_policy" ON emails;
DROP POLICY IF EXISTS "emails_update_policy" ON emails;

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

CREATE POLICY "leads_select_policy" ON leads
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "leads_insert_policy" ON leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "emails_select_policy" ON emails
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "emails_insert_policy" ON emails
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "emails_update_policy" ON emails
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true); 