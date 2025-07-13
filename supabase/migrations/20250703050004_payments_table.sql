-- Create payments table for tracking Razorpay payments
-- This migration adds support for payment tracking and subscription management

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  plan text NOT NULL CHECK (plan IN ('free', 'premium', 'enterprise')),
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  razorpay_order_id text,
  razorpay_payment_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments table
CREATE POLICY "Users can view their own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow anonymous users to insert payments (for unauthenticated purchases)
CREATE POLICY "Allow anonymous payment insertion"
  ON payments
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

-- Add subscription fields to users table if they don't exist
DO $$ 
BEGIN
  -- Add subscription_status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
    ALTER TABLE users ADD COLUMN subscription_status text DEFAULT 'active' 
    CHECK (subscription_status IN ('active', 'cancelled', 'past_due'));
  END IF;
  
  -- Add subscription_end_date column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'subscription_end_date') THEN
    ALTER TABLE users ADD COLUMN subscription_end_date timestamptz;
  END IF;
  
  -- Add last_payment_date column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'last_payment_date') THEN
    ALTER TABLE users ADD COLUMN last_payment_date timestamptz;
  END IF;
END $$;

-- Create function to get user's current subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_uuid uuid)
RETURNS json AS $$
DECLARE
  user_data record;
  payment_data record;
  result json;
BEGIN
  -- Get user data
  SELECT plan, subscription_status, subscription_end_date, last_payment_date
  INTO user_data
  FROM users
  WHERE id = user_uuid;
  
  -- Get latest payment
  SELECT payment_id, amount, billing_cycle, created_at
  INTO payment_data
  FROM payments
  WHERE user_id = user_uuid AND status = 'completed'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Build result
  result := json_build_object(
    'plan', user_data.plan,
    'subscription_status', user_data.subscription_status,
    'subscription_end_date', user_data.subscription_end_date,
    'last_payment_date', user_data.last_payment_date,
    'last_payment', json_build_object(
      'payment_id', payment_data.payment_id,
      'amount', payment_data.amount,
      'billing_cycle', payment_data.billing_cycle,
      'created_at', payment_data.created_at
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 