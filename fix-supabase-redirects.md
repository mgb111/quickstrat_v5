# Fix Supabase Redirect URLs for Local Development

## Problem
Supabase is redirecting to the Netlify domain (`resilient-caramel-15133d.netlify.app`) instead of localhost.

## Solution: Update Supabase Redirect URLs

### Step 1: Go to Supabase Dashboard
1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Authentication** → **Settings**

### Step 2: Update Site URL
1. Find **"Site URL"** field
2. Change it to: `http://localhost:5175`
3. **Save changes**

### Step 3: Update Redirect URLs
1. Find **"Redirect URLs"** section
2. Add these URLs (one per line):
   ```
   http://localhost:5175
   http://localhost:5175/dashboard
   http://localhost:5175/auth
   http://localhost:3000
   http://localhost:3000/dashboard
   http://localhost:3000/auth
   ```
3. **Keep your existing Netlify URLs** for production
4. **Save changes**

### Step 4: Update Google OAuth (If using Google login)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add to **Authorized redirect URIs**:
   ```
   http://localhost:5175/auth/callback
   http://localhost:3000/auth/callback
   ```
6. **Save**

## What This Does
- ✅ **Keeps you on localhost during development**
- ✅ **Prevents redirects to Netlify**
- ✅ **Maintains production URLs for deployment**
- ✅ **Works with both email and Google auth**

## Test It
1. Go to http://localhost:5175/
2. Try signing up or signing in
3. You should stay on localhost instead of redirecting to Netlify

## Alternative: Use Email/Password Only
If you want to avoid OAuth redirect issues during development:
- Use email/password signup instead of Google
- This avoids the OAuth redirect URL configuration
- Perfect for development and testing 