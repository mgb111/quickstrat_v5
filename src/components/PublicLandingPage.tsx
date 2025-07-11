import React, { useState } from 'react';
import { Check, ArrowRight, Zap, Users, FileText, Mail, TrendingUp, Target, Download, Play, Star, ChevronDown } from 'lucide-react';

interface PublicLandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const PublicLandingPage: React.FC<PublicLandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [email, setEmail] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email captured:', email);
    setEmail('');
  };

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
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Majorbeam</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Testimonials
              </button>
              <button 
                onClick={() => scrollToSection('faq')}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                FAQ
              </button>
              <button 
                onClick={onLogin}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
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
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Testimonials
              </button>
              <button 
                onClick={() => scrollToSection('faq')}
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                FAQ
              </button>
              <button 
                onClick={onLogin}
                className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Play className="w-4 h-4 mr-2" />
              Generate Professional Lead Magnets in Minutes
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Stop Losing Leads to
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Generic Content</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Create personalized, professional lead magnets that establish your authority and convert visitors into high-quality leads—without design skills or expensive tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button 
                onClick={onLogin}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Create Your Lead Magnet Now
              </button>
              <button className="flex items-center text-gray-700 hover:text-blue-600 transition-colors font-medium">
                <Play className="w-5 h-5 mr-2" />
                Watch 2-Minute Demo
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-sm text-gray-500 px-4">
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                No design skills needed
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                Ready in under 2 minutes
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                Fully personalized content
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is a Lead Magnet Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              What Exactly is a Lead Magnet?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Think of it as your digital business card—but way more powerful
            </p>
          </div>

          {/* Three Column Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Attracts Your Ideal Clients</h3>
              <p className="text-gray-600 leading-relaxed">
                Draws in people who are genuinely interested in what you offer, not just random visitors.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Builds Trust Before You Even Meet</h3>
              <p className="text-gray-600 leading-relaxed">
                Showcases your expertise and gives value upfront, making prospects more likely to work with you.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Grows Your Email List Automatically</h3>
              <p className="text-gray-600 leading-relaxed">
                Turns one-time visitors into subscribers you can nurture and convert into paying clients.
              </p>
            </div>
          </div>

          {/* Example Lead Magnet */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl text-center">
              <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                <div className="flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-blue-600 mr-3" />
                  <h4 className="font-bold text-gray-900">Your Lead Magnet</h4>
                </div>
                <h5 className="text-lg font-semibold text-gray-800 mb-2">
                  "5 Proven Strategies to Double Your Coaching Revenue"
                </h5>
                <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                  <Download className="w-4 h-4 mr-2" />
                  Downloaded 1,247 times this month
                </div>
              </div>
              
              <svg className="w-8 h-8 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
              
              <div className="bg-green-100 p-6 rounded-xl">
                <h5 className="font-bold text-green-800 mb-2 text-lg">Result:</h5>
                <p className="text-green-700 font-medium">
                  300% increase in qualified leads who are ready to invest in your services
                </p>
              </div>
            </div>
          </div>

          {/* The Best Part Callout */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white mt-16">
            <h3 className="text-3xl font-bold mb-4">The Best Part? It Works 24/7</h3>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              While you sleep, your lead magnet is attracting new prospects, building your email list, and positioning you as the go-to expert in your field.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to Convert Visitors into Leads
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional, personalized lead magnets that work around the clock to grow your business
            </p>
          </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ready in Under 2 Minutes</h3>
              <p className="text-gray-600">
                No more spending weeks on design. Fill out a simple form and get your professional lead magnet instantly.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Fully Personalized Content</h3>
              <p className="text-gray-600">
                Every guide includes your unique voice, expertise, and branding—not generic templates that scream "cookie-cutter."
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Mobile Optimized</h3>
              <p className="text-gray-600">
                Your lead magnets look perfect on every device, ensuring maximum engagement from your audience.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">No Design Skills Required</h3>
              <p className="text-gray-600">
                Skip the learning curve of design tools. Our AI handles all the formatting and styling automatically.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Professional Quality</h3>
              <p className="text-gray-600">
                Impress prospects with polished, professional PDFs that establish your authority from the first interaction.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Actionable Content</h3>
              <p className="text-gray-600">
                Each guide includes step-by-step strategies, checklists, and scripts your audience can implement immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Join Thousands of Successful Creators
            </h2>
            <p className="text-xl text-gray-600">
              See why creators choose Majorbeam to grow their email lists and convert more leads
            </p>
          </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Lead Magnets Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">15+</div>
              <div className="text-gray-600">Leads Per Lead Magnet</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">2 Min</div>
              <div className="text-gray-600">Average Creation Time</div>
            </div>
          </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "Majorbeam helped me create a professional lead magnet in minutes. My email list grew by 400% in just one month!"
              </p>
              <div className="font-semibold text-gray-900">Sarah Chen</div>
              <div className="text-gray-600 text-sm">Business Coach</div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "I was spending hours on Canva with terrible results. Majorbeam gave me a professional guide that actually converts."
              </p>
              <div className="font-semibold text-gray-900">Marcus Rodriguez</div>
              <div className="text-gray-600 text-sm">Marketing Consultant</div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "The quality is incredible. My prospects think I hired an expensive designer. Best investment I've made this year."
              </p>
              <div className="font-semibold text-gray-900">Jennifer Walsh</div>
              <div className="text-gray-600 text-sm">Life Coach</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about creating professional lead magnets
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "How long does it actually take to create a lead magnet?",
                answer: "Most users complete their personalized lead magnet in under 2 minutes. You simply fill out a quick form with your name, brand details, and target audience information, then instantly preview and download your professional PDF guide."
              },
              {
                question: "What's included in each lead magnet?",
                answer: "Every lead magnet includes: a personalized founder-style introduction, strategy comparison tables with pros & cons, actionable step-by-step checklists, ready-to-use conversation scripts, and a professional call-to-action page. All content is fully branded with your information and optimized for mobile viewing."
              },
              {
                question: "Do I need any design skills or software?",
                answer: "Absolutely not! Majorbeam is designed for busy creators who don't have time to learn design tools like Canva or hire expensive designers. Everything is generated automatically based on your input—no design experience required."
              },
              {
                question: "Who is this perfect for?",
                answer: "Majorbeam is ideal for coaches, consultants, solopreneurs, and content creators who want to grow their email lists with professional lead magnets. It's perfect for anyone who needs to establish authority, attract high-quality leads, and build trust with their audience without spending weeks on design."
              },
              {
                question: "Can I customize the content and branding?",
                answer: "Yes! Every lead magnet is personalized with your name, brand information, expertise area, and target audience details. The content adapts to your specific niche and includes your personal introduction, making each guide unique to your business."
              },
              {
                question: "Will the PDFs work on mobile devices?",
                answer: "Absolutely! All lead magnets are optimized for mobile viewing, ensuring your audience can read and engage with your content on any device. The PDFs are designed to look professional whether viewed on smartphones, tablets, or desktop computers."
              },
              {
                question: "How is this different from using templates?",
                answer: "Unlike generic templates that make you look like everyone else, Majorbeam creates truly personalized content based on your specific business, expertise, and audience. Each guide includes your unique voice, strategies, and branding—not cookie-cutter content that screams \"template.\""
              },
              {
                question: "What results can I expect?",
                answer: "Our users typically generate 15+ leads per lead magnet on average. The professional quality helps establish authority, builds trust before the first sales call, and attracts higher-quality leads who are ready to invest in your services."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button 
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transform transition-transform ${
                      openFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div className={`px-6 pb-5 ${openFAQ === index ? '' : 'hidden'}`}>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Stop Losing Leads?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who've transformed their lead generation with professional, personalized lead magnets.
          </p>
          
          <button 
            onClick={onLogin}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center mx-auto mb-4"
          >
            <Download className="w-5 h-5 mr-2" />
            Create Your Lead Magnet Now
          </button>
          
          <p className="text-blue-200 text-sm">
            No credit card required • Ready in under 2 minutes
          </p>
        </div>
      </section>
    </div>
  );
};

export default PublicLandingPage; 