# How to Disable Email Confirmation in Supabase

## Method 1: Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Navigate to**: Authentication > Settings
4. **Find "Enable email confirmations"**
5. **Toggle it OFF**
6. **Save changes**

## Method 2: SQL Command (Alternative)

Run this SQL in your Supabase SQL Editor:

```sql
-- Disable email confirmation
UPDATE auth.config 
SET enable_signup = true,
    enable_confirmations = false;

-- Or update specific settings
UPDATE auth.config 
SET confirm_email_change = false,
    enable_confirmations = false;
```

## What This Does

- **Disables email verification** for new signups
- **Users can sign in immediately** after creating an account
- **No verification emails** will be sent
- **Perfect for development** and testing

## Re-enable Later

When you're ready for production:

1. **Go back to Supabase Dashboard**
2. **Toggle "Enable email confirmations" ON**
3. **Configure your email provider** (SendGrid, Mailgun, etc.)
4. **Set up email templates**

## Current Status

✅ **Email confirmation is now disabled in your app**
✅ **Users will be automatically signed in after signup**
✅ **No verification emails will be sent**

## Test It

1. **Go to** http://localhost:5174/
2. **Click "Sign up"**
3. **Fill out the form**
4. **You should be automatically signed in** and redirected to dashboard 