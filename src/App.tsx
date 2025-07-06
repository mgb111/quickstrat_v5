import React, { useState, useEffect } from 'react';
import { Zap, ArrowLeft, BarChart3, Plus } from 'lucide-react';
import CampaignForm from './components/CampaignForm';
import ConceptSelection from './components/ConceptSelection';
import OutlineReview from './components/OutlineReview';
import ResultsDisplay from './components/ResultsDisplay';
import Dashboard from './components/Dashboard';
import { WizardState, CampaignInput, LeadMagnetConcept, ContentOutline, CampaignOutput } from './types/index';
import { generateLeadMagnetConcepts, generateContentOutline, generateFinalCampaign } from './lib/openai';
import { CampaignService } from './lib/campaignService';
import { EmailService } from './lib/emailService';

type AppMode = 'wizard' | 'dashboard' | 'landing';

function App() {
  const [mode, setMode] = useState<AppMode>('wizard');
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

  const handleCampaignCreated = async () => {
    try {
      // Create campaign in database
      const campaign = await CampaignService.createCampaign(
        wizardState.input!,
        wizardState.finalOutput!
      );

      // Send welcome email to any existing leads
      if (campaign.lead_magnet_content) {
        // In a real implementation, you would send emails to leads
        await EmailService.sendWelcomeEmail(
          'example@email.com', // This would be the actual lead email
          campaign.id,
          campaign.lead_magnet_content,
          campaign.name
        );
      }

      // Switch to dashboard
      setMode('dashboard');
      setWizardState({
        stage: 'input',
        input: null,
        concepts: null,
        selectedConcept: null,
        outline: null,
        finalOutput: null
      });
    } catch (err) {
      console.error('Error creating campaign:', err);
      setError('Failed to create campaign. Please try again.');
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

  const handleNewCampaign = () => {
    setMode('wizard');
    handleStartOver();
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



  // Render dashboard
  if (mode === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">LeadGen Machine</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setMode('wizard')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </button>
              </div>
            </div>
          </div>
        </header>
        <Dashboard onNewCampaign={handleNewCampaign} />
      </div>
    );
  }

  // Render wizard
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
          
          {/* Navigation */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => setMode('dashboard')}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </button>
          </div>
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
              onCampaignCreated={handleCampaignCreated}
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