# 🔐 Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your Majorbeam SaaS platform.

## 📋 Prerequisites

- Supabase project created
- Google Cloud Console account
- Domain name (for production)

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

### Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - **App name**: Majorbeam
   - **User support email**: your-email@domain.com
   - **Developer contact information**: your-email@domain.com
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
5. Add test users (your email addresses)
6. Save and continue

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Fill in the details:
   - **Name**: Majorbeam Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:5175` (development)
     - `https://majorbeam.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:5175/auth/callback` (development)
     - `https://majorbeam.com/auth/callback` (production)
5. Click "Create"
6. **Copy the Client ID and Client Secret**

### Step 4: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" and click "Edit"
4. Enable Google provider
5. Enter your Google OAuth credentials:
   - **Client ID**: Your Google Client ID
   - **Client Secret**: Your Google Client Secret
6. Save the configuration

### Step 5: Update Environment Variables

Add these to your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_REDIRECT_URI=http://localhost:5175

# Google OAuth (optional - Supabase handles this)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to your app and click "Sign in with Google"
3. You should be redirected to Google's consent screen
4. After authorization, you should be redirected back to your app

## 🔧 Troubleshooting

### Common Issues

**"Error: redirect_uri_mismatch"**
- Check that your redirect URI in Google Console matches exactly
- Include both http and https versions for development
- Make sure there are no trailing slashes

**"Error: invalid_client"**
- Verify your Client ID and Client Secret are correct
- Make sure you copied them from the right project

**"Error: access_denied"**
- Check that your email is added as a test user
- Verify the OAuth consent screen is configured correctly

**"Error: popup_closed_by_user"**
- This is normal if user closes the popup
- The app should handle this gracefully

### Development vs Production

**Development:**
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_dev_anon_key
VITE_REDIRECT_URI=http://localhost:5175
```

**Production:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_prod_anon_key
VITE_REDIRECT_URI=https://majorbeam.com
```

## 🔒 Security Best Practices

1. **Never commit secrets to version control**
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Use HTTPS in production**
   - Google requires HTTPS for production OAuth
   - Set up SSL certificates

3. **Limit redirect URIs**
   - Only add the URIs you actually use
   - Remove old/development URIs when not needed

4. **Regular security reviews**
   - Review OAuth consent screen periodically
   - Monitor for suspicious activity

## 📱 Mobile Considerations

For mobile apps, you'll need different OAuth client types:

1. **Android**: Create Android OAuth client
2. **iOS**: Create iOS OAuth client
3. **React Native**: Use web client with custom redirect handling

## 🚀 Production Deployment

### 1. Update Google Console
- Add your production domain to authorized origins
- Add production redirect URI
- Remove development URLs if not needed

### 2. Update Supabase
- Ensure production Supabase project is configured
- Test OAuth flow in production environment

### 3. Environment Variables
```env
# Production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_REDIRECT_URI=https://majorbeam.com
```

## 📊 Monitoring & Analytics

### Google Cloud Console
- Monitor OAuth consent screen usage
- Check for any security issues
- Review API quotas

### Supabase Dashboard
- Monitor authentication events
- Check user sign-ups
- Review any failed authentication attempts

## 🔄 Maintenance

### Regular Tasks
1. **Monthly**: Review OAuth consent screen
2. **Quarterly**: Update app information
3. **Annually**: Review and rotate secrets

### Updates
- Keep Supabase SDK updated
- Monitor for Google OAuth changes
- Update redirect URIs as needed

## 📞 Support

If you encounter issues:

1. **Check Google Cloud Console logs**
2. **Review Supabase authentication logs**
3. **Test with different browsers**
4. **Clear browser cache and cookies**
5. **Check network tab for errors**

## 🎉 Success!

Once configured, users will be able to:
- ✅ Sign in with their Google account
- ✅ Access their Gmail profile information
- ✅ Seamlessly authenticate across your app
- ✅ Maintain session persistence

Your Majorbeam SaaS platform now has professional Google OAuth authentication! 🚀 