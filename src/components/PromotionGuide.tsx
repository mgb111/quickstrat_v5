import React from 'react';
import { ExternalLink, Users, MessageSquare, Globe, Mail, Star, Zap } from 'lucide-react';

const PromotionGuide: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Majorbeam</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Home
              </a>
              <button 
                onClick={() => scrollToSection('launch-sites')}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Launch Sites
              </button>
              <button 
                onClick={() => scrollToSection('communities')}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Communities
              </button>
              <button 
                onClick={() => scrollToSection('directories')}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Directories
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            51 Free Places to Promote Your Project
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get early users, traffic, and feedback without spending a cent.
          </p>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600 mr-2" />
              <span className="text-lg font-semibold text-gray-900">Want to generate a lead magnet, landing page, and email capture system in minutes?</span>
            </div>
            <p className="text-gray-600 mb-4">
              Try <a href="/" className="text-blue-600 font-semibold hover:underline">MajorBeam</a> — free to start.
            </p>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Launch Sites */}
        <section id="launch-sites" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <Globe className="w-8 h-8 mr-3 text-blue-600" />
            🚀 Launch Sites
          </h2>
          <div className="grid gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Product Hunt</h3>
                  <p className="text-gray-600 text-sm">The most popular launch platform for new products</p>
                </div>
                <a href="https://www.producthunt.com/posts/new" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Submit here <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">BetaList</h3>
                  <p className="text-gray-600 text-sm">Early access platform for beta products</p>
                </div>
                <a href="https://betalist.com/submit" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Submit here <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Show HN</h3>
                  <p className="text-gray-600 text-sm">Hacker News community for showcasing projects</p>
                </div>
                <a href="https://news.ycombinator.com/" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Post to HN <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Launching Next</h3>
                  <p className="text-gray-600 text-sm">Platform for upcoming product launches</p>
                </div>
                <a href="https://www.launchingnext.com/submit-startup" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Submit here <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Startups.fyi</h3>
                  <p className="text-gray-600 text-sm">Directory for startups and side projects</p>
                </div>
                <a href="https://startups.fyi/submit" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Submit here <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Reddit Communities */}
        <section id="communities" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <Users className="w-8 h-8 mr-3 text-green-600" />
            🗣️ Reddit Communities
          </h2>
          <div className="grid gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">r/Entrepreneur</h3>
              <p className="text-gray-600 text-sm">1M+ members - Great for business-focused projects</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">r/SaaS</h3>
              <p className="text-gray-600 text-sm">150K+ members - Perfect for SaaS products</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">r/SideProject</h3>
              <p className="text-gray-600 text-sm">200K+ members - Ideal for side projects and MVPs</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">r/startups</h3>
              <p className="text-gray-600 text-sm">500K+ members - Startup-focused community</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">r/growmybusiness</h3>
              <p className="text-gray-600 text-sm">100K+ members - Business growth discussions</p>
            </div>
          </div>
        </section>

        {/* Indie Communities */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <MessageSquare className="w-8 h-8 mr-3 text-purple-600" />
            📣 Indie Communities
          </h2>
          <div className="grid gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Indie Hackers</h3>
                  <p className="text-gray-600 text-sm">Community for indie makers and entrepreneurs</p>
                </div>
                <a href="https://www.indiehackers.com/post" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Post your story <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">WIP.co</h3>
                  <p className="text-gray-600 text-sm">Share your work in progress</p>
                </div>
                <a href="https://wip.co/projects/new" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Share your build <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Makerlog</h3>
                  <p className="text-gray-600 text-sm">Track and share your progress</p>
                </div>
                <a href="https://getmakerlog.com/" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Join and post <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">ProductHunt Makers</h3>
                  <p className="text-gray-600 text-sm">Discussion section for makers</p>
                </div>
                <a href="https://www.producthunt.com/discussions" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Discussion section <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Indiestash</h3>
                  <p className="text-gray-600 text-sm">Directory for indie tools and products</p>
                </div>
                <a href="https://indiestash.com" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  List your tool <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Directories */}
        <section id="directories" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <Globe className="w-8 h-8 mr-3 text-indigo-600" />
            📂 Directories
          </h2>
          <div className="grid gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">SaaSHub</h3>
                  <p className="text-gray-600 text-sm">Comprehensive SaaS directory</p>
                </div>
                <a href="https://www.saashub.com/" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Submit listing <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">StartupBase</h3>
                  <p className="text-gray-600 text-sm">Startup directory and community</p>
                </div>
                <a href="https://www.startupbase.io/submit" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Submit here <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Toolify</h3>
                  <p className="text-gray-600 text-sm">AI tools directory</p>
                </div>
                <a href="https://www.toolify.ai/submit" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Submit AI tools <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">There's an AI For That</h3>
                  <p className="text-gray-600 text-sm">AI tools discovery platform</p>
                </div>
                <a href="https://theresanaiforthat.com/submit" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Submit AI tool <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">AI Scout</h3>
                  <p className="text-gray-600 text-sm">AI tools directory and reviews</p>
                </div>
                <a href="https://aiscout.co/submit" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Add your tool <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Sections */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <Users className="w-8 h-8 mr-3 text-orange-600" />
            👥 Slack & Discord Communities
          </h2>
          <div className="grid gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">Online Geniuses</h3>
              <p className="text-gray-600 text-sm">Large marketing Slack community</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">Indie World</h3>
              <p className="text-gray-600 text-sm">Discord for indie makers</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">Founder's Cafe</h3>
              <p className="text-gray-600 text-sm">Slack for SaaS founders</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">MegaIndie</h3>
              <p className="text-gray-600 text-sm">Discord for early-stage launches</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">No Code Founders</h3>
              <p className="text-gray-600 text-sm">Active Slack for nocode</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <Star className="w-8 h-8 mr-3 text-yellow-600" />
            🛠️ Developer & Maker Spaces
          </h2>
          <div className="grid gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Dev.to</h3>
                  <p className="text-gray-600 text-sm">Share your development journey</p>
                </div>
                <a href="https://dev.to/" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Share dev journey <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Hashnode</h3>
                  <p className="text-gray-600 text-sm">Developer-focused blogging platform</p>
                </div>
                <a href="https://hashnode.com/" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Post an article <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">GitHub Discussions</h3>
              <p className="text-gray-600 text-sm">For open-source projects</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">Stack Overflow Collectives</h3>
              <p className="text-gray-600 text-sm">High-visibility tagging</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Hacker News</h3>
                  <p className="text-gray-600 text-sm">Show HN for showcasing projects</p>
                </div>
                <a href="https://news.ycombinator.com/show" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Show HN <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <Mail className="w-8 h-8 mr-3 text-red-600" />
            📧 Email + Newsletter Places
          </h2>
          <div className="grid gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Newsletter Stack</h3>
                  <p className="text-gray-600 text-sm">Submit your newsletter</p>
                </div>
                <a href="https://newsletterstack.com/submit" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Submit yours <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">InboxReads</h3>
                  <p className="text-gray-600 text-sm">Newsletter directory</p>
                </div>
                <a href="https://inboxreads.co/submit" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Submit newsletter <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Startups.fyi</h3>
                  <p className="text-gray-600 text-sm">Get featured in startup newsletter</p>
                </div>
                <a href="https://startups.fyi/submit" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  Get featured <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">Foundr</h3>
              <p className="text-gray-600 text-sm">Collaborate with content team</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">Substack Discovery</h3>
              <p className="text-gray-600 text-sm">Organic traction through newsletters</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <MessageSquare className="w-8 h-8 mr-3 text-green-600" />
            💬 Feedback Platforms
          </h2>
          <div className="grid gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">ShipFast Feedback</h3>
              <p className="text-gray-600 text-sm">Private feedback community</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">Canny.io</h3>
              <p className="text-gray-600 text-sm">Capture feedback ideas</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">Featurebase</h3>
              <p className="text-gray-600 text-sm">Feedback boards</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">GummySearch</h3>
              <p className="text-gray-600 text-sm">Find early feedback forums</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900">Feedback Fish</h3>
              <p className="text-gray-600 text-sm">Lightweight integration</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-xl border border-blue-200 text-center">
          <div className="flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-blue-600 mr-2" />
            <span className="text-lg font-semibold text-gray-900">Want to build your lead magnet, landing page, and lead capture system in under 5 minutes?</span>
          </div>
          <p className="text-gray-600 mb-6">
            Try <a href="/" className="text-blue-600 font-semibold hover:underline">MajorBeam</a> — it's free to start.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Created with ❤️ by an indie maker. Feel free to share this page.</p>
        </div>
      </div>
    </div>
  );
};

export default PromotionGuide; 