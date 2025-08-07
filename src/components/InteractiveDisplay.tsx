import React, { useState } from 'react';
import { CampaignOutput, LeadMagnetFormat } from '../types/index';
import EmailCapture from './EmailCapture';

interface InteractiveDisplayProps {
  results: CampaignOutput;
  selectedFormat: LeadMagnetFormat;
  brandName: string;
  requirePayment?: boolean;
  emailAlreadySubmitted?: boolean;
}

const InteractiveDisplay: React.FC<InteractiveDisplayProps> = ({ 
  results, 
  selectedFormat, 
  brandName, 
  requirePayment = false,
  emailAlreadySubmitted = false
}) => {
  const [emailSubmitted, setEmailSubmitted] = useState(emailAlreadySubmitted);
  const [currentStep, setCurrentStep] = useState(0);
  
  // ROI Calculator State
  const [calculatorInputs, setCalculatorInputs] = useState<Record<string, number>>({});
  const [calculationResults, setCalculationResults] = useState<Record<string, any>>({});
  
  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [quizResults, setQuizResults] = useState<any>(null);
  const [currentQuizStep, setCurrentQuizStep] = useState(0);

  const handleEmailSubmitted = () => {
    setEmailSubmitted(true);
  };

  // Parse content once at component level
  const content = typeof results.pdf_content === 'string'
    ? JSON.parse(results.pdf_content)
    : results.pdf_content;


  // Handle calculator input changes
  const handleCalculatorInputChange = (fieldName: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newInputs = { ...calculatorInputs, [fieldName]: numericValue };
    setCalculatorInputs(newInputs);
  };

  // Quiz calculation logic
  const calculateQuizResults = () => {
    if (Object.keys(quizAnswers).length !== 10) {
      alert('Please answer all 10 questions to get your results.');
      return;
    }

    // Calculate total scores for each category
    const totalScores = {
      awareness: 0,
      implementation: 0,
      optimization: 0,
      strategy: 0
    };

    // Sum up all scores from answered questions
    Object.values(quizAnswers).forEach((answer: any) => {
      if (answer.scores) {
        totalScores.awareness += answer.scores.awareness || 0;
        totalScores.implementation += answer.scores.implementation || 0;
        totalScores.optimization += answer.scores.optimization || 0;
        totalScores.strategy += answer.scores.strategy || 0;
      }
    });

    // Calculate total score
    const totalScore = totalScores.awareness + totalScores.implementation + totalScores.optimization + totalScores.strategy;

    // Determine result category based on score ranges
    let resultCategory;
    if (totalScore >= 0 && totalScore <= 15) {
      resultCategory = 'Foundation Builder';
    } else if (totalScore >= 16 && totalScore <= 25) {
      resultCategory = 'Implementation Specialist';
    } else if (totalScore >= 26 && totalScore <= 35) {
      resultCategory = 'Optimization Expert';
    } else {
      resultCategory = 'Strategic Master';
    }

    // Find the matching result from the quiz content
    const matchingResult = content?.quiz_content?.results?.find((result: any) => 
      result.category === resultCategory
    );

    if (matchingResult) {
      setQuizResults({
        ...matchingResult,
        totalScore,
        categoryScores: totalScores
      });
    } else {
      // Fallback result if no matching category found
      setQuizResults({
        category: resultCategory,
        description: 'Based on your answers, we\'ve identified your current level and created a personalized action plan.',
        totalScore,
        categoryScores: totalScores,
        action_steps: [
          'Review your current approach',
          'Identify key improvement areas',
          'Implement recommended strategies',
          'Track progress and adjust'
        ],
        timeline: '4-6 weeks to see improvement',
        success_metrics: [
          'Clear understanding of current level',
          'Specific improvement areas identified',
          'Action plan implemented',
          'Progress tracking established'
        ],
        recommendations: [
          'Focus on your identified improvement areas',
          'Follow the recommended timeline',
          'Track your progress regularly',
          'Adjust your approach based on results'
        ]
      });
    }
  };

  // Quiz Logic
  const handleQuizAnswer = (questionIndex: number, answer: string) => {
    const newAnswers = { ...quizAnswers, [questionIndex]: answer };
    setQuizAnswers(newAnswers);
  };



  const getQuizRecommendations = (category: string) => {
    switch (category) {
      case 'budget-conscious':
        return [
          'Focus on cost-effective styling solutions',
          'Look for multi-purpose pieces',
          'Consider subscription services for better value',
          'Invest in quality basics that last longer'
        ];
      case 'time-focused':
        return [
          'Use styling services to save time',
          'Create a capsule wardrobe for quick decisions',
          'Invest in versatile pieces',
          'Use styling apps for quick outfit planning'
        ];
      case 'quality-focused':
        return [
          'Invest in high-quality, timeless pieces',
          'Work with professional stylists',
          'Focus on craftsmanship and materials',
          'Build a curated, premium wardrobe'
        ];
      default:
        return [
          'Balance cost, time, and quality in your decisions',
          'Start with basics and build gradually',
          'Experiment with different styling approaches',
          'Find what works best for your lifestyle'
        ];
    }
  };

  const getFormatDisplayName = (format: LeadMagnetFormat): string => {
    switch (format) {
      case 'interactive_quiz': return 'Interactive Quiz';
      case 'pdf': return 'PDF Guide';
      default: return 'PDF Guide';
    }
  };

  const getFormatDescription = (format: LeadMagnetFormat): string => {
    switch (format) {
      case 'interactive_quiz': return 'A personalized diagnostic quiz that provides immediate insights and actionable next steps';
      case 'pdf': return 'A comprehensive PDF guide with step-by-step instructions, templates, and resources';
      default: return 'A comprehensive PDF guide with step-by-step instructions, templates, and resources';
    }
  };

  const formatInfo = {
    title: getFormatDisplayName(selectedFormat),
    description: getFormatDescription(selectedFormat),
    successMessage: '✅ Email submitted! Your guide is ready below.',
    actionText: 'Start Quiz',
    isInteractive: selectedFormat === 'interactive_quiz'
  };

  const renderInteractiveContent = () => {
    if (!content) return null;

    switch (selectedFormat) {
      case 'interactive_quiz':
        return (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {content.title_page?.title || 'Interactive Diagnostic Quiz'}
              </h1>
              <p className="text-lg text-gray-600">
                {content.title_page?.subtitle || '10-Question Diagnostic to Identify Your Core Challenges'}
              </p>
            </div>

            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                {content.founder_intro || 'This comprehensive diagnostic will reveal the root causes of your challenges and provide a personalized action plan with exact next steps.'}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">🎯 What You'll Discover</h2>
              <ul className="space-y-2 text-blue-800">
                <li>• Your current knowledge and implementation level</li>
                <li>• Specific challenges and obstacles</li>
                <li>• Personalized action plan with timelines</li>
                <li>• Success metrics and tracking methods</li>
              </ul>
            </div>

            {/* Dynamic Quiz - Based on AI Content */}
            {content.quiz_content?.questions && (
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">📋 {content.quiz_content.title || 'Your Diagnostic Checklist'}</h2>
                <p className="text-blue-700 mb-6">{content.quiz_content.description}</p>
                
                <div className="space-y-6">
                  {content.quiz_content.questions.map((question: any, index: number) => (
                    <div key={question.id || index} className="bg-white rounded-lg p-6 border border-blue-200">
                      <h3 className="font-semibold text-blue-900 mb-4">
                        Question {question.id || index + 1}: {question.question}
                      </h3>
                      
                      <div className="space-y-3">
                        {question.options?.map((option: any, optionIndex: number) => (
                          <label key={option.id || optionIndex} className="flex items-start cursor-pointer bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-blue-25 transition-colors">
                            <input
                              type="radio"
                              name={`question-${question.id || index}`}
                              value={option.id || optionIndex}
                              className="mt-1 mr-3 text-blue-600"
                              onChange={(e) => {
                                const selectedOption = option;
                                const questionId = question.id || index;
                                
                                // Update quiz answers
                                setQuizAnswers(prev => ({
                                  ...prev,
                                  [questionId]: {
                                    question: question.question,
                                    selectedOption: selectedOption,
                                    scores: selectedOption.score || {}
                                  }
                                }));
                              }}
                            />
                            <div className="flex-1">
                              <span className="font-medium text-gray-900">
                                {option.id}: {option.text}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                      
                      {question.explanation && (
                        <p className="text-sm text-blue-600 mt-3 italic">
                          💡 {question.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Results Section */}
                {Object.keys(quizAnswers).length === 10 && (
                  <div className="mt-8 bg-green-50 rounded-lg p-6 border border-green-200">
                    <h3 className="text-xl font-semibold text-green-900 mb-4">🎉 Your Results Are Ready!</h3>
                    <button 
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                      onClick={calculateQuizResults}
                    >
                      📊 View Your Personalized Results
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Results Display */}
            {quizResults && (
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-green-900 mb-4">📊 Your Personalized Diagnosis</h2>
                
                <div className="bg-white rounded-lg p-6 border border-green-200 mb-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">
                    {quizResults.category}
                  </h3>
                  <p className="text-gray-700 mb-4">{quizResults.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">🔍 Your Symptoms:</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {quizResults.symptoms?.map((symptom: string, idx: number) => (
                          <li key={idx}>• {symptom}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">📈 Success Metrics:</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {quizResults.success_metrics?.map((metric: string, idx: number) => (
                          <li key={idx}>• {metric}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-green-200 mb-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">📋 Your Action Plan</h3>
                  <p className="text-sm text-gray-600 mb-4">Timeline: {quizResults.timeline}</p>
                  
                  <div className="space-y-4">
                    {quizResults.action_steps?.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-start bg-gray-50 rounded-lg p-4">
                        <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">💡 Key Recommendations</h3>
                  <ul className="space-y-2">
                    {quizResults.recommendations?.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">•</span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-center mt-6">
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors mr-4"
                    onClick={() => {
                      const resultsText = `Diagnostic Results:\n\nCategory: ${quizResults.category}\n\nDescription: ${quizResults.description}\n\nAction Plan:\n${quizResults.action_steps?.map((step: string, idx: number) => `${idx + 1}. ${step}`).join('\n')}\n\nTimeline: ${quizResults.timeline}`;
                      navigator.clipboard.writeText(resultsText);
                      alert('Results copied to clipboard!');
                    }}
                  >
                    📋 Copy Results
                  </button>
                  
                  <button 
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                    onClick={() => {
                      setQuizAnswers({});
                      setQuizResults(null);
                    }}
                  >
                    🔄 Take Quiz Again
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'pdf':
        return (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {content.title_page?.title || 'Personalized Guide'}
              </h1>
              <p className="text-lg text-gray-600">
                {content.title_page?.subtitle || 'Your personalized PDF guide with step-by-step instructions'}
              </p>
            </div>

            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                {content.founder_intro || 'This PDF guide will help you understand and implement the strategies discussed in the quiz.'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📖 Guide Content</h2>
              <ul className="space-y-2 text-gray-800">
                <li>• Detailed {content.niche || 'Business'} strategies</li>
                <li>• Actionable next steps</li>
                <li>• Templates and resources</li>
                <li>• Common pitfalls and how to avoid them</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📖 {content.guide_content?.title || 'Your Guide'}</h2>
              <div className="space-y-4">
                {content.guide_content?.sections?.map((section: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">{section.title || `Section ${index + 1}`}</h3>
                <div className="space-y-3">
                      {section.content?.map((item: any, itemIndex: number) => (
                        <div key={itemIndex} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <h4 className="font-medium text-gray-900 mb-2">{item.title || `Sub-section ${itemIndex + 1}`}</h4>
                          <p className="text-gray-700 leading-relaxed">{item.text}</p>
                          {item.image && (
                            <img src={item.image} alt={item.title} className="mt-4 rounded-md max-w-full h-auto" />
                          )}
                          {item.list && (
                            <ul className="mt-4 space-y-2 text-gray-700">
                              {item.list.map((listItem: string, listIndex: number) => (
                                <li key={listIndex}>• {listItem}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                    </div>
                  ))}
                </div>
              </div>

            <div className="text-center">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                onClick={() => {
                  const guideText = `Personalized ${content.niche || 'Business'} Guide:\n\n${content.guide_content?.title || 'Your Guide'}\n\n${content.guide_content?.sections?.map((s: any) => `${s.title || 'Section'}:\n${s.content?.map((c: any) => `${c.title || 'Sub-section'}: ${c.text}`).join('\n')}`).join('\n')}`;
                  navigator.clipboard.writeText(guideText);
                  alert('Guide copied to clipboard!');
                }}
              >
                📋 Copy Guide
              </button>
            </div>


          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Email Capture Section */}
        {!emailAlreadySubmitted && !emailSubmitted && (
          <div className="mb-8">
            <EmailCapture
              onEmailSubmitted={handleEmailSubmitted}
            />
          </div>
        )}

        {/* Success Message */}
        {emailSubmitted && (
          <div className="mb-8">
            <p className="text-center text-green-700 font-semibold">
              {formatInfo.successMessage}
            </p>
          </div>
        )}

        {/* Interactive Content */}
        {emailSubmitted && renderInteractiveContent()}
      </div>
    </div>
  );
};

export default InteractiveDisplay; 