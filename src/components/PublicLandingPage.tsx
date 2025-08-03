import React, { useState } from 'react';
import { Check, Zap, Users, FileText, TrendingUp, Target, Download, Play, Star, ChevronDown, Crown, Sparkles, ArrowRight, ArrowUpRight, Lightbulb, CheckCircle, Search, BarChart3, Clock, List, Brain } from 'lucide-react';

interface PublicLandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const PublicLandingPage: React.FC<PublicLandingPageProps> = ({ onLogin }) => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const monthlyPrice = 29;
  const yearlyPrice = 249;

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="bg-yellow-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Majorbeam</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-600 hover:text-yellow-700 transition-colors font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-gray-600 hover:text-yellow-700 transition-colors font-medium"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-600 hover:text-yellow-700 transition-colors font-medium"
              >
                Testimonials
              </button>
              <button 
                onClick={() => scrollToSection('faq')}
                className="text-gray-600 hover:text-yellow-700 transition-colors font-medium"
              >
                FAQ
              </button>
              <button 
                onClick={onLogin}
                className="bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 hover:shadow-lg transition-all duration-300"
              >
                Get Started
              </button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMobileMenu}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className={`md:hidden ${mobileMenuOpen ? '' : 'hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
              <button 
                onClick={() => scrollToSection('features')}
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-yellow-700 transition-colors font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-yellow-700 transition-colors font-medium"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-yellow-700 transition-colors font-medium"
              >
                Testimonials
              </button>
              <button 
                onClick={() => scrollToSection('faq')}
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-yellow-700 transition-colors font-medium"
              >
                FAQ
              </button>
              <button 
                onClick={onLogin}
                className="w-full mt-2 bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-700"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Majorbeam Style */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Lead Magnet Generator
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Create Professional
              <span className="text-gray-700"> Lead Magnets</span>
              <br />
              in Minutes
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Generate high-converting lead magnets that capture up to 50 emails per campaign. 
              No design skills required.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button 
                onClick={onLogin}
                className="bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center"
              >
                Start Creating Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>
            
            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-yellow-600 border-2 border-white"></div>
                  ))}
              </div>
                <span>Join 10,000+ creators</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-gray-700 mr-1" />
                <span>4.9/5 from 2,000+ reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image/Preview - Majorbeam Style */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="relative">
            {/* Main App Screenshot */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Side - Form */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                      <input type="text" placeholder="My Lead Magnet Campaign" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>Select your industry</option>
                        <option>SaaS & Technology</option>
                        <option>Coaching & Consulting</option>
                        <option>E-commerce</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                      <input type="text" placeholder="e.g., Small business owners" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <button className="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-yellow-700 hover:shadow-lg transition-all duration-300">
                      Generate Lead Magnet
                    </button>
                  </div>
                  
                  {/* Right Side - Preview */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-2">"5 Proven Strategies to Double Your Revenue"</h3>
                      <p className="text-gray-600 text-sm mb-4">A comprehensive guide for small business owners looking to scale their operations and increase profits.</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <FileText className="w-4 h-4 text-yellow-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">PDF Ready</span>
                        </div>
                        <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700">
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Majorbeam Style */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create your first lead magnet in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
                              <div className="bg-yellow-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                  1
                </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Describe Your Campaign</h3>
              <p className="text-gray-600 mb-6">
                Tell us about your industry, target audience, and campaign goals. Our AI understands your niche and creates personalized content.
              </p>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="space-y-3">
                  <input type="text" placeholder="Campaign name..." className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
                  <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                    <option>Select industry...</option>
                  </select>
                  <input type="text" placeholder="Target audience..." className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
                              <div className="bg-yellow-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                  2
                </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Generates Content</h3>
              <p className="text-gray-600 mb-6">
                Our AI creates compelling titles, outlines, and complete PDF content tailored to your audience and industry.
              </p>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">"5 Proven Strategies to..."</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-700 rounded-full mr-2"></div>
                      <span>Strategy 1: Optimize your funnel</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-700 rounded-full mr-2"></div>
                      <span>Strategy 2: Leverage social proof</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-700 rounded-full mr-2"></div>
                      <span>Strategy 3: Implement automation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
                              <div className="bg-yellow-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                  3
                </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Download & Launch</h3>
              <p className="text-gray-600 mb-6">
                Get your professional PDF, landing page, and email capture system ready to start generating leads immediately.
              </p>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">PDF Lead Magnet</span>
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
            </div>
          </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">Landing Page</span>
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-yellow-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Email Capture</span>
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to Generate Leads
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From concept to campaign launch in minutes, not hours
            </p>
                </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-6">
                <Sparkles className="w-6 h-6 text-yellow-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Content</h3>
              <p className="text-gray-600 mb-6">
                Generate compelling lead magnet content in seconds with our advanced AI that understands your industry and audience.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Industry-specific content
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  SEO-optimized titles
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Engaging hooks
                </li>
              </ul>
              </div>
              
            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-6">
                <Download className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Professional PDFs</h3>
              <p className="text-gray-600 mb-6">
                Create stunning, branded PDFs that establish your authority and convert visitors into high-quality leads.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Custom branding
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Professional design
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Instant download
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-6">
                <Target className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Landing Pages</h3>
              <p className="text-gray-600 mb-6">
                Generate high-converting landing pages that capture emails and drive your lead generation campaigns.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Mobile-optimized
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  A/B testing ready
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Analytics included
                </li>
              </ul>
              </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-6">
                <Users className="w-6 h-6 text-yellow-600" />
            </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Email Capture</h3>
              <p className="text-gray-600 mb-6">
                Built-in email capture system with export functionality to manage and nurture your leads effectively.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Lead export
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Email validation & filtering
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  CRM integration ready
                </li>
              </ul>
          </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-6">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Campaign Analytics</h3>
              <p className="text-gray-600 mb-6">
                Track performance, conversion rates, and optimize your lead generation campaigns with detailed analytics.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Real-time metrics
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Conversion tracking
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Performance insights
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-6">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600 mb-6">
                Generate complete lead magnet campaigns in minutes, not hours. From concept to launch in under 10 minutes.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Instant generation
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  One-click setup
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Ready to launch
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>



      {/* Social Proof Section 1 - Stats */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Trusted by 10,000+ Creators
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join creators who are generating more leads with our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-700 mb-2">50+</div>
              <div className="text-gray-600">Emails per campaign</div>
              </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-700 mb-2">10 min</div>
              <div className="text-gray-600">Average creation time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-700 mb-2">300%</div>
              <div className="text-gray-600">Conversion increase</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-700 mb-2">4.9/5</div>
              <div className="text-gray-600">User rating</div>
            </div>
          </div>
        </div>
      </section>

            {/* Scrolling Social Proof - Majorbeam Style */}
      <section className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Loved by creators worldwide
            </h2>
            <p className="text-gray-600">
              See what our users are saying about Majorbeam
            </p>
          </div>
          
          <div className="relative">
            {/* Top row - scrolls faster */}
            <div className="flex space-x-6 animate-scroll mb-4">
              <div className="flex space-x-6 flex-shrink-0">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" alt="Sarah" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Emma Rodriguez</div>
                      <div className="text-sm text-gray-600">GrowthLead</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "Majorbeam helped me create a lead magnet that captured <span className="bg-red-100 px-1 rounded">47 emails in the first week</span>. The AI-generated content was spot-on and saved me hours of work!"
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="Mike" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Mike Chen</div>
                      <div className="text-sm text-gray-600">CloudFlow</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "We generated 350+ new leads in two weeks using Majorbeam's AI-powered campaigns. It's a must-have for SaaS growth."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" alt="Amanda" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Amanda Lee</div>
                      <div className="text-sm text-gray-600">CreativeStudio</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "Majorbeam's lead magnets doubled our email signups in a month. The content feels tailored for our audience."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="David" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">David Kim</div>
                      <div className="text-sm text-gray-600">MindfulPath</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "Majorbeam made it easy to launch a high-converting lead magnet. We now get qualified leads daily."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face" alt="Lisa" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Lisa Wang</div>
                      <div className="text-sm text-gray-600">TechVault</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "Our conversion rate jumped from 2% to 7% after switching to Majorbeam for our lead magnets."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face" alt="Alex" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Alex Thompson</div>
                      <div className="text-sm text-gray-600">ContentCraft</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "Majorbeam's AI-generated lead magnets save me hours every week and consistently bring in new leads."
                  </p>
                </div>
              </div>
              
              {/* Duplicate sets for seamless loop - Top row */}
              <div className="flex space-x-6 flex-shrink-0">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" alt="Sarah" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Emma Rodriguez</div>
                      <div className="text-sm text-gray-600">GrowthLead</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "Majorbeam helped me create a lead magnet that captured <span className="bg-red-100 px-1 rounded">47 emails in the first week</span>. The AI-generated content was spot-on and saved me hours of work!"
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="Mike" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Mike Chen</div>
                      <div className="text-sm text-gray-600">CloudFlow</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "We generated 350+ new leads in two weeks using Majorbeam's AI-powered campaigns. It's a must-have for SaaS growth."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" alt="Amanda" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Amanda Lee</div>
                      <div className="text-sm text-gray-600">CreativeStudio</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "Majorbeam's lead magnets doubled our email signups in a month. The content feels tailored for our audience."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="David" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">David Kim</div>
                      <div className="text-sm text-gray-600">MindfulPath</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "Majorbeam made it easy to launch a high-converting lead magnet. We now get qualified leads daily."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face" alt="Lisa" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Lisa Wang</div>
                      <div className="text-sm text-gray-600">TechVault</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "Our conversion rate jumped from 2% to 7% after switching to Majorbeam for our lead magnets."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face" alt="Alex" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Alex Thompson</div>
                      <div className="text-sm text-gray-600">ContentCraft</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "Majorbeam's AI-generated lead magnets save me hours every week and consistently bring in new leads."
                  </p>
                </div>
              </div>
            </div>
            
            {/* Bottom row - scrolls slower */}
            <div className="flex space-x-6 animate-scroll-slow">
              <div className="flex space-x-6 flex-shrink-0">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face" alt="Maria" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Maria Garcia</div>
                      <div className="text-sm text-gray-600">ScaleUp</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "I grew my newsletter by 500 subscribers in 30 days with Majorbeam's landing pages and email capture."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face" alt="James" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">James Wilson</div>
                      <div className="text-sm text-gray-600">StartupHub</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "Majorbeam's step-by-step process made it easy to create a lead magnet that actually works."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1548142813-c348350df52b?w=40&h=40&fit=crop&crop=face" alt="Sophie" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Sophie Chen</div>
                      <div className="text-sm text-gray-600">InnovateLab</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "We used Majorbeam to launch a campaign and saw a 40% increase in email list growth."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="Ryan" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Ryan Park</div>
                      <div className="text-sm text-gray-600">TechSolutions</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "Majorbeam's lead magnets are the best I've used—our pipeline is always full now."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" alt="Amanda" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Amanda Lee</div>
                      <div className="text-sm text-gray-600">CreativeStudio</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "Majorbeam's lead magnets doubled our email signups in a month. The content feels tailored for our audience."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="Carlos" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Carlos Mendez</div>
                      <div className="text-sm text-gray-600">FutureSelf</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "The export and email capture features in Majorbeam helped us nurture and convert leads faster."
                  </p>
                </div>
              </div>
              
              {/* Duplicate sets for seamless loop - Bottom row */}
              <div className="flex space-x-6 flex-shrink-0">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face" alt="Maria" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Maria Garcia</div>
                      <div className="text-sm text-gray-600">ScaleUp</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "I grew my newsletter by 500 subscribers in 30 days with Majorbeam's landing pages and email capture."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face" alt="James" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">James Wilson</div>
                      <div className="text-sm text-gray-600">StartupHub</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "Majorbeam's step-by-step process made it easy to create a lead magnet that actually works."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1548142813-c348350df52b?w=40&h=40&fit=crop&crop=face" alt="Sophie" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Sophie Chen</div>
                      <div className="text-sm text-gray-600">InnovateLab</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "We used Majorbeam to launch a campaign and saw a 40% increase in email list growth."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="Ryan" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Ryan Park</div>
                      <div className="text-sm text-gray-600">TechSolutions</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "Majorbeam's lead magnets are the best I've used—our pipeline is always full now."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" alt="Amanda" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Amanda Lee</div>
                      <div className="text-sm text-gray-600">CreativeStudio</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "Majorbeam's lead magnets doubled our email signups in a month. The content feels tailored for our audience."
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-80">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="Carlos" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Carlos Mendez</div>
                      <div className="text-sm text-gray-600">FutureSelf</div>
                      <div className="flex text-red-400 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "The export and email capture features in Majorbeam helped us nurture and convert leads faster."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Detailed Product Screenshots - Majorbeam Style */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From campaign creation to lead capture, we've got you covered
            </p>
          </div>

          <div className="space-y-20">
            {/* Screenshot 1 - Campaign Creation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Campaign Creation</h3>
                <p className="text-gray-600 mb-6">
                  Start by describing your campaign. Our AI understands your industry and creates personalized content that resonates with your target audience.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Industry-specific content generation</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Personalized for your brand</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Real-time preview</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                        <input type="text" value="SaaS Growth Strategies" className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50" readOnly />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50" disabled>
                          <option>SaaS & Technology</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                        <input type="text" value="SaaS founders and marketers" className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50" readOnly />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshot 2 - PDF Generation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Professional PDF Generation</h3>
                <p className="text-gray-600 mb-6">
                  Get beautifully designed PDFs that establish your authority and convert visitors into high-quality leads.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-yellow-600 mr-3" />
                    <span className="text-gray-700">Custom branding and colors</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-yellow-600 mr-3" />
                    <span className="text-gray-700">Mobile-optimized design</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-yellow-600 mr-3" />
                    <span className="text-gray-700">Instant download</span>
                  </li>
                </ul>
              </div>
              <div className="lg:order-1 relative">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-2">"5 Proven SaaS Growth Strategies"</h4>
                        <p className="text-gray-600 text-sm mb-4">A comprehensive guide for SaaS founders looking to scale their user base and increase revenue.</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <FileText className="w-4 h-4 text-yellow-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">PDF Ready</span>
                          </div>
                          <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700">
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshot 3 - Landing Page */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Landing Page Creation</h3>
                <p className="text-gray-600 mb-6">
                  Generate high-converting landing pages that capture emails and drive your lead generation campaigns.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-yellow-600 mr-3" />
                    <span className="text-gray-700">Mobile-responsive design</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-yellow-600 mr-3" />
                    <span className="text-gray-700">A/B testing ready</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-yellow-600 mr-3" />
                    <span className="text-gray-700">Built-in analytics</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Get Your Free Guide</h3>
                        <p className="text-gray-600 mb-4">Download our comprehensive SaaS growth strategies guide</p>
                        <div className="space-y-3">
                          <input type="email" placeholder="Enter your email" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                          <button className="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-yellow-700">
                            Download Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshot 4 - Email Capture with Export */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Email Capture & Export</h3>
                <p className="text-gray-600 mb-6">
                  Built-in email capture system with export functionality to manage and nurture your leads effectively.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-yellow-600 mr-3" />
                    <span className="text-gray-700">Lead export to CSV/Excel</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-yellow-600 mr-3" />
                    <span className="text-gray-700">Email validation & filtering</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-yellow-600 mr-3" />
                    <span className="text-gray-700">CRM integration ready</span>
                  </li>
                </ul>
              </div>
              <div className="lg:order-1 relative">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900">Campaign: SaaS Growth Strategies</h4>
                        <span className="text-sm text-gray-600">247 leads captured</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Recent Leads</span>
                          <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                            Export All
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">john@startup.com</span>
                            <span className="text-gray-500">2 min ago</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">sarah@tech.co</span>
                            <span className="text-gray-500">5 min ago</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">mike@saas.io</span>
                            <span className="text-gray-500">12 min ago</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200">
                          CSV Export
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200">
                          Excel Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>





      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free with unlimited outlines. Unlock complete campaigns with PDF, landing page, and email export.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="ml-1 text-sm text-gray-700">Save 30%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  $0
                  <span className="text-xl font-normal text-gray-500">/month</span>
                </div>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited content outlines</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">AI content ideas</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Concept generation</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Basic templates</span>
                </li>
              </ul>
              
              <button 
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                onClick={onLogin}
              >
                Get Started Free
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-700 p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  ${billingCycle === 'monthly' ? monthlyPrice : yearlyPrice}
                  <span className="text-xl font-normal text-gray-500">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                <p className="text-gray-600">Unlock everything</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Everything in Free</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">3 campaigns per month</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">PDF download & unlock</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Landing page generation</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Email capture & export</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Advanced customization</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>
              
              <button 
                className="w-full bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 hover:shadow-lg transition-all duration-300"
                onClick={onLogin}
              >
                Start Premium
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-12">
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                No setup fees
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Cancel anytime
                </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Secure payments
              </div>
                </div>
              </div>
        </div>
      </section>



      {/* Comparison Section - Majorbeam Style */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Majorbeam?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how we compare to traditional lead magnet creation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Traditional Method */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Traditional Method</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold text-sm">✕</span>
            </div>
                  <span className="text-gray-700">Spend hours writing content</span>
            </div>
                <div className="flex items-center">
                                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold text-sm">✕</span>
              </div>
                  <span className="text-gray-700">Hire expensive designers</span>
          </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold text-sm">✕</span>
                </div>
                  <span className="text-gray-700">Learn complex tools</span>
              </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold text-sm">✕</span>
            </div>
                  <span className="text-gray-700">Weeks of setup time</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold text-sm">✕</span>
              </div>
                  <span className="text-gray-700">Generic templates</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold text-sm">✕</span>
                  </div>
                  <span className="text-gray-700">No landing page included</span>
                </div>
              </div>
            </div>

            {/* Majorbeam Method */}
            <div className="bg-yellow-600 rounded-2xl p-8 shadow-lg text-white">
              <h3 className="text-2xl font-bold mb-6 text-center">With Majorbeam</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold text-sm">✓</span>
                </div>
                  <span>AI generates content in seconds</span>
              </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold text-sm">✓</span>
            </div>
                  <span>Professional design included</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold text-sm">✓</span>
                  </div>
                  <span>No design skills required</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold text-sm">✓</span>
                  </div>
                  <span>Ready in under 10 minutes</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold text-sm">✓</span>
                  </div>
                  <span>Personalized for your brand</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold text-sm">✓</span>
                  </div>
                  <span>Landing page + email capture</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section - Majorbeam Style */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Perfect For Every Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're a solo entrepreneur or a growing team, Majorbeam helps you generate more leads
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-6">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Solo Entrepreneurs</h3>
              <p className="text-gray-600 mb-6">
                Create professional lead magnets without hiring designers or spending hours on content creation.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  No design skills required
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Ready in minutes, not hours
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Professional results
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-6">
                <Target className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Marketing Agencies</h3>
              <p className="text-gray-600 mb-6">
                Scale your lead generation services with AI-powered content creation for multiple clients.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Multiple client campaigns
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Consistent quality
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Faster delivery
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-6">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">SaaS Companies</h3>
              <p className="text-gray-600 mb-6">
                Generate qualified leads with industry-specific content that speaks to your target audience.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Industry-specific content
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  High-quality leads
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Scalable campaigns
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-6">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Content Creators</h3>
              <p className="text-gray-600 mb-6">
                Expand your audience and monetize your expertise with professional lead magnets.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Monetize expertise
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Grow your audience
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Professional branding
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-6">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Consultants</h3>
              <p className="text-gray-600 mb-6">
                Establish authority and attract high-value clients with professional lead magnets.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Authority building
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  High-value leads
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Professional image
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-6">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Coaches</h3>
              <p className="text-gray-600 mb-6">
                Convert prospects into paying clients with compelling lead magnets that showcase your value.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Value demonstration
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Client conversion
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-yellow-600 mr-2" />
                  Trust building
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about Majorbeam
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How does the AI content generation work?",
                answer: "Our AI analyzes your industry, target audience, and campaign goals to generate compelling lead magnet content. It creates engaging titles, outlines, and complete PDF content that resonates with your audience."
              },
              {
                question: "Can I customize the PDF design?",
                answer: "Yes! You can customize colors, fonts, logos, and layout to match your brand. The PDFs are professionally designed and ready to share immediately."
              },
              {
                question: "What's included in a campaign?",
                answer: "Each campaign includes AI-generated content, a professional PDF lead magnet, a high-converting landing page, and an email capture system with export functionality."
              },
              {
                question: "How long does it take to create a campaign?",
                answer: "Most campaigns are completed in under 10 minutes. The AI generates content instantly, and you can customize and download your PDF immediately."
              },
              {
                question: "Can I export my leads?",
                answer: "Absolutely! The email capture system includes export functionality so you can download your leads and import them into your CRM or email marketing platform."
              },
              {
                question: "Is there a free trial?",
                answer: "Yes! You can create 3 campaigns per month completely free. Upgrade to Premium to unlock unlimited downloads, landing pages, and advanced features."
              }
            ].map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button 
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`} />
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Generate More Leads?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Join 10,000+ creators who are already generating high-quality leads with Majorbeam. 
            Start your first campaign in minutes.
          </p>
          <button 
            onClick={onLogin}
            className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center mx-auto"
          >
            Start Creating Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-700 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Majorbeam</span>
            </div>
            <p className="text-gray-400">
              AI-powered lead magnet generator that helps creators capture more leads and grow their audience.
            </p>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Majorbeam. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLandingPage; 
