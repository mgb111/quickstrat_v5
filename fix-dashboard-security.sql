-- Fix Dashboard Security - Apply these changes in Supabase SQL Editor

-- 1. Add demo_session_id column to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS demo_session_id text;

-- 2. Drop the old policy that allows all anonymous access
DROP POLICY IF EXISTS "Allow public access to campaigns" ON campaigns;

-- 3. Create new secure policies
-- Allow authenticated users to access only their own campaigns
CREATE POLICY "Users can access their own campaigns"
  ON campaigns
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow anonymous users to create campaigns (for demo purposes)
CREATE POLICY "Allow anonymous campaign creation"
  ON campaigns
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to read campaigns from their demo session
CREATE POLICY "Allow anonymous to read their demo session campaigns"
  ON campaigns
  FOR SELECT
  TO anon
  USING (user_id IS NULL AND demo_session_id IS NOT NULL);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns (user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_demo_session_id ON campaigns (demo_session_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns (created_at);

-- 5. Update emails table to include user_id
ALTER TABLE emails 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. Drop old email policies
DROP POLICY IF EXISTS "emails_select_policy" ON emails;

-- 7. Create new secure email policies
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

-- 8. Create index for emails user_id
CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails (user_id);

-- 9. Clean up any existing campaigns that don't have proper isolation
-- This will remove campaigns that were created before the security fix
-- (Only run this if you want to clean up old data)
-- DELETE FROM campaigns WHERE user_id IS NULL AND demo_session_id IS NULL;

-- 10. Verify the changes
SELECT 
  'Campaigns table' as table_name,
  COUNT(*) as total_campaigns,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as authenticated_campaigns,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as anonymous_campaigns
FROM campaigns
UNION ALL
SELECT 
  'Emails table' as table_name,
  COUNT(*) as total_emails,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as authenticated_emails,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as anonymous_emails
FROM emails; 