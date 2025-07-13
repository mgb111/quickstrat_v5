-- Add subscription fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'enterprise')),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due')),
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- Create function to increment campaign count
CREATE OR REPLACE FUNCTION increment()
RETURNS INTEGER
LANGUAGE SQL
AS $$
  SELECT COALESCE(campaign_count, 0) + 1
$$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Add RLS policies for subscription data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscription data
CREATE POLICY "Users can view own subscription data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own subscription data
CREATE POLICY "Users can update own subscription data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Insert default subscription data for existing users
UPDATE users 
SET plan = 'free', 
    subscription_status = 'active'
WHERE plan IS NULL;

-- Create a view for subscription analytics (admin only)
CREATE OR REPLACE VIEW subscription_analytics AS
SELECT 
  plan,
  subscription_status,
  COUNT(*) as user_count,
  AVG(campaign_count) as avg_campaigns_per_user
FROM users 
GROUP BY plan, subscription_status;

-- Grant access to the analytics view (admin only)
GRANT SELECT ON subscription_analytics TO authenticated; 