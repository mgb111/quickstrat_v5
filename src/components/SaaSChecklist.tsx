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
        message: "Time to build! You've done excellent validation work.",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      };
    } else if (score >= 7) {
      return {
        title: "👍 You're on the right track",
        message: "Do a bit more validation before building.",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
      };
    } else if (score >= 4) {
      return {
        title: "⚠️ Still early",
        message: "Talk to users and test faster before building.",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200"
      };
    } else {
      return {
        title: "❌ Too risky right now",
        message: "Research and validate before building anything.",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
      };
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
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
        throw insertError;
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError('Failed to submit. Please try again.');
      console.error('Email capture error:', err);
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
                  Enter your email to access the checklist and receive your personalized validation score with actionable feedback.
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
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}
              </form>
            </div>
          ) : (
            /* Checklist Section */
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">SaaS Idea Validation Checklist</h2>
                <p className="text-gray-600">Check each item that applies to your idea:</p>
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

              {/* Results Section */}
              <div className={`p-6 rounded-xl border ${scoreMessage.bgColor} ${scoreMessage.borderColor}`}>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Star className="w-6 h-6 mr-2" />
                    <span className={`text-2xl font-bold ${scoreMessage.color}`}>
                      You scored {score}/10
                    </span>
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${scoreMessage.color}`}>
                    {scoreMessage.title}
                  </h3>
                  <p className="text-gray-700">
                    {scoreMessage.message}
                  </p>
                </div>
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