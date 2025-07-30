import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Download, FileText, Zap } from 'lucide-react';
import CampaignForm from './CampaignForm';
import ConceptSelection from './ConceptSelection';
import OutlineReview from './OutlineReview';
import ResultsDisplay from './ResultsDisplay';
import PDFGenerator from './PDFGenerator';
import { WizardState, CampaignInput, LeadMagnetConcept, ContentOutline, PDFCustomization } from '../types/index';
import { generateLeadMagnetConcepts, generateContentOutline, generateFinalCampaign } from '../lib/openai';
import LoadingSpinner from './LoadingSpinner';

const AdminLeadMagnetCreator: React.FC = () => {
  const [wizardState, setWizardState] = useState<WizardState>({
    stage: 'input',
    input: null,
    concepts: null,
    selectedConcept: null,
    outline: null,
    finalOutput: null,
    customization: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputSubmitted = async (input: CampaignInput) => {
    console.log('🔄 Starting concept generation...');
    setIsLoading(true);
    setError(null);

    try {
      const concepts = await generateLeadMagnetConcepts(input);
      console.log('✅ Concepts generated:', concepts);
      setWizardState(prev => ({
        ...prev,
        stage: 'concepts',
        input,
        concepts
      }));
    } catch (err) {
      console.error('❌ Concept generation failed:', err);
      setError('Failed to generate concepts: ' + ((err as any)?.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConceptSelected = async (selectedConcept: LeadMagnetConcept, customization?: PDFCustomization) => {
    console.log('🔄 Starting outline generation...');
    setIsLoading(true);
    setError(null);

    try {
      const outline = await generateContentOutline(wizardState.input!, selectedConcept);
      console.log('✅ Outline generated:', outline);
      setWizardState(prev => ({
        ...prev,
        stage: 'outline',
        selectedConcept,
        outline,
        customization
      }));
    } catch (err) {
      console.error('❌ Outline generation failed:', err);
      setError('Failed to generate outline: ' + ((err as any)?.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutlineApproved = async (finalOutline: ContentOutline) => {
    console.log('🔄 Starting final campaign generation...');
    setIsLoading(true);
    setError(null);

    try {
      const finalOutput = await generateFinalCampaign(wizardState.input!, finalOutline, wizardState.customization || undefined);
      console.log('✅ Final campaign generated:', finalOutput);
      setWizardState(prev => ({
        ...prev,
        stage: 'complete',
        outline: finalOutline,
        finalOutput
      }));
    } catch (err) {
      console.error('❌ Final generation failed:', err);
      setError('Failed to generate final campaign: ' + ((err as any)?.message || err));
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
      finalOutput: null,
      customization: null
    });
    setError(null);
  };

  const handleGoBack = () => {
    if (wizardState.stage === 'concepts') {
      setWizardState(prev => ({ ...prev, stage: 'input' }));
    } else if (wizardState.stage === 'outline') {
      setWizardState(prev => ({ ...prev, stage: 'concepts' }));
    } else if (wizardState.stage === 'complete') {
      setWizardState(prev => ({ ...prev, stage: 'outline' }));
    }
    setError(null);
  };

  const renderStageIndicator = () => {
    const stages = [
      { key: 'input', label: 'Campaign Input', icon: FileText },
      { key: 'concepts', label: 'Select Concept', icon: Zap },
      { key: 'outline', label: 'Review Outline', icon: FileText },
      { key: 'complete', label: 'Download PDF', icon: Download }
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = wizardState.stage === stage.key;
            const isCompleted = stages.findIndex(s => s.key === wizardState.stage) > index;

            return (
              <div key={stage.key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : isCompleted 
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-gray-200 border-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <div className="w-5 h-5">✓</div>
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {stage.label}
                </span>
                {index < stages.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Generating your lead magnet..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Lead Magnet Creator</h1>
              <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Admin Mode
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Full access - no payment required
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-600 mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {renderStageIndicator()}

        {/* Stage Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {wizardState.stage === 'input' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Create Your Lead Magnet
                </h2>
                <p className="text-lg text-gray-600">
                  Enter your business details and target audience to generate a professional lead magnet
                </p>
              </div>
              <CampaignForm onSubmit={handleInputSubmitted} />
            </div>
          )}

          {wizardState.stage === 'concepts' && wizardState.concepts && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Choose Your Lead Magnet Concept
                </h2>
                <p className="text-lg text-gray-600">
                  Select the concept that best fits your business and audience
                </p>
              </div>
              <ConceptSelection 
                concepts={wizardState.concepts}
                onConceptSelected={handleConceptSelected}
                onBack={handleGoBack}
              />
            </div>
          )}

          {wizardState.stage === 'outline' && wizardState.outline && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Review Your Content Outline
                </h2>
                <p className="text-lg text-gray-600">
                  Review and edit the AI-generated outline before final generation
                </p>
              </div>
              <OutlineReview 
                outline={wizardState.outline}
                onOutlineApproved={handleOutlineApproved}
                onBack={handleGoBack}
                isLoading={isLoading}
              />
            </div>
          )}

          {wizardState.stage === 'complete' && wizardState.finalOutput && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Your Lead Magnet is Ready!
                </h2>
                <p className="text-lg text-gray-600">
                  Download your professional lead magnet PDF
                </p>
              </div>
              <ResultsDisplay 
                finalOutput={wizardState.finalOutput}
                onStartOver={handleStartOver}
                onBack={handleGoBack}
                requirePayment={false}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          {wizardState.stage !== 'input' && (
            <button
              onClick={handleGoBack}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          )}
          
          {wizardState.stage !== 'input' && (
            <button
              onClick={handleStartOver}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLeadMagnetCreator; 