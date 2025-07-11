# QuickStrat Deployment Integration Guide

## Current Setup

You have your QuickStrat app deployed at: **https://timely-custard-48519d.netlify.app/**

## Integration Options

### Option 1: Use Netlify as Your Main Landing Page (Recommended)

**What this means:** Your Netlify deployment becomes the public-facing landing page, and users click "Get Started" to access the full app.

**Steps:**
1. **Update your Netlify deployment** with the new `PublicLandingPage` component
2. **Configure environment variables** in Netlify dashboard:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_EMAIL_PROVIDER=your_email_provider
   VITE_EMAIL_API_KEY=your_email_api_key
   ```
3. **Set up a custom domain** (optional) for a more professional look

**Benefits:**
- Single deployment to manage
- Consistent branding
- Easy to update
- Built-in analytics

### Option 2: Separate Landing Page and App

**What this means:** Keep your current Netlify deployment as a marketing site, and deploy the full app separately.

**Steps:**
1. **Deploy the full app** to a different platform (Vercel, Netlify, etc.)
2. **Update the Netlify landing page** to link to your app URL
3. **Configure both deployments** with appropriate environment variables

**Benefits:**
- Separation of concerns
- Different update cycles
- More flexibility in design

### Option 3: Subdomain Setup

**What this means:** Use `app.yourdomain.com` for the full app and `yourdomain.com` for the landing page.

**Steps:**
1. **Set up DNS records** for your domain
2. **Deploy landing page** to root domain
3. **Deploy full app** to app subdomain
4. **Configure cross-domain authentication** if needed

## Recommended Approach: Option 1

I recommend **Option 1** because:

1. **Simpler management** - One deployment to maintain
2. **Better user experience** - Seamless flow from landing to app
3. **Cost effective** - Single hosting plan
4. **Easier analytics** - Track the full user journey

## Implementation Steps

### 1. Update Your Netlify Deployment

The new `PublicLandingPage` component has been added to your app. To deploy it:

```bash
# In your local project
git add .
git commit -m "Add public landing page"
git push origin main
```

Netlify will automatically deploy the changes.

### 2. Configure Environment Variables

In your Netlify dashboard:
1. Go to **Site settings** → **Environment variables**
2. Add all required variables from your `.env` file
3. Redeploy the site

### 3. Test the Integration

1. Visit your Netlify URL
2. You should see the new public landing page
3. Click "Get Started" to test the authentication flow
4. Verify the full app functionality

## Custom Domain Setup

### Using Netlify's Domain Management

1. **Add custom domain** in Netlify dashboard
2. **Configure DNS** (Netlify provides instructions)
3. **Enable HTTPS** (automatic with Netlify)

### Example Domain Structure

```
yourdomain.com          → Public landing page
app.yourdomain.com      → Full application (optional)
landing.yourdomain.com  → Campaign landing pages (automatic)
```

## Email Service Configuration

### For Production

Update your email service configuration in Netlify environment variables:

```env
# Choose one provider
VITE_EMAIL_PROVIDER=sendgrid
VITE_EMAIL_API_KEY=SG.your_sendgrid_api_key
VITE_FROM_EMAIL=noreply@yourdomain.com
VITE_FROM_NAME=QuickStrat

# Or for Mailgun
VITE_EMAIL_PROVIDER=mailgun
VITE_EMAIL_API_KEY=key-your_mailgun_api_key
VITE_EMAIL_DOMAIN=yourdomain.com
```

## Analytics and Monitoring

### Built-in Analytics

Your app includes:
- Lead capture tracking
- Email delivery status
- PDF download tracking
- Campaign performance metrics

### Additional Monitoring

Consider adding:
- **Google Analytics** for user behavior
- **Sentry** for error tracking
- **LogRocket** for session replay

## Security Considerations

### Environment Variables

- ✅ Never commit `.env` files
- ✅ Use Netlify's environment variable system
- ✅ Rotate API keys regularly
- ✅ Use different keys for development and production

### Authentication

- ✅ Supabase handles user authentication securely
- ✅ Row-level security policies protect data
- ✅ Anonymous sessions are isolated

## Troubleshooting

### Common Issues

**"Failed to load campaigns"**
- Check Supabase connection in environment variables
- Verify database migrations are applied

**"Authentication not working"**
- Ensure Supabase URL and keys are correct
- Check browser console for detailed errors

**"Email not sending"**
- Verify email provider configuration
- Check API keys and domain verification

### Debug Mode

Enable debug logging by adding to environment variables:
```env
VITE_DEBUG=true
```

## Next Steps

1. **Deploy the updated app** to Netlify
2. **Configure environment variables**
3. **Test the complete user flow**
4. **Set up custom domain** (optional)
5. **Configure email service** for production
6. **Add analytics** for better insights

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Test with the debug mode enabled
4. Review the Supabase dashboard for database issues

The integration should provide a seamless experience from your public landing page to the full application functionality! 