-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for additional user data
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table for extended profile data
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company_name TEXT,
    website TEXT,
    industry TEXT,
    phone TEXT,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table for tracking user activity
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    
    INSERT INTO public.user_profiles (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update user settings
CREATE OR REPLACE FUNCTION public.update_user_settings(
    user_id UUID,
    new_settings JSONB
)
RETURNS JSONB AS $$
BEGIN
    UPDATE public.users 
    SET settings = settings || new_settings,
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN (SELECT settings FROM public.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user usage statistics
CREATE OR REPLACE FUNCTION public.get_user_usage(user_id UUID)
RETURNS JSONB AS $$
DECLARE
    usage_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'campaigns_created', COALESCE(campaign_count.count, 0),
        'leads_this_month', COALESCE(leads_count.count, 0),
        'emails_sent_this_month', COALESCE(emails_count.count, 0),
        'storage_used_gb', COALESCE(storage_used.size_gb, 0)
    ) INTO usage_stats
    FROM public.users u
    LEFT JOIN (
        SELECT COUNT(*) as count 
        FROM public.campaigns 
        WHERE user_id = $1
    ) campaign_count ON true
    LEFT JOIN (
        SELECT COUNT(*) as count 
        FROM public.leads l
        JOIN public.campaigns c ON l.campaign_id = c.id
        WHERE c.user_id = $1 
        AND l.captured_at >= date_trunc('month', NOW())
    ) leads_count ON true
    LEFT JOIN (
        SELECT COUNT(*) as count 
        FROM public.emails e
        JOIN public.campaigns c ON e.campaign_id = c.id
        WHERE c.user_id = $1 
        AND e.sent_at >= date_trunc('month', NOW())
    ) emails_count ON true
    LEFT JOIN (
        SELECT COALESCE(SUM(octet_length(content::text)) / (1024 * 1024 * 1024.0), 0) as size_gb
        FROM public.campaigns 
        WHERE user_id = $1 AND lead_magnet_content IS NOT NULL
    ) storage_used ON true
    WHERE u.id = $1;
    
    RETURN usage_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own profile data" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile data" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Update existing campaign policies to include user_id
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Update campaign policies
DROP POLICY IF EXISTS "Users can view own campaigns" ON public.campaigns;
CREATE POLICY "Users can view own campaigns" ON public.campaigns
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own campaigns" ON public.campaigns;
CREATE POLICY "Users can insert own campaigns" ON public.campaigns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own campaigns" ON public.campaigns;
CREATE POLICY "Users can update own campaigns" ON public.campaigns
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.campaigns;
CREATE POLICY "Users can delete own campaigns" ON public.campaigns
    FOR DELETE USING (auth.uid() = user_id);

-- Update leads policies to include user ownership through campaigns
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
CREATE POLICY "Users can view own leads" ON public.leads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = leads.campaign_id 
            AND campaigns.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert leads for own campaigns" ON public.leads;
CREATE POLICY "Users can insert leads for own campaigns" ON public.leads
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = leads.campaign_id 
            AND campaigns.user_id = auth.uid()
        )
    );

-- Update emails policies
DROP POLICY IF EXISTS "Users can view own emails" ON public.emails;
CREATE POLICY "Users can view own emails" ON public.emails
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = emails.campaign_id 
            AND campaigns.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert emails for own campaigns" ON public.emails;
CREATE POLICY "Users can insert emails for own campaigns" ON public.emails
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = emails.campaign_id 
            AND campaigns.user_id = auth.uid()
        )
    );

-- Allow anonymous access to landing pages (for lead capture)
DROP POLICY IF EXISTS "Anonymous users can view campaigns" ON public.campaigns;
CREATE POLICY "Anonymous users can view campaigns" ON public.campaigns
    FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON public.leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_emails_campaign_id ON public.emails(campaign_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_sessions TO authenticated;
GRANT ALL ON public.campaigns TO authenticated;
GRANT ALL ON public.leads TO authenticated;
GRANT ALL ON public.emails TO authenticated;
GRANT SELECT ON public.campaigns TO anon;
GRANT INSERT ON public.leads TO anon;
GRANT INSERT ON public.emails TO anon;

-- Create sequence for user IDs if needed
CREATE SEQUENCE IF NOT EXISTS public.user_id_seq;

-- Add comments for documentation
COMMENT ON TABLE public.users IS 'Extended user data for the SaaS platform';
COMMENT ON TABLE public.user_profiles IS 'Additional profile information for users';
COMMENT ON TABLE public.user_sessions IS 'User session tracking for analytics';
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user records when auth.users is created';
COMMENT ON FUNCTION public.update_user_settings(UUID, JSONB) IS 'Updates user settings with new values';
COMMENT ON FUNCTION public.get_user_usage(UUID) IS 'Returns usage statistics for a user'; 