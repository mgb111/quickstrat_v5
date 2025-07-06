# LeadGen Machine - Complete Lead Generation System

A comprehensive AI-powered lead generation platform that automatically creates high-converting landing pages, captures leads, and manages email automation.

## 🚀 Features

### ✅ Hosted Landing Pages
- **Automatic Generation**: AI creates high-converting landing pages based on your input
- **Custom Subdomains**: Each campaign gets a unique QuickStrat subdomain (e.g., `campaign-123456.quickstrat.com`)
- **Responsive Design**: Mobile-optimized landing pages that convert
- **SEO Optimized**: Built with best practices for search engine visibility

### ✅ Built-in Lead Capture
- **Email Forms**: Working email capture forms on every landing page
- **Real-time Validation**: Email validation and error handling
- **Privacy Compliant**: GDPR and privacy-friendly lead capture
- **Instant Feedback**: Success/error messages for better UX

### ✅ Automated Email Delivery
- **Welcome Emails**: Automatic welcome emails sent to new leads
- **PDF Delivery**: Automated PDF delivery via email
- **Email Tracking**: Track email opens, clicks, and engagement
- **Follow-up Sequences**: Automated follow-up email sequences (coming soon)

### ✅ Lead Management Dashboard
- **Campaign Overview**: View all your campaigns in one place
- **Lead Analytics**: Real-time lead capture statistics
- **CSV Export**: Download leads as CSV for external use
- **Performance Metrics**: Conversion rates, email stats, and more

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for fast development and building
- **Lucide React** for icons

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** for data storage
- **Row Level Security** for data protection

### AI Integration
- **OpenAI GPT-4** for content generation
- **Structured Prompts** for consistent output
- **Multi-stage Generation** for quality control

## 📊 Database Schema

### Tables
- **users**: User accounts and subscription data
- **campaigns**: Campaign metadata and content
- **leads**: Captured email addresses
- **emails**: Email automation tracking

### Key Features
- **Automatic Lead Counting**: Triggers update lead counts in real-time
- **Unique Slug Generation**: Ensures unique landing page URLs
- **Data Relationships**: Proper foreign key relationships
- **Security Policies**: Row-level security for data protection

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quickstrat_v5
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run database migrations**
   ```bash
   npx supabase db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 Usage

### Creating a Campaign

1. **Fill out the campaign form** with your:
   - Brand name
   - Customer profile
   - Problem statement
   - Desired outcome

2. **Select a concept** from AI-generated options

3. **Review and approve** the content outline

4. **Generate final campaign** with landing page and social posts

5. **Create campaign** to get your hosted landing page

### Managing Leads

1. **Access dashboard** to view all campaigns
2. **View lead statistics** for each campaign
3. **Export leads** as CSV for external use
4. **Monitor performance** with real-time metrics

### Landing Pages

- **Automatic hosting** on QuickStrat subdomains
- **Email capture** with instant PDF delivery
- **Mobile responsive** design
- **SEO optimized** for better visibility

## 🔧 Configuration

### Email Automation

The system includes email automation capabilities:

```typescript
// Send welcome email
await EmailService.sendWelcomeEmail(email, campaignId, pdfContent, campaignName);

// Schedule follow-up emails
await EmailService.scheduleFollowUpEmails(campaignId);
```

### Custom Domains

To use custom domains instead of QuickStrat subdomains:

1. Configure your domain in Supabase
2. Update the landing page URL generation
3. Set up DNS records

## 📈 Analytics & Tracking

### Lead Metrics
- Total leads captured
- Email delivery rates
- PDF download rates
- Conversion rates

### Campaign Performance
- Landing page views
- Form submission rates
- Email engagement
- Revenue attribution

## 🔒 Security

### Data Protection
- **Row Level Security** on all database tables
- **User authentication** required for sensitive operations
- **Email validation** to prevent spam
- **Rate limiting** on API endpoints

### Privacy Compliance
- **GDPR compliant** lead capture
- **Data encryption** at rest and in transit
- **User consent** tracking
- **Data export/deletion** capabilities

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
1. Configure production environment variables
2. Set up Supabase production project
3. Configure custom domain (optional)
4. Set up email service integration

### Hosting Options
- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Any static hosting service**

## 🔮 Future Features

### Planned Enhancements
- **A/B Testing**: Test different landing page variations
- **Advanced Analytics**: Detailed conversion tracking
- **Email Sequences**: Multi-step email automation
- **CRM Integration**: Connect with popular CRMs
- **API Access**: REST API for external integrations
- **White-label**: Custom branding options

### Technical Improvements
- **Real-time Updates**: WebSocket connections for live data
- **Caching**: Redis for improved performance
- **CDN**: Global content delivery
- **Monitoring**: Application performance monitoring

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
- Create an issue in the repository
- Check the documentation
- Contact the development team

---

**Built with ❤️ by the QuickStrat team** 