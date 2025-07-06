# 🚀 Authentication System Deployment Guide

## 📋 Prerequisites

1. **Supabase Project Setup**
   - Create a new Supabase project
   - Get your project URL and anon key
   - Enable Google OAuth provider

2. **Google OAuth Setup**
   - Follow the `GOOGLE_OAUTH_SETUP.md` guide
   - Configure OAuth consent screen
   - Create OAuth 2.0 credentials

3. **Environment Variables**
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 🔧 Database Setup

### Step 1: Run Migrations

1. **Option A: Supabase Dashboard (Recommended)**
   - Go to your Supabase project dashboard
   - Navigate to "SQL Editor"
   - Copy and paste the contents of `supabase/migrations/20250103000000_auth_setup.sql`
   - Click "Run" to execute the migration

2. **Option B: Supabase CLI**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link your project
   supabase link --project-ref your-project-ref
   
   # Run migrations
   supabase db push
   ```

### Step 2: Verify Setup

Check that these tables were created:
- `users` - Extended user data
- `user_profiles` - Additional profile information
- `user_sessions` - Session tracking
- Updated `campaigns` table with `user_id` column

## 🔐 Authentication Configuration

### Step 1: Configure Supabase Auth

1. Go to your Supabase dashboard
2. Navigate to "Authentication" > "Settings"
3. Configure the following:

   **Site URL:**
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`

   **Redirect URLs:**
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

### Step 2: Enable Google Provider

1. Go to "Authentication" > "Providers"
2. Find "Google" and click "Edit"
3. Enable the provider
4. Enter your Google OAuth credentials:
   - Client ID
   - Client Secret
5. Save the configuration

### Step 3: Configure Email Templates

1. Go to "Authentication" > "Email Templates"
2. Customize the following templates:
   - **Confirm signup**: Welcome email with verification link
   - **Reset password**: Password reset instructions
   - **Magic link**: Sign-in link

## 🧪 Testing the Setup

### Step 1: Local Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test authentication flow:
   - Visit `http://localhost:5173`
   - Click "Sign up for free"
   - Try both email/password and Google sign-in
   - Verify email confirmation (check console for development)

### Step 2: Test User Management

1. **Sign Up Flow:**
   - Create a new account
   - Verify email (in development, check console)
   - Complete profile setup

2. **Sign In Flow:**
   - Sign in with email/password
   - Sign in with Google
   - Test "Forgot Password"

3. **Profile Management:**
   - Navigate to Profile page
   - Update user information
   - Test sign out

### Step 3: Test Campaign Creation

1. **Authenticated User:**
   - Sign in to the app
   - Create a new campaign
   - Verify it's saved to the database
   - Check dashboard shows the campaign

2. **Unauthenticated User:**
   - Try to access dashboard without signing in
   - Should be redirected to auth page

## 🚀 Production Deployment

### Step 1: Environment Setup

1. **Update Environment Variables:**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_production_anon_key
   ```

2. **Update Google OAuth:**
   - Add production domain to authorized origins
   - Add production redirect URI
   - Remove development URLs

### Step 2: Build and Deploy

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to your hosting platform:**
   - Vercel, Netlify, or your preferred platform
   - Set environment variables in your hosting platform

### Step 3: Post-Deployment Verification

1. **Test Production Authentication:**
   - Visit your production URL
   - Test sign up/sign in flows
   - Verify Google OAuth works

2. **Check Database:**
   - Verify users are being created
   - Check that campaigns are associated with users
   - Test lead capture functionality

## 🔒 Security Considerations

### 1. Row Level Security (RLS)

The migration includes RLS policies that ensure:
- Users can only access their own data
- Campaigns are isolated by user
- Leads are protected by campaign ownership

### 2. Environment Variables

- Never commit `.env` files to version control
- Use different keys for development and production
- Rotate keys regularly

### 3. OAuth Security

- Use HTTPS in production
- Regularly review OAuth consent screen
- Monitor for suspicious activity

## 🐛 Troubleshooting

### Common Issues

**"Authentication required" errors:**
- Check that user is signed in
- Verify RLS policies are working
- Check browser console for auth errors

**Google OAuth not working:**
- Verify redirect URIs match exactly
- Check that OAuth consent screen is configured
- Ensure HTTPS is used in production

**Database connection errors:**
- Verify Supabase URL and keys
- Check that migrations ran successfully
- Ensure RLS policies are enabled

### Debug Steps

1. **Check Browser Console:**
   - Look for authentication errors
   - Verify API calls are working

2. **Check Supabase Logs:**
   - Go to "Logs" in Supabase dashboard
   - Look for authentication events
   - Check for database errors

3. **Test Database Directly:**
   - Use Supabase SQL Editor
   - Run test queries to verify data

## 📊 Monitoring

### 1. Supabase Dashboard

Monitor these metrics:
- Authentication events
- Database performance
- API usage

### 2. Application Logs

Track these events:
- User sign-ups
- Failed authentication attempts
- Campaign creation

### 3. Google Cloud Console

Monitor OAuth usage:
- Consent screen metrics
- API quotas
- Security events

## 🎉 Success!

Once deployed, your LeadGen Machine will have:

✅ **Complete Authentication System**
- Email/password sign up and sign in
- Google OAuth integration
- Password reset functionality
- Email verification

✅ **User Management**
- User profiles and settings
- Session management
- Account security

✅ **Multi-tenant Architecture**
- User data isolation
- Secure campaign management
- Protected lead data

✅ **Production Ready**
- Row Level Security
- Environment-based configuration
- Monitoring and logging

Your SaaS platform is now ready for real users! 🚀 