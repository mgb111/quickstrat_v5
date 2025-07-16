-- Complete LeadGen Machine System Migration
-- This migration creates all necessary tables for the complete system

-- Drop existing tables if they exist
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS emails;

-- Create campaigns table
CREATE TABLE campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  customer_profile text NOT NULL,
  problem_statement text NOT NULL,
  desired_outcome text NOT NULL,
  landing_page_slug text UNIQUE NOT NULL,
  lead_count integer DEFAULT 0,
  lead_magnet_title text,
  lead_magnet_content text,
  landing_page_copy jsonb,
  social_posts text[],
  created_at timestamptz DEFAULT now()
);

-- Create leads table
CREATE TABLE leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  email text NOT NULL,
  captured_at timestamptz DEFAULT now()
);

-- Create emails table for email automation
CREATE TABLE emails (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  pdf_downloaded boolean DEFAULT false,
  email_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create policies for campaigns table
CREATE POLICY "campaigns_select_policy" ON campaigns
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "campaigns_insert_policy" ON campaigns
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "campaigns_update_policy" ON campaigns
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for leads table
CREATE POLICY "leads_select_policy" ON leads
  FOR SELECT TO authenticated
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "leads_insert_policy" ON leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Create policies for emails table
CREATE POLICY "emails_select_policy" ON emails
  FOR SELECT TO authenticated
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "emails_insert_policy" ON emails
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "emails_update_policy" ON emails
  FOR UPDATE TO authenticated
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_campaigns_user_id ON campaigns (user_id);
CREATE INDEX idx_campaigns_slug ON campaigns (landing_page_slug);
CREATE INDEX idx_leads_campaign_id ON leads (campaign_id);
CREATE INDEX idx_leads_email ON leads (email);
CREATE INDEX idx_emails_campaign_id ON emails (campaign_id);
CREATE INDEX idx_emails_email ON emails (email);

-- Create function to update lead count
CREATE OR REPLACE FUNCTION update_campaign_lead_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE campaigns 
    SET lead_count = lead_count + 1 
    WHERE id = NEW.campaign_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE campaigns 
    SET lead_count = lead_count - 1 
    WHERE id = OLD.campaign_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for lead count updates
CREATE TRIGGER trigger_update_lead_count
  AFTER INSERT OR DELETE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_lead_count();

-- Create function to generate unique slugs
CREATE OR REPLACE FUNCTION generate_unique_slug()
RETURNS text AS $$
DECLARE
  slug text;
  counter integer := 0;
BEGIN
  LOOP
    slug := 'campaign-' || floor(random() * 1000000)::text;
    IF counter > 0 THEN
      slug := slug || '-' || counter::text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM campaigns WHERE landing_page_slug = slug) THEN
      RETURN slug;
    END IF;
    
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql; 