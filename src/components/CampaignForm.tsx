import React, { useState } from 'react';
import { CampaignInput } from '../types';
import { Loader2 } from 'lucide-react';

interface CampaignFormProps {
  onSubmit: (input: CampaignInput) => void;
  isLoading: boolean;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CampaignInput>({
    name: '', // Add name field
    brand_name: '',
    target_audience: '',
    niche: '',
    problem_statement: '',
    desired_outcome: '',
    tone: 'professional',
    position: ''
  });
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && !localLoading) {
      setLocalLoading(true);
      await onSubmit(formData);
      setLocalLoading(false);
    }
  };

  const handleInputChange = (field: keyof CampaignInput, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Campaign Information</h2>
          
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name (for personalization)
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Manish"
                required
                disabled={isLoading || localLoading}
              />
            </div>

            {/* Brand Name */}
            <div>
              <label htmlFor="brand_name" className="block text-sm font-medium text-gray-700 mb-2">
                Brand/Company Name *
              </label>
              <input
                type="text"
                id="brand_name"
                value={formData.brand_name}
                onChange={(e) => handleInputChange('brand_name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., TechCorp Solutions"
                required
                disabled={isLoading || localLoading}
              />
            </div>

            {/* Niche */}
            <div>
              <label htmlFor="niche" className="block text-sm font-medium text-gray-700 mb-2">
                Niche/Industry *
              </label>
              <input
                type="text"
                id="niche"
                value={formData.niche}
                onChange={(e) => handleInputChange('niche', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Digital Marketing, SaaS, E-commerce, Health & Wellness"
                required
                disabled={isLoading || localLoading}
              />
            </div>

            {/* Target Audience */}
            <div>
              <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience *
              </label>
              <textarea
                id="target_audience"
                value={formData.target_audience}
                onChange={(e) => handleInputChange('target_audience', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your ideal customer (e.g., Small business owners aged 30-50 who struggle with digital marketing)"
                required
                disabled={isLoading || localLoading}
              />
            </div>

            {/* Problem Statement */}
            <div>
              <label htmlFor="problem_statement" className="block text-sm font-medium text-gray-700 mb-2">
                Customer Problem Statement *
              </label>
              <textarea
                id="problem_statement"
                value={formData.problem_statement}
                onChange={(e) => handleInputChange('problem_statement', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the main problem your customers face (e.g., Small business owners struggle to create effective social media strategies because they lack time, knowledge, and a clear system to follow)"
                required
                disabled={isLoading || localLoading}
              />
            </div>

            {/* Desired Outcome */}
            <div>
              <label htmlFor="desired_outcome" className="block text-sm font-medium text-gray-700 mb-2">
                Desired Outcome *
              </label>
              <textarea
                id="desired_outcome"
                value={formData.desired_outcome}
                onChange={(e) => handleInputChange('desired_outcome', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What do your customers want to achieve? (e.g., Create a consistent social media presence that generates leads and builds brand awareness)"
                required
                disabled={isLoading || localLoading}
              />
            </div>

            {/* Tone */}
            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                Content Tone
              </label>
              <select
                id="tone"
                value={formData.tone}
                onChange={(e) => handleInputChange('tone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || localLoading}
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly & Approachable</option>
                <option value="casual">Casual & Conversational</option>
                <option value="authoritative">Authoritative & Expert</option>
                <option value="motivational">Motivational & Inspiring</option>
              </select>
            </div>

            {/* Position/Title */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                Your Position/Title *
              </label>
              <input
                type="text"
                id="position"
                value={formData.position || ''}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Founder, CEO, Training Manager"
                required
                disabled={isLoading || localLoading}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-center items-center">
            <button
              type="submit"
              disabled={isLoading || localLoading || !formData.name || !formData.brand_name || !formData.niche || !formData.target_audience || !formData.problem_statement || !formData.desired_outcome}
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-base sm:text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-auto"
            >
              {localLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-3" />
                  <span className="text-white font-semibold">Generating Concepts...</span>
                </>
              ) : (
                <>
                  Generate Lead Magnet Concepts
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {isLoading && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                AI is analyzing your input and generating focused lead magnet concepts...
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default CampaignForm;