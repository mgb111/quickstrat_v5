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
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Majorbeam</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
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
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            51 Free Places to Promote Your Project
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get early users, traffic, and feedback without spending a cent.
          </p>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600 mr-3" />
              <span className="text-lg font-semibold text-gray-900">Want to generate a lead magnet, landing page, and email capture system in minutes?</span>
            </div>
            <p className="text-gray-600">
              Try <a href="/" className="text-blue-600 font-semibold hover:underline">MajorBeam</a> — free to start.
            </p>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Launch Sites */}
        <section id="launch-sites" className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center justify-center">
            <Globe className="w-8 h-8 mr-3 text-blue-600" />
            🚀 Launch Sites
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Product Hunt</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">The most popular launch platform for new products</p>
                </div>
              </div>
              <a href="https://www.producthunt.com/posts/new" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Submit here <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">BetaList</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Early access platform for beta products</p>
                </div>
              </div>
              <a href="https://betalist.com/submit" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Submit here <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Show HN</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Hacker News community for showcasing projects</p>
                </div>
              </div>
              <a href="https://news.ycombinator.com/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Post to HN <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Launching Next</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Platform for upcoming product launches</p>
                </div>
              </div>
              <a href="https://www.launchingnext.com/submit-startup" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Submit here <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Startups.fyi</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Directory for startups and side projects</p>
                </div>
              </div>
              <a href="https://startups.fyi/submit" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Submit here <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </section>

        {/* Reddit Communities */}
        <section id="communities" className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center justify-center">
            <Users className="w-8 h-8 mr-3 text-green-600" />
            🗣️ Reddit Communities
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">r/Entrepreneur</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Great for business-focused projects</p>
                </div>
              </div>
              <a href="https://www.reddit.com/r/Entrepreneur/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Visit subreddit <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">r/SaaS</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Perfect for SaaS products</p>
                </div>
              </div>
              <a href="https://www.reddit.com/r/SaaS/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Visit subreddit <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">r/SideProject</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Ideal for side projects and MVPs</p>
                </div>
              </div>
              <a href="https://www.reddit.com/r/SideProject/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Visit subreddit <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">r/startups</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Startup-focused community</p>
                </div>
              </div>
              <a href="https://www.reddit.com/r/startups/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Visit subreddit <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">r/growmybusiness</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Business growth discussions</p>
                </div>
              </div>
              <a href="https://www.reddit.com/r/growmybusiness/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Visit subreddit <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </section>

        {/* Indie Communities */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 mr-3 text-purple-600" />
            📣 Indie Communities
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Indie Hackers</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Community for indie makers and entrepreneurs</p>
                </div>
              </div>
              <a href="https://www.indiehackers.com/post" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Post your story <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">WIP.co</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Share your work in progress</p>
                </div>
              </div>
              <a href="https://wip.co/projects/new" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Share your build <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Makerlog</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Track and share your progress</p>
                </div>
              </div>
              <a href="https://getmakerlog.com/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Join and post <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">ProductHunt Makers</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Discussion section for makers</p>
                </div>
              </div>
              <a href="https://www.producthunt.com/discussions" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Discussion section <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Indiestash</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Directory for indie tools and products</p>
                </div>
              </div>
              <a href="https://indiestash.com" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                List your tool <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </section>

        {/* Directories */}
        <section id="directories" className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center justify-center">
            <Globe className="w-8 h-8 mr-3 text-indigo-600" />
            📂 Directories
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">SaaSHub</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Comprehensive SaaS directory</p>
                </div>
              </div>
              <a href="https://www.saashub.com/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Submit listing <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">StartupBase</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Startup directory and community</p>
                </div>
              </div>
              <a href="https://www.startupbase.io/submit" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Submit here <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Toolify</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">AI tools directory</p>
                </div>
              </div>
              <a href="https://www.toolify.ai/submit" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Submit AI tools <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">There's an AI For That</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">AI tools discovery platform</p>
                </div>
              </div>
              <a href="https://theresanaiforthat.com/submit" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Submit AI tool <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">AI Scout</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">AI tools directory and reviews</p>
                </div>
              </div>
              <a href="https://aiscout.co/submit" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Add your tool <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </section>

        {/* Additional Sections */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center justify-center">
            <Users className="w-8 h-8 mr-3 text-orange-600" />
            👥 Slack & Discord Communities
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Online Geniuses</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Large marketing Slack community</p>
                </div>
              </div>
              <a href="https://onlinegeniuses.com/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Join community <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Indie World</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Discord for indie makers</p>
                </div>
              </div>
              <a href="https://discord.gg/indieworld" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Join Discord <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Founder's Cafe</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Slack for SaaS founders</p>
                </div>
              </div>
              <a href="https://founderscafe.io/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Join Slack <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">MegaIndie</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Discord for early-stage launches</p>
                </div>
              </div>
              <a href="https://discord.gg/megaindie" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Join Discord <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">No Code Founders</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Active Slack for nocode</p>
                </div>
              </div>
              <a href="https://nocodefounders.com/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Join Slack <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center justify-center">
            <Star className="w-8 h-8 mr-3 text-yellow-600" />
            🛠️ Developer & Maker Spaces
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Dev.to</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Share your development journey</p>
                </div>
              </div>
              <a href="https://dev.to/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Share dev journey <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Hashnode</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Developer-focused blogging platform</p>
                </div>
              </div>
              <a href="https://hashnode.com/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Post an article <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">GitHub Discussions</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">For open-source projects</p>
                </div>
              </div>
              <a href="https://github.com/topics/discussions" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Browse discussions <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Stack Overflow Collectives</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">High-visibility tagging</p>
                </div>
              </div>
              <a href="https://stackoverflow.com/collectives" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                View collectives <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Hacker News</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Show HN for showcasing projects</p>
                </div>
              </div>
              <a href="https://news.ycombinator.com/show" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Show HN <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center justify-center">
            <Mail className="w-8 h-8 mr-3 text-red-600" />
            📧 Email + Newsletter Places
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Newsletter Stack</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Submit your newsletter</p>
                </div>
              </div>
              <a href="https://newsletterstack.com/submit" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Submit yours <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">InboxReads</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Newsletter directory</p>
                </div>
              </div>
              <a href="https://inboxreads.co/submit" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Submit newsletter <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Startups.fyi</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Get featured in startup newsletter</p>
                </div>
              </div>
              <a href="https://startups.fyi/submit" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Get featured <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Foundr</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Collaborate with content team</p>
                </div>
              </div>
              <a href="https://foundr.com/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Visit Foundr <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Substack Discovery</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Organic traction through newsletters</p>
                </div>
              </div>
              <a href="https://substack.com/discover" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Browse newsletters <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 mr-3 text-green-600" />
            💬 Feedback Platforms
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">ShipFast Feedback</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Private feedback community</p>
                </div>
              </div>
              <a href="https://shipfast.co/feedback" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Join community <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Canny.io</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Capture feedback ideas</p>
                </div>
              </div>
              <a href="https://canny.io/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Try Canny <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Featurebase</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Feedback boards</p>
                </div>
              </div>
              <a href="https://featurebase.app/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Try Featurebase <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">GummySearch</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Find early feedback forums</p>
                </div>
              </div>
              <a href="https://gummysearch.com/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Try GummySearch <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Feedback Fish</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Lightweight integration</p>
                </div>
              </div>
              <a href="https://feedback.fish/" target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Try Feedback Fish <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-200 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-blue-600 mr-3" />
            <span className="text-lg font-semibold text-gray-900">Want to build your lead magnet, landing page, and lead capture system in under 5 minutes?</span>
          </div>
          <p className="text-gray-600 mb-6">
            Try <a href="/" className="text-blue-600 font-semibold hover:underline">MajorBeam</a> — it's free to start.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>Created with ❤️ by an indie maker. Feel free to share this page.</p>
        </div>
      </div>
    </div>
  );
};

export default PromotionGuide; 