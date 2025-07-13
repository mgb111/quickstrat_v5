-- Analytics System Migration
-- This migration creates comprehensive analytics tracking for every phase of the user journey

-- Create analytics_events table for detailed event tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  event_type text NOT NULL,
  event_name text NOT NULL,
  phase text NOT NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  metadata jsonb DEFAULT '{}',
  timestamp timestamptz DEFAULT now(),
  user_agent text,
  ip_address inet,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz DEFAULT now()
);

-- Create user_journeys table for tracking complete user journeys
CREATE TABLE IF NOT EXISTS user_journeys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  phases_completed text[] DEFAULT '{}',
  total_time_seconds integer,
  conversion_funnel text NOT NULL,
  subscription_plan text,
  campaign_count integer DEFAULT 0,
  leads_generated integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create campaign_analytics table for campaign-specific analytics
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  creation_time_seconds integer,
  phases_completed text[] DEFAULT '{}',
  final_output_generated boolean DEFAULT false,
  pdf_downloaded boolean DEFAULT false,
  leads_captured integer DEFAULT 0,
  landing_page_views integer DEFAULT 0,
  conversion_rate decimal(5,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create phase_analytics table for aggregated phase data
CREATE TABLE IF NOT EXISTS phase_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phase text NOT NULL,
  date date NOT NULL,
  total_entries integer DEFAULT 0,
  total_completions integer DEFAULT 0,
  total_abandonments integer DEFAULT 0,
  average_time_seconds integer,
  completion_rate decimal(5,2),
  drop_off_rate decimal(5,2),
  common_issues text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(phase, date)
);

-- Create funnel_analytics table for conversion funnel tracking
CREATE TABLE IF NOT EXISTS funnel_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_name text NOT NULL,
  date date NOT NULL,
  phase text NOT NULL,
  phase_order integer NOT NULL,
  entries integer DEFAULT 0,
  completions integer DEFAULT 0,
  drop_offs integer DEFAULT 0,
  conversion_rate decimal(5,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(funnel_name, date, phase)
);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics_events
CREATE POLICY "Users can view their own analytics events" ON analytics_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics events" ON analytics_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow anonymous users to insert events (for tracking before authentication)
CREATE POLICY "Allow anonymous analytics events" ON analytics_events
  FOR INSERT TO anon
  WITH CHECK (true);

-- Create RLS policies for user_journeys
CREATE POLICY "Users can view their own journeys" ON user_journeys
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journeys" ON user_journeys
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journeys" ON user_journeys
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for campaign_analytics
CREATE POLICY "Users can view their own campaign analytics" ON campaign_analytics
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaign analytics" ON campaign_analytics
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaign analytics" ON campaign_analytics
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for phase_analytics (read-only for users, full access for service role)
CREATE POLICY "Users can view phase analytics" ON phase_analytics
  FOR SELECT TO authenticated
  USING (true);

-- Create RLS policies for funnel_analytics (read-only for users, full access for service role)
CREATE POLICY "Users can view funnel analytics" ON funnel_analytics
  FOR SELECT TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_phase ON analytics_events(phase);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_campaign_id ON analytics_events(campaign_id);

CREATE INDEX idx_user_journeys_user_id ON user_journeys(user_id);
CREATE INDEX idx_user_journeys_session_id ON user_journeys(session_id);
CREATE INDEX idx_user_journeys_started_at ON user_journeys(started_at);
CREATE INDEX idx_user_journeys_conversion_funnel ON user_journeys(conversion_funnel);

CREATE INDEX idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
CREATE INDEX idx_campaign_analytics_user_id ON campaign_analytics(user_id);
CREATE INDEX idx_campaign_analytics_created_at ON campaign_analytics(created_at);

CREATE INDEX idx_phase_analytics_phase ON phase_analytics(phase);
CREATE INDEX idx_phase_analytics_date ON phase_analytics(date);
CREATE INDEX idx_phase_analytics_phase_date ON phase_analytics(phase, date);

