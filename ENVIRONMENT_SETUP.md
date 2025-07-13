# Environment Variables Setup Guide

## Quick Fix for Payment Button Errors

The "Payment Button cannot be added" error occurs because the Razorpay button IDs are not configured. Here's how to fix it:

### Option 1: Add Payment Button IDs (Recommended)

1. **Get Razorpay Button IDs:**
   - Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/payment-button)
   - Create two payment buttons: one for monthly ($49) and one for yearly ($399)
   - Copy the button IDs (they start with `pl_`)

2. **Add to your `.env` file:**
   ```env
   VITE_RAZORPAY_MONTHLY_BUTTON_ID=pl_your_monthly_button_id_here
   VITE_RAZORPAY_YEARLY_BUTTON_ID=pl_your_yearly_button_id_here
   ```

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

### Option 2: Use Fallback Mode (No Payment Setup Required)

If you don't want to set up payments right now, the app will automatically show a fallback UI with contact buttons instead of payment buttons.

## Complete Environment Variables

Here's a complete `.env` file template:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration (Required)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Payment Configuration (Optional)
VITE_RAZORPAY_MONTHLY_BUTTON_ID=pl_your_monthly_button_id_here
VITE_RAZORPAY_YEARLY_BUTTON_ID=pl_your_yearly_button_id_here

# Optional: Custom contact information
VITE_CONTACT_EMAIL=your-email@domain.com
VITE_SCHEDULE_URL=https://calendly.com/your-username/consultation
```

## Analytics Error Fix

The analytics tracking errors are now fixed! In development mode, analytics events are logged to the console only and won't break the app.

## Testing

After setting up the environment variables:

1. **Restart your development server**
2. **Check the browser console** for payment configuration logs
3. **Try the payment buttons** - they should work without errors

## Troubleshooting

### Payment Button Still Shows Error
- Make sure button IDs start with `pl_`
- Restart the development server after adding environment variables
- Check browser console for configuration logs

### Analytics Still Failing
- Analytics errors won't break the app anymore
- In development, events are logged to console only
- In production, make sure the `analytics_events` table exists in Supabase

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Verify your environment variables are correctly set
3. Restart your development server
4. Contact support if needed 