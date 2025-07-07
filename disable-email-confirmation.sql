-- Disable email confirmation for development
-- Run this in your Supabase SQL Editor

-- Method 1: Update auth config
UPDATE auth.config 
SET enable_confirmations = false;

-- Method 2: Alternative approach (if Method 1 doesn't work)
UPDATE auth.config 
SET confirm_email_change = false,
    enable_confirmations = false;

-- Verify the change
SELECT * FROM auth.config; 