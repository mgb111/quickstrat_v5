// Payment Configuration
// This file centralizes all payment-related settings

export interface PaymentConfig {
  enabled: boolean;
  provider: 'razorpay' | 'stripe' | 'paypal' | 'none';
  buttonIds: {
    monthly?: string;
    yearly?: string;
  };
  fallbackAction: 'contact' | 'schedule' | 'email' | 'none';
  contactEmail: string;
  scheduleUrl: string;
}

// Get payment configuration from environment variables
export const getPaymentConfig = (): PaymentConfig => {
  const monthlyButtonId = import.meta.env.VITE_RAZORPAY_MONTHLY_BUTTON_ID;
  const yearlyButtonId = import.meta.env.VITE_RAZORPAY_YEARLY_BUTTON_ID;
  
  // Debug logging to help identify configuration issues
  console.log('🔧 Payment Configuration Check:', {
    monthlyButtonId: monthlyButtonId ? `${monthlyButtonId.substring(0, 10)}...` : 'NOT SET',
    yearlyButtonId: yearlyButtonId ? `${yearlyButtonId.substring(0, 10)}...` : 'NOT SET',
    monthlyValid: isValidButtonId(monthlyButtonId),
    yearlyValid: isValidButtonId(yearlyButtonId),
    isDev: import.meta.env.DEV
  });
  
  // Check if we have valid button IDs
  const hasValidButtonIds = !!(monthlyButtonId && yearlyButtonId && 
    monthlyButtonId.startsWith('pl_') && yearlyButtonId.startsWith('pl_'));
  
  if (!hasValidButtonIds) {
    console.warn('⚠️ Payment buttons not configured. Add VITE_RAZORPAY_MONTHLY_BUTTON_ID and VITE_RAZORPAY_YEARLY_BUTTON_ID to your .env file');
  }
  
  return {
    enabled: hasValidButtonIds,
    provider: hasValidButtonIds ? 'razorpay' : 'none',
    buttonIds: {
      monthly: monthlyButtonId,
      yearly: yearlyButtonId
    },
    fallbackAction: 'contact',
    contactEmail: 'contact@majorbeam.com',
    scheduleUrl: 'https://calendly.com/majorbeam/consultation'
  };
};

// Validate button ID format
export const isValidButtonId = (id: string | undefined): boolean => {
  return !!(id && id.startsWith('pl_') && id.length > 10 && id.length < 50);
};

// Get pricing information
export const getPricing = () => {
  return {
    premium: {
      monthly: {
        price: 49,
        period: 'month',
        features: [
          '✅ Unlimited PDF downloads',
          '✅ 5 campaigns per month',
          '✅ Landing page generation',
          '✅ Lead capture & management',
          '✅ Complete end-to-end campaigns',
          '✅ Priority support',
          '✅ Advanced customization options',
          '✅ Branded templates'
        ]
      },
      yearly: {
        price: 399,
        period: 'year',
        features: [
          '✅ Unlimited PDF downloads',
          '✅ 5 campaigns per month',
          '✅ Landing page generation',
          '✅ Lead capture & management',
          '✅ Complete end-to-end campaigns',
          '✅ Priority support',
          '✅ Advanced customization options',
          '✅ Branded templates'
        ],
        savings: 189 // $49 * 12 - $399 = $189 savings
      }
    }
  };
};

// Environment variables template for easy setup
export const envTemplate = `
# Payment Configuration
# Add these to your .env file to enable payments

# Razorpay Payment Button IDs (Required for payments)
# Get these from your Razorpay dashboard
VITE_RAZORPAY_MONTHLY_BUTTON_ID=pl_your_monthly_button_id_here
VITE_RAZORPAY_YEARLY_BUTTON_ID=pl_your_yearly_button_id_here

# Optional: Custom contact information
# VITE_CONTACT_EMAIL=your-email@domain.com
# VITE_SCHEDULE_URL=https://calendly.com/your-username/consultation
`;

// Helper function to check if payments are properly configured
export const isPaymentConfigured = (): boolean => {
  const config = getPaymentConfig();
  return config.enabled && config.provider !== 'none';
};

// Get fallback action based on configuration
export const getFallbackAction = () => {
  const config = getPaymentConfig();
  
  switch (config.fallbackAction) {
    case 'contact':
      return {
        primary: {
          text: '📧 Contact Us to Upgrade',
          action: () => window.open(`mailto:${config.contactEmail}?subject=Premium Plan Inquiry`, '_blank')
        },
        secondary: {
          text: '📅 Schedule a Call',
          action: () => window.open(config.scheduleUrl, '_blank')
        }
      };
    case 'schedule':
      return {
        primary: {
          text: '📅 Schedule a Call',
          action: () => window.open(config.scheduleUrl, '_blank')
        },
        secondary: {
          text: '📧 Contact Us',
          action: () => window.open(`mailto:${config.contactEmail}?subject=Premium Plan Inquiry`, '_blank')
        }
      };
    default:
      return {
        primary: {
          text: '📧 Contact Us',
          action: () => window.open(`mailto:${config.contactEmail}?subject=Premium Plan Inquiry`, '_blank')
        },
        secondary: {
          text: '📅 Schedule a Call',
          action: () => window.open(config.scheduleUrl, '_blank')
        }
      };
  }
}; 