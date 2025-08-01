import React, { useState } from 'react';
import { Check, Mail, Zap, Star, AlertTriangle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SaaSChecklist: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checks, setChecks] = useState({
    problem: false,
    audience: false,
    discussed: false,
    users: false,
    current: false,
    weaknesses: false,
    mvp: false,
    validated: false,
    reach: false,
    feedback: false
  });

  const handleCheckChange = (key: keyof typeof checks) => {
    setChecks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const calculateScore = () => {
    return Object.values(checks).filter(Boolean).length;
  };

  const getScoreMessage = (score: number) => {
    if (score === 10) {
      return {
        title: "🔥 Your idea is well validated",
        message: "Congratulations! You've done exceptional validation work. Your SaaS idea shows strong potential with comprehensive market research, user validation, and clear problem-solution fit. You're ready to start building with confidence. Focus on creating a solid MVP and getting your first paying customers.",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      };
    } else if (score >= 7) {
      return {
        title: "👍 You're on the right track",
        message: "You're making good progress! Your idea has solid foundations, but there are a few areas that need more validation. Focus on the unchecked items - particularly user interviews and market research. Once you complete these validations, you'll have a much stronger foundation for building your SaaS.",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
      };
    } else if (score >= 4) {
      return {
        title: "⚠️ Still early in validation",
        message: "Your idea needs more validation before building. You're in the early stages of idea validation, which is perfectly normal. Focus on understanding your users better, researching the market, and validating the problem exists. Don't rush into building - take time to validate thoroughly to avoid costly mistakes.",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200"
      };
    } else {
      return {
        title: "❌ Too risky right now",
        message: "Your idea needs significant validation before considering building. You're missing critical validation steps that successful startups typically complete. Focus on market research, user interviews, and problem validation. Building now would be risky - invest time in validation to increase your chances of success.",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
      };
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, email:', email);
    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting to save email to Supabase...');
      // Save email to Supabase
      const { error: insertError } = await supabase
        .from('email_captures')
        .insert([
          {
            email: email,
            source: 'saas_checklist',
            metadata: {
              score: calculateScore(),
              checks: checks
            }
          }
        ]);

      if (insertError) {
        console.error('Database error:', insertError);
        // For now, let's continue even if database insert fails
        // This allows testing the checklist functionality
      }

      console.log('Setting isSubmitted to true');
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Email capture error:', err);
      // For now, let's continue even if there's an error
      // This allows testing the checklist functionality
      console.log('Setting isSubmitted to true despite error');
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const score = calculateScore();
  const scoreMessage = getScoreMessage(score);

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <a href="/promotion-guide" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Promotion Guide
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              SaaS Idea Validation Checklist
            </h1>
            <p className="text-lg opacity-90">
              Validate your SaaS idea in 2 minutes. Get your score and actionable feedback.
            </p>
          </div>

          {/* Email Capture Section */}
          {!isSubmitted ? (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Get Your Validation Score</h2>
                </div>
                                   <p className="text-gray-600 max-w-2xl mx-auto">
                     Enter your email to access the checklist and receive your personalized validation score with actionable feedback. This comprehensive validation tool will help you assess whether your SaaS idea has the potential for success by evaluating 10 critical factors that successful startups typically validate before building.
                   </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
                <div className="mb-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Get My Validation Score'}
                </button>
                
                {/* Test button to bypass email capture */}
                <button
                  type="button"
                  onClick={() => {
                    console.log('Test button clicked');
                    setIsSubmitted(true);
                  }}
                  className="w-full mt-2 bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
                >
                  Test: Skip Email (Show Checklist)
                </button>
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}
              </form>
            </div>
                           ) : (
                   /* Results Section - Show immediately after email capture */
                   <div className="p-8">
                     <div className="text-center mb-8">
                       <div className="flex items-center justify-center mb-4">
                         <Star className="w-8 h-8 text-blue-600 mr-3" />
                         <h2 className="text-2xl font-bold text-gray-900">Your Validation Score</h2>
                       </div>
                       <p className="text-gray-600 max-w-2xl mx-auto">
                         Based on your current validation status, here's your score and personalized feedback. Use the checklist below to improve your score and strengthen your SaaS idea.
                       </p>
                     </div>

                                           {/* Welcome Message */}
                      <div className="p-6 rounded-xl border bg-blue-50 border-blue-200 mb-8">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-4">
                            <Star className="w-6 h-6 text-blue-600 mr-2" />
                            <span className="text-2xl font-bold text-blue-600">
                              Welcome to the SaaS Validation Tool!
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            Complete the checklist below to get your personalized validation score. Each item you check will improve your score and help you understand how well-validated your SaaS idea is. Start by checking the items that apply to your idea.
                          </p>
                        </div>
                      </div>

                                           {/* Live Score Display */}
                      <div className={`p-4 rounded-xl border ${scoreMessage.bgColor} ${scoreMessage.borderColor} mb-6`}>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-2">
                            <Star className="w-5 h-5 mr-2" />
                            <span className={`text-xl font-bold ${scoreMessage.color}`}>
                              Current Score: {score}/10
                            </span>
                          </div>
                          <p className={`text-sm ${scoreMessage.color} font-medium`}>
                            {scoreMessage.title}
                          </p>
                        </div>
                      </div>

                      {/* Checklist Section */}
                      <div className="text-center mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Complete the Checklist</h3>
                        <p className="text-gray-600">Check each item that applies to your idea to improve your score:</p>
                      </div>

              <div className="space-y-4 mb-8">
                <label className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checks.problem}
                    onChange={() => handleCheckChange('problem')}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900">I clearly understand the problem I'm solving</span>
                </label>

                <label className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checks.audience}
                    onChange={() => handleCheckChange('audience')}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900">I can identify my target audience precisely</span>
                </label>

                <label className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checks.discussed}
                    onChange={() => handleCheckChange('discussed')}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900">I've seen this problem discussed online (e.g. Reddit, forums)</span>
                </label>

                <label className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checks.users}
                    onChange={() => handleCheckChange('users')}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900">I've spoken to at least 3 real users about this</span>
                </label>

                <label className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checks.current}
                    onChange={() => handleCheckChange('current')}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900">I know how users currently solve this problem</span>
                </label>

                <label className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checks.weaknesses}
                    onChange={() => handleCheckChange('weaknesses')}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900">I've identified weaknesses in existing solutions</span>
                </label>

                <label className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checks.mvp}
                    onChange={() => handleCheckChange('mvp')}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900">I have a simple MVP idea to test</span>
                </label>

                <label className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checks.validated}
                    onChange={() => handleCheckChange('validated')}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900">I've validated interest with a landing page or post</span>
                </label>

                <label className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checks.reach}
                    onChange={() => handleCheckChange('reach')}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900">I know how I'll reach my first 10 users</span>
                </label>

                <label className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checks.feedback}
                    onChange={() => handleCheckChange('feedback')}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900">I've received feedback and iterated</span>
                </label>
                             </div>

              {/* CTA Section */}
              <div className="mt-8 text-center">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-blue-600 mr-3" />
                    <span className="text-lg font-semibold text-gray-900">
                      Ready to build your SaaS?
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Create your lead magnet, landing page, and email capture system in minutes.
                  </p>
                  <a
                    href="/"
                    className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Try MajorBeam — Free to Start
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaaSChecklist; 