import React, { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { CampaignInput } from '../types';

interface CampaignFormProps {
  onSubmit: (input: CampaignInput) => void;
  isLoading: boolean;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CampaignInput>({
    niche: '',
    pain_point: '',
    desired_outcome: '',
    brand_name: '',
    tone: 'professional',
    target_audience: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Generate Your Lead Magnet Campaign</h2>
        <p className="text-gray-600">Tell us about your audience and we'll create a complete lead generation campaign</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="niche" className="block text-sm font-medium text-gray-700 mb-2">
              Niche / Industry
            </label>
            <input
              type="text"
              id="niche"
              name="niche"
              value={formData.niche}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="e.g., Digital Marketing, Health & Wellness"
              required
            />
          </div>

          <div>
            <label htmlFor="brand_name" className="block text-sm font-medium text-gray-700 mb-2">
              Brand Name
            </label>
            <input
              type="text"
              id="brand_name"
              name="brand_name"
              value={formData.brand_name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Your company or personal brand"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="pain_point" className="block text-sm font-medium text-gray-700 mb-2">
            Customer Pain Point
          </label>
          <textarea
            id="pain_point"
            name="pain_point"
            value={formData.pain_point}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="What specific problem does your target audience struggle with?"
            required
          />
        </div>

        <div>
          <label htmlFor="desired_outcome" className="block text-sm font-medium text-gray-700 mb-2">
            Desired Outcome
          </label>
          <textarea
            id="desired_outcome"
            name="desired_outcome"
            value={formData.desired_outcome}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="What transformation or result do they want to achieve?"
            required
          />
        </div>

        <div>
          <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700 mb-2">
            Target Audience
          </label>
          <input
            type="text"
            id="target_audience"
            name="target_audience"
            value={formData.target_audience}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="e.g., Small business owners, Fitness enthusiasts, New parents"
            required
          />
        </div>

        <div>
          <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
            Tone of Voice
          </label>
          <select
            id="tone"
            name="tone"
            value={formData.tone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="authoritative">Authoritative</option>
            <option value="conversational">Conversational</option>
            <option value="inspiring">Inspiring</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Generating Campaign...
            </>
          ) : (
            'Generate Campaign'
          )}
        </button>
      </form>
    </div>
  );
};

export default CampaignForm;