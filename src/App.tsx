import React, { useState, useEffect } from 'react';
import { Zap, ArrowLeft, BarChart3, Plus, User, Lock, Crown } from 'lucide-react';
import CampaignForm from './components/CampaignForm';
import ConceptSelection from './components/ConceptSelection';
import OutlineReview from './components/OutlineReview';
import ResultsDisplay from './components/ResultsDisplay';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import PublicLandingPage from './components/PublicLandingPage';
import Auth from './components/Auth/Auth';
import UserProfile from './components/UserProfile';
import { useAuth } from './contexts/AuthContext';
import { WizardState, CampaignInput, LeadMagnetConcept, ContentOutline, PDFCustomization } from './types/index';
import { generateLeadMagnetConcepts, generateContentOutline, generateFinalCampaign } from './lib/openai';
import { CampaignService } from './lib/campaignService';
import { EmailService } from './lib/emailService';
import { SubscriptionService, SubscriptionStatus } from './lib/subscriptionService';
import LoadingSpinner from './components/LoadingSpinner';
import UpgradeModal from './components/UpgradeModal';

type AppMode = 'public' | 'auth' | 'wizard' | 'dashboard' | 'landing' | 'profile';

function App() {
  console.log('App component rendering...');
  
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<AppMode>('public');
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
  
  // Add subscription state
  const [subscription, setSubscription] = useState<SubscriptionStatus>(
    SubscriptionService.getDefaultSubscription()
  );
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  console.log('Auth state:', { user, loading, mode });
  console.log('🎯 Current wizard stage:', wizardState.stage);
  console.log('💰 Subscription status:', subscription);

  // Check for landing page route on mount
  useEffect(() => {
    const path = window.location.pathname;
    console.log('Current path:', path);
    if (path.startsWith('/landing/')) {
      setMode('landing');
    }
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    const handleAuthChange = async () => {
      console.log('Auth effect running:', { loading, user, mode });
      if (!loading) {
        if (user) {
          // User is authenticated, show dashboard
          console.log('User authenticated, switching to dashboard');
          if (mode === 'auth' || mode === 'public') {
            setMode('dashboard');
          }
          // Fetch user's subscription status from Supabase
          if (user?.id) {
            try {
              const userSubscription = await SubscriptionService.getUserSubscription(user.id);
              setSubscription(userSubscription);
            } catch (error) {
              console.error('Error fetching subscription:', error);
              setSubscription(SubscriptionService.getDefaultSubscription());
            }
          } else {
            setSubscription(SubscriptionService.getDefaultSubscription());
          }
        } else {
          // User is not authenticated, show public landing or auth
          console.log('User not authenticated');
          if (mode !== 'landing' && mode !== 'public') {
            setMode('public');
          }
        }
      }
    };

    handleAuthChange();
  }, [user, loading]); // Removed 'mode' from dependencies to prevent infinite loop

  // Extract campaign slug from URL
  const getCampaignSlug = () => {
    const path = window.location.pathname;
    if (path.startsWith('/landing/')) {
      return path.replace('/landing/', '');
    }
    return '';
  };

  const handleAuthSuccess = () => {
    setMode('dashboard');
  };

  const handleInputSubmit = async (input: CampaignInput) => {
    console.log('🔄 Starting concept generation...');
    setIsLoading(true);
    setError(null);

    try {
      const concepts = await generateLeadMagnetConcepts(input);
      console.log('✅ Concepts generated:', concepts);
      setWizardState({
        stage: 'concept-selection',
        input,
        concepts,
        selectedConcept: null,
        outline: null,
        finalOutput: null,
        customization: null // Reset customization on new input
      });
      console.log('🎯 Moved to concept-selection stage');
    } catch (err) {
      console.error('❌ Error generating concepts:', err);
      setError('Failed to generate lead magnet concepts. Please check your API keys and try again.');
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
        stage: 'outline-review',
        selectedConcept,
        outline,
        customization // store customization in wizard state
      }));
      console.log('🎯 Moved to outline-review stage');
    } catch (err) {
      console.error('❌ Error generating outline:', err);
      setError('Failed to generate content outline. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutlineApproved = async (finalOutline: ContentOutline) => {
    // Check if user can access PDF generation (premium feature)
    if (!subscription.canAccessPDF) {
      console.log('🔒 User needs premium access for PDF generation');
      setWizardState(prev => ({
        ...prev,
        stage: 'upgrade-required',
        outline: finalOutline
      }));
      return;
    }

    console.log('🔄 Starting final campaign generation...');
    setIsLoading(true);
    setError(null);

    try {
      let finalOutput = await generateFinalCampaign(wizardState.input!, finalOutline);
      console.log('✅ Final campaign generated:', finalOutput);
      // Merge customization into pdf_content if present
      if (wizardState.customization && typeof finalOutput.pdf_content === 'object') {
        finalOutput = {
          ...finalOutput,
          pdf_content: {
            ...finalOutput.pdf_content,
            ...wizardState.customization
          }
        };
      }
      // Automatically save campaign to Supabase
      await CampaignService.createCampaign(wizardState.input!, finalOutput);
      setWizardState(prev => ({
        ...prev,
        stage: 'complete',
        outline: finalOutline,
        finalOutput
      }));
      console.log('🎯 Moved to complete stage and campaign saved');
    } catch (err) {
      console.error('❌ Error generating final campaign:', err);
      setError('Failed to generate final campaign. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCampaignCreated = async () => {
    // Just switch to dashboard and reset wizard state
    setMode('dashboard');
    setWizardState({
      stage: 'input',
      input: null,
      concepts: null,
      selectedConcept: null,
      outline: null,
      finalOutput: null,
      customization: null // Reset customization on new campaign
    });
  };

  const handleStartOver = () => {
    setWizardState({
      stage: 'input',
      input: null,
      concepts: null,
      selectedConcept: null,
      outline: null,
      finalOutput: null,
      customization: null // Reset customization on start over
    });
    setError(null);
  };

  const handleGoBack = () => {
    switch (wizardState.stage) {
      case 'concept-selection':
        setWizardState(prev => ({
          ...prev,
          stage: 'input'
        }));
        break;
      case 'outline-review':
        setWizardState(prev => ({
          ...prev,
          stage: 'concept-selection'
        }));
        break;
      case 'upgrade-required':
        setWizardState(prev => ({
          ...prev,
          stage: 'outline-review'
        }));
        break;
      case 'complete':
        setWizardState(prev => ({
          ...prev,
          stage: 'outline-review'
        }));
        break;
      default:
        break;
    }
    setError(null);
  };

  const handleNewCampaign = () => {
    console.log('🎯 New Campaign button clicked');
    console.log('🎯 Setting mode to wizard');
    setMode('wizard');
    console.log('🎯 Calling handleStartOver');
    handleStartOver();
    console.log('🎯 New campaign setup complete');
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  const handleUpgradePlan = (plan: 'premium', billing: 'monthly' | 'yearly') => {
    console.log('🚀 User upgrading to:', plan, 'with', billing, 'billing');
    // TODO: Implement actual payment flow
    // For now, just simulate upgrade
    setSubscription(prev => ({
      ...prev,
      isSubscribed: true,
      plan,
      canAccessPDF: true,
      canAccessUnlimitedCampaigns: false,
      monthlyCampaignLimit: 5
    }));
    setShowUpgradeModal(false);
    
    // Continue to PDF generation
    if (wizardState.stage === 'upgrade-required' && wizardState.outline) {
      handleOutlineApproved(wizardState.outline);
    }
  };

  const renderStageIndicator = () => {
    const stages = [
      { id: 'input', label: 'Input', number: 1, free: true },
      { id: 'concept-selection', label: 'Focus', number: 2, free: true },
      { id: 'outline-review', label: 'Review', number: 3, free: true },
      { id: 'complete', label: 'Download', number: 4, free: false }
    ];

    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {stages.map((stage, index) => {
            const isActive = wizardState.stage === stage.id;
            const isCompleted = stages.findIndex(s => s.id === wizardState.stage) > index;
            const isLocked = !stage.free && !subscription.canAccessPDF;
            
            return (
              <React.Fragment key={stage.id}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-colors relative ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isLocked
                        ? 'bg-gray-300 text-gray-500'
                        : 'bg-gray-200 text-gray-600'
                }`}>
                  {isLocked ? <Lock className="h-4 w-4" /> : stage.number}
                  {!stage.free && (
                    <Crown className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : isLocked ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {stage.label}
                  {!stage.free && <span className="ml-1 text-xs text-yellow-600">(Premium)</span>}
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

  // Show loading while checking authentication
  if (loading) {
    console.log('Showing loading spinner...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading..." />
      </div>
    );
  }

  // Show error if there's an issue
  if (error) {
    console.log('Showing error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Application Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  console.log('Rendering main app with mode:', mode);

  // Render landing page (no auth required)
  if (mode === 'landing') {
    return <LandingPage campaignSlug={getCampaignSlug()} />;
  }

  // Render public landing page (no auth required)
  if (mode === 'public') {
    return <PublicLandingPage onGetStarted={() => setMode('auth')} onLogin={() => setMode('auth')} />;
  }

  // Render authentication (no user)
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Render profile page
  if (mode === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">Majorbeam</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => setMode('dashboard')}
                  className="inline-flex items-center px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto p-6">
          <UserProfile />
        </div>
      </div>
    );
  }

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
                <span className="ml-3 text-xl font-bold text-gray-900">Majorbeam</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <button
                  onClick={() => setMode('wizard')}
                  className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </button>
                <button
                  onClick={() => setMode('profile')}
                  className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <header className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 sm:p-4 rounded-2xl">
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            LeadGen <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Machine</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Transform customer problems into focused, high-value lead magnets with AI assistance
          </p>
          
          {/* Freemium indicator */}
          <div className="mt-4 flex justify-center">
            <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-medium">
              <Crown className="h-4 w-4 mr-1" />
              {subscription.canAccessPDF ? 'Premium Plan' : 'Free Plan - Upgrade for PDF Downloads'}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
            <button
              onClick={() => setMode('dashboard')}
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setMode('profile')}
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
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
          <div className="w-full">
            {(() => { console.log('🎯 Rendering CampaignForm component'); return null; })()}
            <CampaignForm onSubmit={handleInputSubmit} isLoading={isLoading} />
          </div>
        )}

        {wizardState.stage === 'concept-selection' && wizardState.concepts && (
          <div className="space-y-6 sm:space-y-8 w-full">
            <div className="text-center space-x-4">
              <button
                onClick={handleGoBack}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </button>
              <button
                onClick={handleStartOver}
                className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
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
          <div className="space-y-6 sm:space-y-8 w-full">
            <div className="text-center space-x-4">
              <button
                onClick={handleGoBack}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </button>
              <button
                onClick={handleStartOver}
                className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
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

        {/* New upgrade required stage */}
        {wizardState.stage === 'upgrade-required' && (
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-8">
              <div className="mb-6">
                <Crown className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Ready for Your PDF?
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  You've completed the free preview! Upgrade to Premium to unlock your complete end-to-end campaign with PDF downloads, landing page generation, and lead capture.
                </p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">Input & Concept Selection</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">Content Outline Review</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">PDF Generation & Download</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105"
                >
                  <Crown className="h-5 w-5 inline mr-2" />
                  Upgrade to Premium - $49/month
                </button>
                <p className="text-sm text-gray-600">
                  Includes <strong>5 campaigns per month</strong>, unlimited PDF downloads, landing page generation, and lead capture
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleGoBack}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleStartOver}
                    className="flex-1 bg-red-100 text-red-700 py-3 px-6 rounded-lg font-medium hover:bg-red-200 transition-colors"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {wizardState.stage === 'complete' && wizardState.finalOutput && (
          <div className="space-y-6 sm:space-y-8 w-full">
            <div className="text-center space-x-4">
              <button
                onClick={handleGoBack}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </button>
              <button
                onClick={handleStartOver}
                className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Generate Another Campaign
              </button>
            </div>
            <ResultsDisplay 
              results={wizardState.finalOutput} 
              brandName={wizardState.input?.brand_name || 'Your Brand'}
              userName={wizardState.input?.name || ''}
              problemStatement={wizardState.input?.problem_statement || ''}
              desiredOutcome={wizardState.input?.desired_outcome || ''}
              onCampaignCreated={handleCampaignCreated}
            />
          </div>
        )}

        <footer className="mt-12 sm:mt-16 text-center text-gray-500 px-4">
          <p>© 2025 Majorbeam. AI assists, experts direct, humans approve.</p>
        </footer>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgradePlan}
      />
    </div>
  );
}

export default App;
