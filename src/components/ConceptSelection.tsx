import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Target, ArrowRight, Loader2, ArrowLeft, Palette, Settings } from 'lucide-react';
import { LeadMagnetConcept } from '../types';
import { PDFCustomization } from '../types';

interface CustomizationValues {
  ctaText: string;
  mainAction: string;
  bookingLink: string;
  website: string;
  supportEmail: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  font: string;
}

interface ConceptSelectionProps {
  concepts: LeadMagnetConcept[];
  onConceptSelected: (concept: LeadMagnetConcept, customization?: PDFCustomization) => void;
  isLoading?: boolean;
}

const defaultCustomization: CustomizationValues = {
  ctaText: 'Ready to take your business to the next level?',
  mainAction: 'Book a Free Strategy Call',
  bookingLink: '',
  website: '',
  supportEmail: '',
  logo: '',
  primaryColor: '#1a365d',
  secondaryColor: '#4a90e2',
  font: 'Inter',
};

const ConceptSelection: React.FC<ConceptSelectionProps> = ({ 
  concepts, 
  onConceptSelected, 
  isLoading = false 
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>('');
  const [showCustomization, setShowCustomization] = useState(false);
  const [customization, setCustomization] = useState<CustomizationValues>(defaultCustomization);
  const [localLoading, setLocalLoading] = useState(false);
  const [customizationLoading, setCustomizationLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Add a ref to the form element for additional safety
  const formRef = useRef<HTMLFormElement>(null);

  function isValidUrl(url: string) {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  function isValidEmail(email: string) {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const handleSubmit = (e: React.FormEvent) => {
    console.log('🎯 handleSubmit called with event:', e);
    e.preventDefault();
    if (!isLoading && !localLoading && selectedConceptId) {
      console.log('🎯 Setting local loading to true');
      setLocalLoading(true);
      const selectedConcept = concepts.find(c => c.id === selectedConceptId);
      if (selectedConcept) {
        console.log('🎯 Selected concept found, showing customization');
        setShowCustomization(true);
      }
      setLocalLoading(false);
    } else {
      console.log('🎯 handleSubmit conditions not met:', { isLoading, localLoading, selectedConceptId });
    }
  };

  // Create a stable reference to the submit handler
  const submitHandler = useCallback((e: React.FormEvent) => {
    try {
      console.log('🎯 submitHandler callback called');
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      
      // Double-check that we have all required data
      if (!concepts || concepts.length === 0) {
        console.error('🎯 No concepts available');
        return;
      }
      
      if (!selectedConceptId) {
        console.error('🎯 No concept selected');
        return;
      }
      
      if (isLoading || localLoading) {
        console.log('🎯 Already loading, ignoring submit');
        return;
      }
      
      console.log('🎯 Proceeding with concept selection');
      setLocalLoading(true);
      
      const selectedConcept = concepts.find(c => c.id === selectedConceptId);
      if (selectedConcept) {
        console.log('🎯 Selected concept found, showing customization:', selectedConcept);
        setShowCustomization(true);
      } else {
        console.error('🎯 Selected concept not found in concepts array');
      }
      
      setLocalLoading(false);
    } catch (error) {
      console.error('🎯 Error in submitHandler:', error);
      setLocalLoading(false);
    }
  }, [selectedConceptId, isLoading, localLoading, concepts]);

  console.log('🎯 ConceptSelection component - handleSubmit function defined:', typeof handleSubmit);
  console.log('🎯 ConceptSelection component - submitHandler callback defined:', typeof submitHandler);

  // Ensure component is properly mounted
  useEffect(() => {
    console.log('🎯 ConceptSelection component mounted');
    console.log('🎯 Available functions:', {
      handleSubmit: typeof handleSubmit,
      submitHandler: typeof submitHandler,
      handleCustomizationSubmit: typeof handleCustomizationSubmit,
      handleConceptSelect: typeof handleConceptSelect
    });
    console.log('🎯 Component state:', {
      selectedConceptId,
      showCustomization,
      isLoading,
      localLoading,
      conceptsCount: concepts?.length
    });
  }, [selectedConceptId, showCustomization, isLoading, localLoading, concepts]);

  const handleCustomizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!isValidUrl(customization.bookingLink)) {
      setValidationError('Please enter a valid Booking Link URL.');
      return;
    }
    if (!isValidUrl(customization.website)) {
      setValidationError('Please enter a valid Website URL.');
      return;
    }
    if (!isValidEmail(customization.supportEmail)) {
      setValidationError('Please enter a valid Support Email.');
      return;
    }
    if (!customizationLoading) {
      setCustomizationLoading(true);
      const selectedConcept = concepts.find(c => c.id === selectedConceptId);
      if (selectedConcept) {
        await onConceptSelected(selectedConcept, customization);
      }
      setCustomizationLoading(false);
    }
  };

  const handleConceptSelect = (conceptId: string) => {
    console.log('Concept selected:', conceptId);
    setSelectedConceptId(conceptId);
    setShowCustomization(true);
    console.log('showCustomization set to true');
  };

  const goBackToConcepts = () => {
    setShowCustomization(false);
    setSelectedConceptId('');
  };

  const handleSkipCustomization = async () => {
    setValidationError(null);
    if (!isValidUrl(defaultCustomization.bookingLink)) {
      setValidationError('Default Booking Link is invalid.');
      return;
    }
    if (!isValidUrl(defaultCustomization.website)) {
      setValidationError('Default Website URL is invalid.');
      return;
    }
    if (!isValidEmail(defaultCustomization.supportEmail)) {
      setValidationError('Default Support Email is invalid.');
      return;
    }
    if (!customizationLoading) {
      setCustomizationLoading(true);
      const selectedConcept = concepts.find(c => c.id === selectedConceptId);
      if (selectedConcept) {
        // Use default customization values
        await onConceptSelected(selectedConcept, defaultCustomization);
      }
      setCustomizationLoading(false);
    }
  };

  if (showCustomization) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl">
              <Palette className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Customize Your PDF</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Personalize your lead magnet with your branding and contact information. 
            <span className="text-blue-600 font-medium"> You can skip this step and use default settings.</span>
          </p>
        </div>
        {validationError && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {validationError}
          </div>
        )}
        <form onSubmit={handleCustomizationSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Contact & CTA */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Contact & CTA Settings
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CTA Text
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={customization.ctaText} 
                    onChange={e => setCustomization({ ...customization, ctaText: e.target.value })} 
                    placeholder="e.g. Unlock your free strategy call!" 
                  />
                </div>

          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Action Label
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={customization.mainAction} 
                    onChange={e => setCustomization({ ...customization, mainAction: e.target.value })} 
                    placeholder="e.g. Book a Call" 
                  />
          </div>

          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Link
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={customization.bookingLink} 
                    onChange={e => setCustomization({ ...customization, bookingLink: e.target.value })} 
                    placeholder="e.g. https://calendly.com/your-link" 
                  />
          </div>

          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={customization.website} 
                    onChange={e => setCustomization({ ...customization, website: e.target.value })} 
                    placeholder="e.g. https://yourwebsite.com" 
                  />
          </div>

          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Email
                  </label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={customization.supportEmail} 
                    onChange={e => setCustomization({ ...customization, supportEmail: e.target.value })} 
                    placeholder="e.g. support@yourwebsite.com" 
                  />
                </div>
          </div>

              {/* Right Column - Branding */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-purple-600" />
                  Branding & Design
                </h3>

          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Upload
                  </label>
            <input
              type="file"
              accept="image/*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={e => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setCustomization({ ...customization, logo: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {customization.logo && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <img src={customization.logo} alt="Logo Preview" className="h-12 object-contain mx-auto" />
                    </div>
            )}
          </div>

                <div className="grid grid-cols-2 gap-4">
          <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="color" 
                        className="w-12 h-10 border rounded-lg cursor-pointer"
                        value={customization.primaryColor} 
                        onChange={e => setCustomization({ ...customization, primaryColor: e.target.value })} 
                      />
                      <span className="text-sm text-gray-600">{customization.primaryColor}</span>
                    </div>
          </div>

          <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="color" 
                        className="w-12 h-10 border rounded-lg cursor-pointer"
                        value={customization.secondaryColor} 
                        onChange={e => setCustomization({ ...customization, secondaryColor: e.target.value })} 
                      />
                      <span className="text-sm text-gray-600">{customization.secondaryColor}</span>
                    </div>
                  </div>
          </div>

          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={customization.font}
                    onChange={e => setCustomization({ ...customization, font: e.target.value })}
                  >
                    <option value="Helvetica">Helvetica</option>
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              type="button"
              onClick={goBackToConcepts}
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Concepts
            </button>
            
            <button
              type="button"
              onClick={handleSkipCustomization}
              disabled={customizationLoading}
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Skip Customization
            </button>
            
            <button
              type="submit"
              disabled={customizationLoading}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {customizationLoading ? (
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
          </div>

          {customizationLoading && (
            <div className="text-center">
              <p className="text-sm text-gray-700 font-medium">
                Generating your personalized content outline...
              </p>
            </div>
          )}
        </form>
      </div>
    );
  }

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

      <form 
        ref={formRef}
        onSubmit={submitHandler} 
        className="space-y-6"
        onError={(e) => {
          console.error('🎯 Form error event:', e);
        }}
      >
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
                    onChange={(e) => handleConceptSelect(e.target.value)}
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
            disabled={!selectedConceptId || isLoading || localLoading}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading || localLoading ? (
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
            <div className="text-center">
              <p className="text-sm text-gray-600 mt-3">
                AI will create a detailed outline for your selected concept
              </p>
              <p className="text-sm text-blue-600 mt-2 font-medium">
                ✨ Customization options will be available after concept selection
              </p>
            </div>
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