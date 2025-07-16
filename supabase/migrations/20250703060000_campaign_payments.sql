-- Create campaign_payments table for per-campaign payments
CREATE TABLE IF NOT EXISTS campaign_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  campaign_id UUID REFERENCES campaigns(id),
  razorpay_payment_id TEXT,
  amount INT,
  status TEXT, -- e.g. 'paid', 'failed'
  created_at TIMESTAMP DEFAULT now()
); 