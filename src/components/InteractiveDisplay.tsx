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
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
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
    
    // Perform real-time calculations
    calculateResults(newInputs);
  };

  // Generic Calculation Logic - works with any calculator content
  const calculateResults = (inputs: Record<string, number>) => {
    const results: Record<string, any> = {};
    
    // Get all input values that have been entered
    const inputEntries = Object.entries(inputs).filter(([_, value]) => value > 0);
    
    if (inputEntries.length === 0) {
      results.summary = { hasResults: false };
      setCalculationResults(results);
      return;
    }
    
    // Use the AI-generated calculation categories if available
    if (content.calculator_content?.calculation_categories) {
      content.calculator_content.calculation_categories.forEach((category: any, index: number) => {
        const categoryKey = `category_${index}`;
        
        results[categoryKey] = {
          name: category.category_name || `Category ${index + 1}`,
          description: category.description || '',
          potential_result: category.potential_savings || category.potential_gains || 'Result calculated from your inputs',
          details: category.savings || category.improvements || [],
          inputData: inputEntries
        };
      });
    } else {
      // Fallback: Show input summary
      const totalValue = inputEntries.reduce((sum, [_, value]) => sum + value, 0);
      
      results.inputSummary = {
        name: 'Input Summary',
        description: 'Your entered values',
        totalValue: totalValue,
        inputs: inputEntries.map(([key, value]) => ({ field: key, value: value }))
      };
    }
    
    results.summary = {
      hasResults: true,
      totalInputs: inputEntries.length
    };
    
    setCalculationResults(results);
  };

  // Quiz Logic
  const handleQuizAnswer = (questionIndex: number, answer: string) => {
    const newAnswers = { ...quizAnswers, [questionIndex]: answer };
    setQuizAnswers(newAnswers);
  };

  const calculateQuizResults = () => {
    const totalQuestions = Object.keys(quizAnswers).length;
    if (totalQuestions === 0) return;

    // Use AI-generated quiz content if available
    if (content.quiz_content?.results) {
      const totalQuizQuestions = content.quiz_content.questions?.length || 10;
      
      // Create a proper scoring system based on answer patterns
      const answerPatterns: Record<string, number> = {};
      
      // Analyze each answer and create patterns
      Object.entries(quizAnswers).forEach(([questionIndex, answer]) => {
        const answerLower = answer.toLowerCase();
        
        // Score based on answer content patterns
        if (answerLower.includes('low') || answerLower.includes('poor') || answerLower.includes('not confident')) {
          answerPatterns['beginner'] = (answerPatterns['beginner'] || 0) + 1;
        }
        if (answerLower.includes('medium') || answerLower.includes('somewhat') || answerLower.includes('neutral')) {
          answerPatterns['intermediate'] = (answerPatterns['intermediate'] || 0) + 1;
        }
        if (answerLower.includes('high') || answerLower.includes('very') || answerLower.includes('expert')) {
          answerPatterns['advanced'] = (answerPatterns['advanced'] || 0) + 1;
        }
        if (answerLower.includes('budget') || answerLower.includes('cost') || answerLower.includes('limited')) {
          answerPatterns['budget-conscious'] = (answerPatterns['budget-conscious'] || 0) + 1;
        }
        if (answerLower.includes('time') || answerLower.includes('quick') || answerLower.includes('immediately')) {
          answerPatterns['time-focused'] = (answerPatterns['time-focused'] || 0) + 1;
        }
        if (answerLower.includes('quality') || answerLower.includes('premium') || answerLower.includes('expert')) {
          answerPatterns['quality-focused'] = (answerPatterns['quality-focused'] || 0) + 1;
        }
        if (answerLower.includes('seo') || answerLower.includes('content') || answerLower.includes('organic')) {
          answerPatterns['organic-focused'] = (answerPatterns['organic-focused'] || 0) + 1;
        }
        if (answerLower.includes('ads') || answerLower.includes('paid') || answerLower.includes('social')) {
          answerPatterns['paid-focused'] = (answerPatterns['paid-focused'] || 0) + 1;
        }
      });

      // Determine primary category based on highest score
      const primaryCategory = Object.entries(answerPatterns)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'balanced';

      // Find the best matching result from AI content
      let matchingResult = content.quiz_content.results[0]; // Default to first result
      
      // Try to find a result that matches the primary category
      for (const result of content.quiz_content.results) {
        const resultCategory = result.category.toLowerCase();
        if (resultCategory.includes(primaryCategory) || primaryCategory.includes(resultCategory)) {
          matchingResult = result;
          break;
        }
      }

      // If no direct match, use the result that best fits the answer patterns
      if (!matchingResult || matchingResult === content.quiz_content.results[0]) {
        // Find result based on answer patterns
        if (answerPatterns['beginner'] > answerPatterns['advanced']) {
          matchingResult = content.quiz_content.results.find((r: any) => 
            r.category.toLowerCase().includes('beginner') || 
            r.category.toLowerCase().includes('novice') ||
            r.category.toLowerCase().includes('basic')
          ) || content.quiz_content.results[0];
        } else if (answerPatterns['advanced'] > answerPatterns['beginner']) {
          matchingResult = content.quiz_content.results.find((r: any) => 
            r.category.toLowerCase().includes('advanced') || 
            r.category.toLowerCase().includes('expert') ||
            r.category.toLowerCase().includes('professional')
          ) || content.quiz_content.results[0];
        }
      }

      const results = {
        totalAnswered: totalQuestions,
        primaryCategory: matchingResult?.category || primaryCategory,
        categoryScores: answerPatterns,
        recommendations: matchingResult?.recommendations || [],
        description: matchingResult?.description || '',
        action_steps: matchingResult?.action_steps || [],
        timeline: matchingResult?.timeline || '',
        success_metrics: matchingResult?.success_metrics || [],
        completionPercentage: Math.min(100, Math.round((totalQuestions / totalQuizQuestions) * 100))
      };

      setQuizResults(results);
    } else {
      // Fallback to original logic
      const scores = Object.values(quizAnswers);
      const categoryScores: Record<string, number> = {};
      
      scores.forEach((answer, index) => {
        if (answer.toLowerCase().includes('budget') || answer.toLowerCase().includes('cost')) {
          categoryScores['budget-conscious'] = (categoryScores['budget-conscious'] || 0) + 1;
        }
        if (answer.toLowerCase().includes('time') || answer.toLowerCase().includes('quick')) {
          categoryScores['time-focused'] = (categoryScores['time-focused'] || 0) + 1;
        }
        if (answer.toLowerCase().includes('quality') || answer.toLowerCase().includes('premium')) {
          categoryScores['quality-focused'] = (categoryScores['quality-focused'] || 0) + 1;
        }
      });

      const primaryCategory = Object.entries(categoryScores)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'balanced';

      const results = {
        totalAnswered: totalQuestions,
        primaryCategory,
        categoryScores,
        recommendations: getQuizRecommendations(primaryCategory),
        completionPercentage: Math.min(100, Math.round((totalQuestions / 10) * 100))
      };

      setQuizResults(results);
    }
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
    if (!results.pdf_content) return null;

    // Parse content if it's a string
    const content = typeof results.pdf_content === 'string' 
      ? JSON.parse(results.pdf_content) 
      : results.pdf_content;
    
    switch (selectedFormat) {
      case 'interactive_quiz':
        return (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {content.title_page?.title || 'Style Personality Quiz'}
              </h1>
              <p className="text-lg text-gray-600">
                {content.title_page?.subtitle || 'Discover your unique style personality'}
              </p>
            </div>

            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                {content.founder_intro || 'Take this quiz to discover your unique style personality and get personalized recommendations.'}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">🎯 What You'll Discover</h2>
              <ul className="space-y-2 text-blue-800">
                <li>• Your unique {content.niche?.toLowerCase() || 'business'} personality type</li>
                <li>• {content.niche || 'Business'} strategies that work best for you</li>
                <li>• Personalized {content.niche?.toLowerCase() || 'business'} recommendations</li>
                <li>• Confidence-boosting {content.niche?.toLowerCase() || 'business'} tips</li>
              </ul>
            </div>

            {/* Dynamic Quiz Questions - Based on AI Content */}
            {content.quiz_content?.questions && (
              <div className="bg-indigo-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-indigo-900 mb-4">📝 {content.quiz_content.title || 'Assessment'}</h2>
                <div className="space-y-4">
                  {content.quiz_content.questions.map((q: any, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-indigo-200">
                      <h3 className="font-medium text-indigo-900 mb-3">{index + 1}. {q.question || q.text}</h3>
                      <div className="space-y-2">
                        {(q.options || q.answers || []).map((option: string, optIndex: number) => (
                          <label key={optIndex} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={option}
                              checked={quizAnswers[index] === option}
                              onChange={(e) => {
                                handleQuizAnswer(index, e.target.value);
                                setTimeout(calculateQuizResults, 100);
                              }}
                              className="mr-3 text-indigo-600"
                            />
                            <span className="text-indigo-800">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Fallback Quiz if no AI content */}
            {!content.quiz_content?.questions && (
              <div className="bg-indigo-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-indigo-900 mb-4">📝 Quick Assessment</h2>
                <p className="text-indigo-700 text-center py-8">
                  Quiz questions will be generated based on your specific topic and displayed here.
                </p>
              </div>
            )}

            {/* Dynamic Quiz Results */}
            {quizResults && (
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-green-900 mb-4">🎯 Your Results</h2>
                <div className="bg-white rounded-lg p-4 border border-green-200 mb-4">
                  <h3 className="font-bold text-green-900 text-lg mb-2">
                    Result: <span className="capitalize">{quizResults.primaryCategory.replace('-', ' ')}</span>
                  </h3>
                  <div className="mb-3">
                    <div className="bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${quizResults.completionPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-green-700 mt-1">{quizResults.completionPercentage}% Complete</p>
                  </div>
                  {quizResults.description && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-green-800 leading-relaxed">{quizResults.description}</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">📋 Recommendations:</h4>
                  <ul className="space-y-2">
                    {quizResults.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-green-800 flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="text-center">
              {quizResults ? (
              <button 
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                  onClick={() => {
                    const resultText = `${content.niche || 'Business'} Quiz Results:\n\nYour Type: ${quizResults.primaryCategory.replace('-', ' ')}\n\n${quizResults.description ? `Description: ${quizResults.description}\n\n` : ''}Recommendations:\n${quizResults.recommendations.map((r: string) => `• ${r}`).join('\n')}`;
                    navigator.clipboard.writeText(resultText);
                    alert('Quiz results copied to clipboard!');
                  }}
                >
                  📋 Copy Results
              </button>
              ) : (
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Ready to Start?</h3>
                  <p className="text-blue-700">
                    Answer the questions above to discover your unique {content.niche?.toLowerCase() || 'business'} approach!
                  </p>
                </div>
              )}
            </div>


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