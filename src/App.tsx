import React, { useState } from 'react';
import { Zap, ArrowLeft } from 'lucide-react';
import CampaignForm from './components/CampaignForm';
import ResultsDisplay from './components/ResultsDisplay';
import { CampaignInput, CampaignOutput } from './types';
import { generateCampaign } from './lib/openai';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CampaignOutput | null>(null);
  const [currentInput, setCurrentInput] = useState<CampaignInput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCampaign = async (input: CampaignInput) => {
    setIsLoading(true);
    setError(null);
    setCurrentInput(input);

    try {
      // Generate campaign content
      const campaignOutput = await generateCampaign(input);
      setResults(campaignOutput);
    } catch (err) {
      console.error('Error generating campaign:', err);
      setError('Failed to generate campaign. Please check your API keys and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setResults(null);
    setCurrentInput(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            LeadGen <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Machine</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform one customer problem into a complete lead magnet campaign with AI-powered copywriting
          </p>
        </header>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-center">{error}</p>
          </div>
        )}

        {!results ? (
          <CampaignForm onSubmit={handleGenerateCampaign} isLoading={isLoading} />
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <button
                onClick={handleStartOver}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Generate Another Campaign
              </button>
            </div>
            <ResultsDisplay results={results} brandName={currentInput?.brand_name || 'Your Brand'} />
          </div>
        )}

        <footer className="mt-16 text-center text-gray-500">
          <p>© 2025 LeadGen Machine. Transform problems into powerful lead magnets.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;