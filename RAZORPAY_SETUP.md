# 🔗 Razorpay Payment Setup Guide

## Current Status
The Razorpay payment integration is configured but requires valid payment button IDs to work properly.

## Quick Fix

### Option 1: Use Demo Button IDs (For Testing)
The app currently uses demo button IDs that may not work. For testing purposes, you can:

1. **Create your own Razorpay account** at [razorpay.com](https://razorpay.com)
2. **Create payment buttons** in your Razorpay dashboard
3. **Get the button IDs** and add them to your `.env` file

### Option 2: Set Up Environment Variables
Add these to your `.env` file:

```env
# Razorpay Payment Button IDs
VITE_RAZORPAY_MONTHLY_BUTTON_ID=pl_your_monthly_button_id_here
VITE_RAZORPAY_YEARLY_BUTTON_ID=pl_your_yearly_button_id_here
```

## Step-by-Step Razorpay Setup

### 1. Create Razorpay Account
1. Go to [razorpay.com](https://razorpay.com)
2. Sign up for a free account
3. Complete KYC verification

### 2. Create Payment Buttons
1. **Go to Payment Button section** in your Razorpay dashboard
2. **Create Monthly Button:**
   - Name: "Monthly Premium Plan"
   - Amount: ₹3999 (or your preferred price)
   - Currency: INR
   - Description: "Monthly Premium Subscription"
3. **Create Yearly Button:**
   - Name: "Yearly Premium Plan"
   - Amount: ₹39999 (or your preferred price)
   - Currency: INR
   - Description: "Yearly Premium Subscription"

### 3. Get Button IDs
1. After creating each button, you'll get a button ID
2. Button IDs start with `pl_` (e.g., `pl_QsXORcrhWghFgg`)
3. Copy both IDs

### 4. Update Environment Variables
Add the button IDs to your `.env` file:

```env
VITE_RAZORPAY_MONTHLY_BUTTON_ID=pl_your_actual_monthly_id
VITE_RAZORPAY_YEARLY_BUTTON_ID=pl_your_actual_yearly_id
```

### 5. Test the Integration
1. Restart your development server
2. Go to the pricing section
3. Payment buttons should load without errors

## Troubleshooting

### "Payment Button cannot be added" Error
This means the button ID is invalid or doesn't exist.

**Solutions:**
1. ✅ Check that button IDs start with `pl_`
2. ✅ Verify the IDs in your Razorpay dashboard
3. ✅ Make sure the buttons are active (not disabled)
4. ✅ Check that you're using the correct environment variables

### Button Not Loading
**Solutions:**
1. ✅ Check your internet connection
2. ✅ Verify Razorpay script is loading (check browser console)
3. ✅ Make sure button IDs are correct
4. ✅ Try refreshing the page

### Test Mode vs Live Mode
- **Test Mode**: Use test button IDs for development
- **Live Mode**: Use live button IDs for production

## Current Error Details
The current error shows:
- Button ID: `pl_QsXORcrhWghFgg` (monthly)
- Button ID: `pl_QsXQiWLwBcQ8x5` (yearly)

These appear to be demo/test IDs that may not be valid.

## Next Steps
1. **For Development**: Create test buttons in Razorpay test mode
2. **For Production**: Create live buttons in Razorpay live mode
3. **Update Environment Variables**: Add the correct button IDs
4. **Test Payment Flow**: Verify the complete payment process works

## Alternative: Disable Payment Buttons
If you want to temporarily disable payment buttons, you can:

1. **Comment out the PricingSection** in your components
2. **Or modify the component** to show a "Coming Soon" message
3. **Or use a different payment provider** like Stripe

## Support
- **Razorpay Documentation**: [docs.razorpay.com](https://docs.razorpay.com)
- **Payment Button Guide**: [docs.razorpay.com/docs/payment-button](https://docs.razorpay.com/docs/payment-button)
- **Contact Razorpay**: [razorpay.com/support](https://razorpay.com/support) 