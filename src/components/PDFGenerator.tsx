import React, { useState } from 'react';
import { Zap, ArrowLeft } from 'lucide-react';
import CampaignForm from './components/CampaignForm';
import ConceptSelection from './components/ConceptSelection';
import OutlineReview from './components/OutlineReview';
import ResultsDisplay from './components/ResultsDisplay';
import { WizardState, CampaignInput, LeadMagnetConcept, ContentOutline, CampaignOutput } from './types';
import { generateLeadMagnetConcepts, generateContentOutline, generateFinalCampaign } from './lib/openai';

function App() {
  const [wizardState, setWizardState] = useState<WizardState>({
    stage: 'input',
    input: null,
    concepts: null,
    selectedConcept: null,
    outline: null,
    finalOutput: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputSubmit = async (input: CampaignInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const concepts = await generateLeadMagnetConcepts(input);
      setWizardState({
        stage: 'concept-selection',
        input,
        concepts,
        selectedConcept: null,
        outline: null,
        finalOutput: null
      });
    } catch (err) {
      console.error('Error generating concepts:', err);
      setError('Failed to generate lead magnet concepts. Please check your API keys and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConceptSelected = async (selectedConcept: LeadMagnetConcept) => {
    setIsLoading(true);
    setError(null);

    try {
      const outline = await generateContentOutline(wizardState.input!, selectedConcept);
      setWizardState(prev => ({
        ...prev,
        stage: 'outline-review',
        selectedConcept,
        outline
      }));
    } catch (err) {
      console.error('Error generating outline:', err);
      setError('Failed to generate content outline. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutlineApproved = async (finalOutline: ContentOutline) => {
    setIsLoading(true);
    setError(null);

    try {
      const finalOutput = await generateFinalCampaign(wizardState.input!, finalOutline);
      setWizardState(prev => ({
        ...prev,
        stage: 'complete',
        outline: finalOutline,
        finalOutput
      }));
    } catch (err) {
      console.error('Error generating final campaign:', err);
      setError('Failed to generate final campaign. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setWizardState({
      stage: 'input',
      input: null,
      concepts: null,
      selectedConcept: null,
      outline: null,
      finalOutput: null
    });
    setError(null);
  };

  const renderStageIndicator = () => {
    const stages = [
      { id: 'input', label: 'Input', number: 1 },
      { id: 'concept-selection', label: 'Focus', number: 2 },
      { id: 'outline-review', label: 'Review', number: 3 },
      { id: 'complete', label: 'Complete', number: 4 }
    ];

    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {stages.map((stage, index) => {
            const isActive = wizardState.stage === stage.id;
            const isCompleted = stages.findIndex(s => s.id === wizardState.stage) > index;
            
            return (
              <React.Fragment key={stage.id}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-colors ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {stage.number}
                </div>
                <span className={`text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {stage.label}
                </span>
                {index < stages.length - 1 && (
                  <div className={`w-8 h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
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
            Transform customer problems into focused, high-value lead magnets with AI assistance
          </p>
        </header>

        {wizardState.stage !== 'input' && renderStageIndicator()}

        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-center">{error}</p>
          </div>
        )}

        {wizardState.stage === 'input' && (
          <CampaignForm onSubmit={handleInputSubmit} isLoading={isLoading} />
        )}

        {wizardState.stage === 'concept-selection' && wizardState.concepts && (
          <div className="space-y-8">
            <div className="text-center">
              <button
                onClick={handleStartOver}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Start Over
              </button>
            </div>
            <ConceptSelection 
              concepts={wizardState.concepts}
              onConceptSelected={handleConceptSelected}
              isLoading={isLoading}
            />
          </div>
        )}

        {wizardState.stage === 'outline-review' && wizardState.outline && (
          <div className="space-y-8">
            <div className="text-center">
              <button
                onClick={handleStartOver}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Start Over
              </button>
            </div>
            <OutlineReview 
              outline={wizardState.outline}
              onOutlineApproved={handleOutlineApproved}
              isLoading={isLoading}
            />
          </div>
        )}

        {wizardState.stage === 'complete' && wizardState.finalOutput && (
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
            <ResultsDisplay 
              results={wizardState.finalOutput} 
              brandName={wizardState.input?.brand_name || 'Your Brand'} 
            />
          </div>
        )}

        <footer className="mt-16 text-center text-gray-500">
          <p>© 2025 LeadGen Machine. AI assists, experts direct, humans approve.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;