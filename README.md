# LeadGen Machine 🚀

A comprehensive lead generation system with AI-powered content creation, hosted landing pages, automated email delivery, and lead management dashboard.

## ✨ Features

### 🎯 Core Features
- **AI-Powered Campaign Creation**: Generate focused lead magnets based on customer problems
- **Hosted Landing Pages**: Automatic subdomain creation for each campaign
- **Email Capture**: Built-in forms with validation and spam protection
- **Automated PDF Delivery**: Professional PDF generation and email delivery
- **Lead Management Dashboard**: Track leads, export data, and view analytics
- **CSV Export**: Download lead data for external CRM integration

### 🔧 Technical Features
- **React + TypeScript**: Modern, type-safe frontend
- **Supabase Backend**: Real-time database with row-level security
- **Error Boundaries**: Graceful error handling throughout the app
- **Loading States**: Comprehensive loading indicators and skeleton screens
- **Responsive Design**: Works perfectly on desktop and mobile
- **Email Service Integration**: Support for SendGrid, Mailgun, and Resend

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd quickstrat_v5
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key

# Email Service Configuration (Choose one provider)
VITE_EMAIL_PROVIDER=mock
VITE_FROM_EMAIL=noreply@yourdomain.com
VITE_FROM_NAME=LeadGen Machine

# For SendGrid
# VITE_EMAIL_PROVIDER=sendgrid
# VITE_EMAIL_API_KEY=SG.your_sendgrid_api_key

# For Mailgun
# VITE_EMAIL_PROVIDER=mailgun
# VITE_EMAIL_API_KEY=key-your_mailgun_api_key
# VITE_EMAIL_DOMAIN=yourdomain.com

# For Resend
# VITE_EMAIL_PROVIDER=resend
# VITE_EMAIL_API_KEY=re_your_resend_api_key
```

### 3. Database Setup
Run the database migrations in your Supabase SQL Editor:

```sql
-- Create tables and policies
-- (The full migration SQL is in supabase/migrations/)
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see your application!

## 📧 Email Service Setup

### Option 1: SendGrid (Recommended)
1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key with "Mail Send" permissions
3. Verify your sender domain
4. Add to `.env`:
```env
VITE_EMAIL_PROVIDER=sendgrid
VITE_EMAIL_API_KEY=SG.your_api_key_here
VITE_FROM_EMAIL=noreply@yourdomain.com
```

### Option 2: Mailgun
1. Sign up at [Mailgun](https://mailgun.com)
2. Add and verify your domain
3. Create an API key
4. Add to `.env`:
```env
VITE_EMAIL_PROVIDER=mailgun
VITE_EMAIL_API_KEY=key-your_api_key_here
VITE_EMAIL_DOMAIN=yourdomain.com
```

### Option 3: Resend
1. Sign up at [Resend](https://resend.com)
2. Create an API key
3. Add to `.env`:
```env
VITE_EMAIL_PROVIDER=resend
VITE_EMAIL_API_KEY=re_your_api_key_here
```

### Option 4: Mock (Development)
For development, use the mock provider:
```env
VITE_EMAIL_PROVIDER=mock
```

## 🏗️ Project Structure

```
quickstrat_v5/
├── src/
│   ├── components/          # React components
│   │   ├── CampaignForm.tsx
│   │   ├── Dashboard.tsx
│   │   ├── LandingPage.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── lib/                 # Services and utilities
│   │   ├── openai.ts        # OpenAI API integration
│   │   ├── supabase.ts      # Supabase client
│   │   ├── campaignService.ts
│   │   ├── emailService.ts  # Email delivery
│   │   └── emailConfig.ts   # Email configuration
│   ├── types/               # TypeScript type definitions
│   └── App.tsx              # Main application
├── supabase/                # Database migrations
└── public/                  # Static assets
```

## 🔧 Configuration

### Landing Page URLs
Landing pages are automatically created at:
```
https://yourdomain.com/landing/{campaign-slug}
```

### Email Templates
Email templates are customizable in `src/lib/emailService.ts`. The system includes:
- Welcome emails with PDF attachments
- Follow-up email sequences
- Professional HTML and text versions

### Database Schema
The system uses these main tables:
- `campaigns`: Campaign information and content
- `leads`: Captured email addresses
- `emails`: Email delivery tracking
- `users`: User accounts (for future use)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your web server
```

## 🐛 Troubleshooting

### Common Issues

**"Failed to load campaigns"**
- Check Supabase connection in `.env`
- Verify database migrations are applied
- Check browser console for detailed errors

**"Failed to send email"**
- Verify email provider configuration
- Check API keys are correct
- Ensure sender email is verified

**"PDF download not working"**
- Check if email was captured first
- Verify PDF generation is working
- Check browser console for errors

### Debug Mode
Enable debug logging by adding to `.env`:
```env
VITE_DEBUG=true
```

### Error Boundaries
The app includes comprehensive error boundaries that will:
- Catch and display errors gracefully
- Provide retry options
- Log errors for debugging
- Show development details in dev mode

## 📊 Analytics & Monitoring

### Built-in Analytics
- Lead capture rates
- Email delivery success
- PDF download tracking
- Campaign performance metrics

### External Monitoring
Consider adding:
- [Sentry](https://sentry.io) for error tracking
- [Google Analytics](https://analytics.google.com) for user behavior
- [LogRocket](https://logrocket.com) for session replay

## 🔒 Security

### Data Protection
- Row-level security policies in Supabase
- Email validation and spam protection
- Secure API key handling
- Anonymous user session isolation

### Best Practices
- Never commit `.env` files
- Use environment variables for secrets
- Regularly rotate API keys
- Monitor for suspicious activity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section above
- Review the code comments for implementation details
- Open an issue on GitHub
- Contact the development team

---

**Made with ❤️ by the LeadGen Machine team** 