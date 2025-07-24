#!/bin/bash

# Majorbeam Deployment Script
# This script helps set up and deploy the complete lead generation system

echo "🚀 Majorbeam Deployment Script"
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating template..."
    cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Optional: Custom Domain (for production)
# VITE_CUSTOM_DOMAIN=your-domain.com
EOF
    echo "📝 Please update the .env file with your actual API keys"
    echo "   - Get Supabase keys from: https://supabase.com/dashboard"
    echo "   - Get OpenAI key from: https://platform.openai.com/api-keys"
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# Database setup instructions
echo ""
echo "🗄️  Database Setup Instructions:"
echo "================================"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Get your project URL and anon key from Settings > API"
echo "3. Update your .env file with the Supabase credentials"
echo "4. Run the database migrations:"
echo "   npx supabase db push"
echo ""

# Deployment options
echo "🚀 Deployment Options:"
echo "======================"
echo "1. Vercel (Recommended):"
echo "   - Install Vercel CLI: npm i -g vercel"
echo "   - Deploy: vercel --prod"
echo ""
echo "2. Netlify:"
echo "   - Drag and drop the 'dist' folder to Netlify"
echo "   - Or use Netlify CLI: netlify deploy --prod --dir=dist"
echo ""
echo "3. Any static hosting service:"
echo "   - Upload the contents of the 'dist' folder"
echo ""

# Email service setup
echo "📧 Email Service Setup:"
echo "======================="
echo "For production email automation, you'll need to:"
echo "1. Set up an email service (SendGrid, Mailgun, etc.)"
echo "2. Update the EmailService class in src/lib/emailService.ts"
echo "3. Configure email templates and automation rules"
echo ""

echo "🎉 Setup complete! Your Majorbeam is ready to deploy."
echo ""
echo "Next steps:"
echo "1. Update .env with your API keys"
echo "2. Run database migrations"
echo "3. Deploy to your preferred hosting service"
echo "4. Set up email automation for production"
echo ""
echo "📚 For more information, see the README.md file" 