// Email Service Configuration
// This file helps you configure your email service provider

export interface EmailProviderConfig {
  provider: 'sendgrid' | 'mailgun' | 'resend' | 'mock';
  apiKey?: string;
  domain?: string;
  fromEmail?: string;
  fromName?: string;
}

// Default configuration - update these values in your .env file
export const defaultEmailConfig: EmailProviderConfig = {
  provider: 'mock', // Change to your preferred provider
  apiKey: import.meta.env.VITE_EMAIL_API_KEY,
  domain: import.meta.env.VITE_EMAIL_DOMAIN,
  fromEmail: import.meta.env.VITE_FROM_EMAIL || 'noreply@yourdomain.com',
  fromName: import.meta.env.VITE_FROM_NAME || 'LeadGen Machine'
};

// Provider-specific configuration examples
export const emailProviderExamples = {
  sendgrid: {
    provider: 'sendgrid' as const,
    apiKey: 'SG.your_sendgrid_api_key_here',
    fromEmail: 'noreply@yourdomain.com',
    fromName: 'Your Company Name'
  },
  mailgun: {
    provider: 'mailgun' as const,
    apiKey: 'key-your_mailgun_api_key_here',
    domain: 'yourdomain.com',
    fromEmail: 'noreply@yourdomain.com',
    fromName: 'Your Company Name'
  },
  resend: {
    provider: 'resend' as const,
    apiKey: 're_your_resend_api_key_here',
    fromEmail: 'noreply@yourdomain.com',
    fromName: 'Your Company Name'
  },
  mock: {
    provider: 'mock' as const,
    fromEmail: 'noreply@yourdomain.com',
    fromName: 'LeadGen Machine'
  }
};

// Environment variables template
export const envTemplate = `
# Email Service Configuration
# Choose one provider and configure its settings

# SendGrid Configuration
VITE_EMAIL_PROVIDER=sendgrid
VITE_EMAIL_API_KEY=SG.your_sendgrid_api_key_here
VITE_FROM_EMAIL=noreply@yourdomain.com
VITE_FROM_NAME=Your Company Name

# OR Mailgun Configuration
# VITE_EMAIL_PROVIDER=mailgun
# VITE_EMAIL_API_KEY=key-your_mailgun_api_key_here
# VITE_EMAIL_DOMAIN=yourdomain.com
# VITE_FROM_EMAIL=noreply@yourdomain.com
# VITE_FROM_NAME=Your Company Name

# OR Resend Configuration
# VITE_EMAIL_PROVIDER=resend
# VITE_EMAIL_API_KEY=re_your_resend_api_key_here
# VITE_FROM_EMAIL=noreply@yourdomain.com
# VITE_FROM_NAME=Your Company Name

# OR Mock Configuration (for development)
# VITE_EMAIL_PROVIDER=mock
# VITE_FROM_EMAIL=noreply@yourdomain.com
# VITE_FROM_NAME=LeadGen Machine
`;

// Helper function to get email configuration
export const getEmailConfig = (): EmailProviderConfig => {
  const provider = import.meta.env.VITE_EMAIL_PROVIDER as EmailProviderConfig['provider'] || 'mock';
  
  return {
    provider,
    apiKey: import.meta.env.VITE_EMAIL_API_KEY,
    domain: import.meta.env.VITE_EMAIL_DOMAIN,
    fromEmail: import.meta.env.VITE_FROM_EMAIL || 'noreply@yourdomain.com',
    fromName: import.meta.env.VITE_FROM_NAME || 'LeadGen Machine'
  };
};

// Validation function
export const validateEmailConfig = (config: EmailProviderConfig): string[] => {
  const errors: string[] = [];

  if (!config.fromEmail) {
    errors.push('From email is required');
  }

  if (!config.fromName) {
    errors.push('From name is required');
  }

  switch (config.provider) {
    case 'sendgrid':
      if (!config.apiKey) {
        errors.push('SendGrid API key is required');
      }
      break;
    case 'mailgun':
      if (!config.apiKey) {
        errors.push('Mailgun API key is required');
      }
      if (!config.domain) {
        errors.push('Mailgun domain is required');
      }
      break;
    case 'resend':
      if (!config.apiKey) {
        errors.push('Resend API key is required');
      }
      break;
    case 'mock':
      // No additional validation needed for mock
      break;
    default:
      errors.push('Invalid email provider');
  }

  return errors;
}; 