CREATE INDEX idx_funnel_analytics_funnel_name ON funnel_analytics(funnel_name);
CREATE INDEX idx_funnel_analytics_date ON funnel_analytics(date);
CREATE INDEX idx_funnel_analytics_funnel_date ON funnel_analytics(funnel_name, date);

-- Create functions for analytics calculations

-- Function to get phase analytics for a time range
CREATE OR REPLACE FUNCTION get_phase_analytics(time_range text DEFAULT 'week')
RETURNS TABLE (
  phase text,
  total_entries bigint,
  total_completions bigint,
  completion_rate decimal,
  average_time_seconds integer,
  drop_off_count bigint,
  drop_off_rate decimal,
  common_issues text[]
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.phase,
    pa.total_entries,
    pa.total_completions,
    pa.completion_rate,
    pa.average_time_seconds,
    pa.total_abandonments as drop_off_count,
    pa.drop_off_rate,
    pa.common_issues
  FROM phase_analytics pa
  WHERE pa.date >= CASE 
    WHEN time_range = 'day' THEN CURRENT_DATE
    WHEN time_range = 'week' THEN CURRENT_DATE - INTERVAL '7 days'
    WHEN time_range = 'month' THEN CURRENT_DATE - INTERVAL '30 days'
    ELSE CURRENT_DATE - INTERVAL '7 days'
  END
  ORDER BY pa.phase;
END;
$$;

-- Function to get funnel analytics for a time range
CREATE OR REPLACE FUNCTION get_funnel_analytics(time_range text DEFAULT 'week')
RETURNS TABLE (
  phase text,
  entries bigint,
  completions bigint,
  drop_offs bigint,
  conversion_rate decimal
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fa.phase,
    fa.entries,
    fa.completions,
    fa.drop_offs,
    fa.conversion_rate
  FROM funnel_analytics fa
  WHERE fa.date >= CASE 
    WHEN time_range = 'day' THEN CURRENT_DATE
    WHEN time_range = 'week' THEN CURRENT_DATE - INTERVAL '7 days'
    WHEN time_range = 'month' THEN CURRENT_DATE - INTERVAL '30 days'
    ELSE CURRENT_DATE - INTERVAL '7 days'
  END
  AND fa.funnel_name = 'lead_magnet_creation'
  ORDER BY fa.phase_order;
END;
$$;

-- Function to get user analytics summary
CREATE OR REPLACE FUNCTION get_user_analytics_summary(user_id_param uuid)
RETURNS TABLE (
  total_campaigns bigint,
  total_leads bigint,
  average_completion_time integer,
  conversion_rate decimal,
  most_used_phases text[]
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT ca.campaign_id) as total_campaigns,
    COALESCE(SUM(ca.leads_captured), 0) as total_leads,
    AVG(ca.creation_time_seconds)::integer as average_completion_time,
    CASE 
      WHEN COUNT(DISTINCT ca.campaign_id) > 0 
      THEN (COUNT(CASE WHEN ca.final_output_generated THEN 1 END)::decimal / COUNT(DISTINCT ca.campaign_id) * 100)
      ELSE 0 
    END as conversion_rate,
    ARRAY_AGG(DISTINCT unnest(ca.phases_completed)) as most_used_phases
  FROM campaign_analytics ca
  WHERE ca.user_id = user_id_param;
END;
$$;

-- Function to update phase analytics (called by triggers)
CREATE OR REPLACE FUNCTION update_phase_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update phase analytics for the current date
  INSERT INTO phase_analytics (phase, date, total_entries, total_completions, total_abandonments, completion_rate, drop_off_rate)
  VALUES (
    NEW.phase,
    CURRENT_DATE,
    1,
    CASE WHEN NEW.event_type = 'phase_completion' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'phase_abandonment' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'phase_completion' THEN 100.0 ELSE 0.0 END,
    CASE WHEN NEW.event_type = 'phase_abandonment' THEN 100.0 ELSE 0.0 END
  )
  ON CONFLICT (phase, date)
  DO UPDATE SET
    total_entries = phase_analytics.total_entries + 1,
    total_completions = phase_analytics.total_completions + CASE WHEN NEW.event_type = 'phase_completion' THEN 1 ELSE 0 END,
    total_abandonments = phase_analytics.total_abandonments + CASE WHEN NEW.event_type = 'phase_abandonment' THEN 1 ELSE 0 END,
    completion_rate = CASE 
      WHEN phase_analytics.total_entries + 1 > 0 
      THEN ((phase_analytics.total_completions + CASE WHEN NEW.event_type = 'phase_completion' THEN 1 ELSE 0 END)::decimal / (phase_analytics.total_entries + 1) * 100)
      ELSE 0 
    END,
    drop_off_rate = CASE 
      WHEN phase_analytics.total_entries + 1 > 0 
      THEN ((phase_analytics.total_abandonments + CASE WHEN NEW.event_type = 'phase_abandonment' THEN 1 ELSE 0 END)::decimal / (phase_analytics.total_entries + 1) * 100)
      ELSE 0 
    END,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update phase analytics
CREATE TRIGGER trigger_update_phase_analytics
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  WHEN (NEW.event_type IN ('phase_entry', 'phase_completion', 'phase_abandonment'))
  EXECUTE FUNCTION update_phase_analytics();

-- Function to update campaign analytics when campaign is created
CREATE OR REPLACE FUNCTION update_campaign_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert campaign analytics record
  INSERT INTO campaign_analytics (campaign_id, user_id, phases_completed, final_output_generated)
  VALUES (NEW.id, NEW.user_id, ARRAY['input'], false);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create campaign analytics
CREATE TRIGGER trigger_create_campaign_analytics
  AFTER INSERT ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_analytics();

-- Function to update user journey when user completes phases
CREATE OR REPLACE FUNCTION update_user_journey()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or create user journey
  INSERT INTO user_journeys (user_id, session_id, phases_completed, conversion_funnel)
  VALUES (
    NEW.user_id,
    NEW.session_id,
    ARRAY[NEW.phase],
    'lead_magnet_creation'
  )
  ON CONFLICT (user_id, session_id)
  DO UPDATE SET
    phases_completed = CASE 
      WHEN NEW.phase = ANY(user_journeys.phases_completed) 
      THEN user_journeys.phases_completed 
      ELSE array_append(user_journeys.phases_completed, NEW.phase)
    END,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update user journey
CREATE TRIGGER trigger_update_user_journey
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  WHEN (NEW.event_type IN ('phase_completion'))
  EXECUTE FUNCTION update_user_journey();

-- Create views for easier analytics queries

-- View for daily analytics summary
CREATE OR REPLACE VIEW daily_analytics_summary AS
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as total_events,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) as conversions,
  COUNT(CASE WHEN event_type = 'error' THEN 1 END) as errors
FROM analytics_events
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- View for phase performance
CREATE OR REPLACE VIEW phase_performance AS
SELECT 
  phase,
  COUNT(*) as total_events,
  COUNT(CASE WHEN event_type = 'phase_completion' THEN 1 END) as completions,
  COUNT(CASE WHEN event_type = 'phase_abandonment' THEN 1 END) as abandonments,
  ROUND(
    (COUNT(CASE WHEN event_type = 'phase_completion' THEN 1 END)::decimal / 
     COUNT(CASE WHEN event_type IN ('phase_entry', 'phase_completion', 'phase_abandonment') THEN 1 END) * 100), 2
  ) as completion_rate
FROM analytics_events
WHERE event_type IN ('phase_entry', 'phase_completion', 'phase_abandonment')
GROUP BY phase
ORDER BY completion_rate DESC;

-- Grant necessary permissions
GRANT SELECT ON daily_analytics_summary TO authenticated;
GRANT SELECT ON phase_performance TO authenticated;
GRANT EXECUTE ON FUNCTION get_phase_analytics(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_funnel_analytics(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_analytics_summary(uuid) TO authenticated; 