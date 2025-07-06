import React, { useState } from 'react';
import { CampaignInput } from '../types';
import LoadingSpinner, { ButtonLoader } from './LoadingSpinner';

interface CampaignFormProps {
  onSubmit: (input: CampaignInput) => void;
  isLoading: boolean;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CampaignInput>({
    brand_name: '',
    target_audience: '',
    customer_problems: '',
    industry: '',
    tone: 'professional'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof CampaignInput, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Campaign Information</h2>
          
          <div className="space-y-6">
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            {/* Customer Problems */}
            <div>
              <label htmlFor="customer_problems" className="block text-sm font-medium text-gray-700 mb-2">
                Customer Problems/Pain Points *
              </label>
              <textarea
                id="customer_problems"
                value={formData.customer_problems}
                onChange={(e) => handleInputChange('customer_problems', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="List the main problems your customers face (e.g., Lack of time to manage social media, Difficulty tracking ROI, Not knowing which platforms to focus on)"
                required
                disabled={isLoading}
              />
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry/Sector
              </label>
              <input
                type="text"
                id="industry"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Digital Marketing, SaaS, E-commerce"
                disabled={isLoading}
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
                disabled={isLoading}
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly & Approachable</option>
                <option value="casual">Casual & Conversational</option>
                <option value="authoritative">Authoritative & Expert</option>
                <option value="motivational">Motivational & Inspiring</option>
              </select>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isLoading || !formData.brand_name || !formData.target_audience || !formData.customer_problems}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <ButtonLoader text="Generating Concepts..." />
              ) : (
                <>
                  <span>Generate Lead Magnet Concepts</span>
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