import React, { useState } from 'react';
import { Target, ArrowRight, Loader2 } from 'lucide-react';
import { LeadMagnetConcept } from '../types';

interface ConceptSelectionProps {
  concepts: LeadMagnetConcept[];
  onConceptSelected: (concept: LeadMagnetConcept) => void;
  isLoading?: boolean;
}

const ConceptSelection: React.FC<ConceptSelectionProps> = ({ 
  concepts, 
  onConceptSelected, 
  isLoading = false 
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedConcept = concepts.find(c => c.id === selectedConceptId);
    if (selectedConcept) {
      onConceptSelected(selectedConcept);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl">
            <Target className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Step 1: Choose Your Lead Magnet's Core Focus</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          To create a high-impact lead magnet, we need to solve one specific problem. Select ONE of the following tool-based concepts below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="space-y-4">
            {concepts.map((concept) => (
              <label
                key={concept.id}
                className={`block p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedConceptId === concept.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="radio"
                    name="concept"
                    value={concept.id}
                    checked={selectedConceptId === concept.id}
                    onChange={(e) => setSelectedConceptId(e.target.value)}
                    className="mt-1 h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${
                      selectedConceptId === concept.id ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {concept.title}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      selectedConceptId === concept.id ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {concept.description}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={!selectedConceptId || isLoading}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-3" />
                <span className="text-white font-semibold">Creating Outline...</span>
              </>
            ) : (
              <>
                Create Content Outline
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </button>
          
          {selectedConceptId && !isLoading && (
            <p className="text-sm text-gray-600 mt-3">
              AI will create a detailed outline for your selected concept
            </p>
          )}
          
          {isLoading && (
            <p className="text-sm text-gray-700 mt-3 font-medium">
              Generating your personalized content outline...
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default ConceptSelection;