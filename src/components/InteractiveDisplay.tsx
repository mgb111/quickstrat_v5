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
      // Simple scoring based on answer patterns
      const scores = Object.values(quizAnswers);
      const categoryScores: Record<string, number> = {};
      
      // Analyze answers to determine user category
      scores.forEach((answer, index) => {
        // This is a simplified scoring system - can be enhanced
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

      // Determine primary category
      const primaryCategory = Object.entries(categoryScores)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'balanced';

      // Find matching result from AI content
      const matchingResult = content.quiz_content.results.find((result: any) => 
        result.category.toLowerCase().includes(primaryCategory) || 
        primaryCategory.includes(result.category.toLowerCase())
      ) || content.quiz_content.results[0];

      const results = {
        totalAnswered: totalQuestions,
        primaryCategory: matchingResult?.category || primaryCategory,
        categoryScores,
        recommendations: matchingResult?.recommendations || getQuizRecommendations(primaryCategory),
        description: matchingResult?.description || '',
        action_steps: matchingResult?.action_steps || [],
        timeline: matchingResult?.timeline || '',
        success_metrics: matchingResult?.success_metrics || [],
        completionPercentage: Math.round((totalQuestions / (content.quiz_content.questions?.length || 10)) * 100)
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
        completionPercentage: Math.round((totalQuestions / 10) * 100) // Use 10 questions as default
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

  const getFormatDisplayInfo = () => {
    switch (selectedFormat) {
      case 'interactive_quiz':
        return {
          title: 'Take Quiz',
          description: 'Enter your email to access your personalized interactive quiz',
          successMessage: '✅ Email submitted! Your quiz is ready below.',
          actionText: 'Start Quiz',
          isInteractive: true
        };
      case 'roi_calculator':
        return {
          title: 'Use Calculator',
          description: 'Enter your email to access your personalized ROI calculator',
          successMessage: '✅ Email submitted! Your calculator is ready below.',
          actionText: 'Use Calculator',
          isInteractive: true
        };
      case 'action_plan':
        return {
          title: 'Get Action Plan',
          description: 'Enter your email to access your personalized action plan',
          successMessage: '✅ Email submitted! Your action plan is ready below.',
          actionText: 'View Action Plan',
          isInteractive: true
        };
      case 'benchmark_report':
        return {
          title: 'View Report',
          description: 'Enter your email to access your personalized benchmark report',
          successMessage: '✅ Email submitted! Your report is ready below.',
          actionText: 'View Report',
          isInteractive: true
        };
      case 'opportunity_finder':
        return {
          title: 'Find Opportunities',
          description: 'Enter your email to access your personalized opportunity finder',
          successMessage: '✅ Email submitted! Your opportunity finder is ready below.',
          actionText: 'Find Opportunities',
          isInteractive: true
        };
      default:
        return {
          title: 'Download PDF',
          description: 'Enter your email to access your personalized PDF guide',
          successMessage: '✅ Email submitted! Your guide is ready below.',
          actionText: 'Download PDF',
          isInteractive: false
        };
    }
  };

  const formatInfo = getFormatDisplayInfo();

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
                <li>• Your unique style personality type</li>
                <li>• Colors and patterns that work best for you</li>
                <li>• Personalized styling recommendations</li>
                <li>• Confidence-boosting style tips</li>
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
                    const resultText = `Styling Personality Quiz Results:\n\nYour Type: ${quizResults.primaryCategory.replace('-', ' ')}\n\nRecommendations:\n${quizResults.recommendations.map((r: string) => `• ${r}`).join('\n')}`;
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
                    Answer the questions above to discover your unique styling personality!
                  </p>
                </div>
              )}
            </div>


          </div>
        );

      case 'roi_calculator':
        return (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {content.title_page?.title || 'ROI Calculator'}
              </h1>
              <p className="text-lg text-gray-600">
                {content.title_page?.subtitle || 'Calculate your potential revenue gains and cost savings'}
              </p>
            </div>

            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                {content.founder_intro || 'Use this calculator to identify hidden opportunities in your business and see the potential impact of improvements.'}
              </p>
            </div>

            {/* Calculator Input Fields */}
            {content.calculator_content?.input_fields && (
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-green-900 mb-4">📊 Enter Your Data</h2>
                <div className="space-y-4">
                  {content.calculator_content.input_fields.map((field: any, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                      <label className="block text-sm font-medium text-green-900 mb-2">
                        {field.field_name}
                      </label>
                      <p className="text-sm text-green-700 mb-2">{field.description}</p>
                      <input
                        type="number"
                        step="0.01"
                        placeholder={field.placeholder}
                        value={calculatorInputs[field.field_name] || ''}
                        onChange={(e) => handleCalculatorInputChange(field.field_name, e.target.value)}
                        className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real-Time Calculation Results */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">💰 Real-Time Calculation Results</h2>
              {!calculationResults.summary?.hasResults ? (
                <div className="text-center py-8 text-blue-700">
                  <p className="text-lg">👆 Enter your data above to see instant calculations!</p>
                  <p className="text-sm mt-2">Your results will update automatically as you type.</p>
                </div>
              ) : (
                                <div className="space-y-4">
                  {/* Dynamic Results - Based on AI-Generated Categories */}
                  {Object.entries(calculationResults)
                    .filter(([key, _]) => key !== 'summary')
                    .map(([key, result]: [string, any], index) => (
                      <div key={key} className="bg-white rounded-lg p-4 border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-2">
                          📊 {result.name}
                        </h3>
                        <p className="text-sm text-blue-700 mb-3">{result.description}</p>
                        
                        {/* Show input data */}
                        {result.inputData && result.inputData.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">Your Inputs:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              {result.inputData.map(([field, value]: [string, number], idx: number) => (
                                <div key={idx} className="flex justify-between">
                                  <span className="text-blue-700">{field}:</span>
                                  <span className="font-medium text-blue-900">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Show potential result */}
                        {result.potential_result && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-blue-800 mb-1">Result:</h4>
                            <p className="text-sm text-green-700 font-medium">{result.potential_result}</p>
                          </div>
                        )}
                        
                        {/* Show details/improvements */}
                        {result.details && result.details.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-blue-800 mb-1">Details:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              {result.details.map((detail: string, idx: number) => (
                                <li key={idx}>• {detail}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Fallback for input summary */}
                        {result.totalValue && (
                          <div className="text-center">
                            <p className="text-lg font-bold text-blue-900">
                              Total: {result.totalValue}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="text-center">
              {calculationResults.summary?.hasResults ? (
                <div className="space-y-4">
                  <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Calculator Complete!</h3>
                    <p className="text-green-700">
                      Your personalized ROI analysis is ready. Scroll up to see your detailed results.
                    </p>
                  </div>
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                    onClick={() => {
                      const inputs = Object.entries(calculatorInputs)
                        .filter(([_, value]) => value > 0)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                      const summary = calculationResults.summary;
                      const reportText = `ROI Calculator Results:\n\nInputs: ${inputs}\n\nMonthly Benefit: $${summary.totalMonthlyBenefit.toLocaleString()}\nYearly Benefit: $${summary.totalYearlyBenefit.toLocaleString()}`;
                      navigator.clipboard.writeText(reportText);
                      alert('Calculator results copied to clipboard!');
                    }}
                  >
                    📋 Copy Results to Clipboard
                  </button>
                </div>
              ) : (
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Ready to Calculate?</h3>
                  <p className="text-gray-600">
                    Enter your data in the fields above to see real-time ROI calculations.
                  </p>
              </div>
            )}
            </div>


          </div>
        );

      case 'action_plan':
        return (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {content.title_page?.title || 'Action Plan'}
              </h1>
              <p className="text-lg text-gray-600">
                {content.title_page?.subtitle || 'Your personalized roadmap to success'}
              </p>
            </div>

            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                {content.founder_intro || 'Get your personalized action plan with clear steps, timelines, and success metrics.'}
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-purple-900 mb-4">📋 What You'll Get</h2>
              <ul className="space-y-2 text-purple-800">
                <li>• Personalized step-by-step plan</li>
                <li>• Clear milestones and timelines</li>
                <li>• Success metrics to track progress</li>
                <li>• Troubleshooting for common obstacles</li>
              </ul>
            </div>

            {/* Dynamic Action Plan - Based on AI Content */}
            {content.action_plan_content?.steps && (
              <div className="bg-purple-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-purple-900 mb-4">📋 {content.action_plan_content.title || 'Your Action Plan'}</h2>
                <div className="space-y-3">
                  {content.action_plan_content.steps.map((step: any, index: number) => (
                    <label key={index} className="flex items-center cursor-pointer bg-white rounded-lg p-3 border border-purple-200 hover:bg-purple-25">
                      <input
                        type="checkbox"
                        className="mr-3 text-purple-600 rounded"
                        onChange={(e) => {
                          const checkbox = e.target;
                          if (checkbox.checked) {
                            checkbox.parentElement!.classList.add('bg-purple-100');
                          } else {
                            checkbox.parentElement!.classList.remove('bg-purple-100');
                          }
                        }}
                      />
                      <span className="text-purple-800 font-medium">
                        Step {index + 1}: {step.title || step.action || step}
                      </span>
                      {step.description && (
                        <p className="text-sm text-purple-600 ml-6 mt-1">{step.description}</p>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            {/* Fallback Action Plan if no AI content */}
            {!content.action_plan_content?.steps && (
              <div className="bg-purple-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-purple-900 mb-4">📋 Your Action Plan</h2>
                <p className="text-purple-700 text-center py-8">
                  Action plan steps will be generated based on your specific goals and displayed here.
                </p>
              </div>
            )}

            <div className="text-center">
              <button 
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                onClick={() => {
                  const checkedSteps = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).length;
                  const totalSteps = 5;
                  const progress = Math.round((checkedSteps / totalSteps) * 100);
                  alert(`Action Plan Progress: ${checkedSteps}/${totalSteps} steps completed (${progress}%)`);
                }}
              >
                📊 Check Progress
              </button>
            </div>


          </div>
        );

      case 'benchmark_report':
        return (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {content.title_page?.title || 'Benchmark Report'}
              </h1>
              <p className="text-lg text-gray-600">
                {content.title_page?.subtitle || 'Compare your performance to industry standards'}
              </p>
            </div>

            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                {content.founder_intro || 'See how you stack up against industry benchmarks and identify specific areas for improvement.'}
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-orange-900 mb-4">📊 What You'll Discover</h2>
              <ul className="space-y-2 text-orange-800">
                <li>• Your performance vs industry standards</li>
                <li>• Specific gaps and opportunities</li>
                <li>• Improvement strategies with timelines</li>
                <li>• ROI impact of improvements</li>
              </ul>
            </div>

            {/* Dynamic Benchmark Comparison - Based on AI Content */}
            {content.benchmark_content?.metrics && (
              <div className="bg-orange-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-orange-900 mb-4">📊 {content.benchmark_content.title || 'Benchmark Comparison'}</h2>
                <div className="space-y-4">
                  {content.benchmark_content.metrics.map((item: any, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-orange-900">{item.metric || item.name}</h3>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          (item.yourScore || item.current) > (item.industry || item.benchmark) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {(item.yourScore || item.current) > (item.industry || item.benchmark) ? '↗ Above Average' : '↘ Below Average'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-orange-700">Your Score: </span>
                          <span className="font-bold text-orange-900">{item.yourScore || item.current}{item.unit || ''}</span>
                        </div>
                        <div>
                          <span className="text-orange-700">Benchmark: </span>
                          <span className="font-bold text-orange-900">{item.industry || item.benchmark}{item.unit || ''}</span>
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-sm text-orange-700 mt-2">{item.description}</p>
                      )}
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${(item.yourScore || item.current) > (item.industry || item.benchmark) ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(((item.yourScore || item.current) / ((item.industry || item.benchmark) * 1.5)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Fallback Benchmark if no AI content */}
            {!content.benchmark_content?.metrics && (
              <div className="bg-orange-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-orange-900 mb-4">📊 Benchmark Comparison</h2>
                <p className="text-orange-700 text-center py-8">
                  Benchmark metrics will be generated based on your specific industry and displayed here.
                </p>
              </div>
            )}

            <div className="text-center">
              <button 
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                onClick={() => {
                  const reportData = "Benchmark Report Summary:\n\n• Customer Satisfaction: 75% (Above industry 68%)\n• Response Time: 24 hours (Better than industry 48 hours)\n• Cost Efficiency: 82% (Above industry 76%)\n• Quality Rating: 4.2/5.0 (Above industry 3.8/5.0)";
                  navigator.clipboard.writeText(reportData);
                  alert('Benchmark report copied to clipboard!');
                }}
              >
                📋 Copy Report
              </button>
            </div>


          </div>
        );

      case 'opportunity_finder':
        return (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {content.title_page?.title || 'Opportunity Finder'}
              </h1>
              <p className="text-lg text-gray-600">
                {content.title_page?.subtitle || 'Discover hidden growth opportunities in your business'}
              </p>
            </div>

            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                {content.founder_intro || 'Identify untapped opportunities in your business and get strategic implementation plans.'}
              </p>
            </div>

            <div className="bg-teal-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-teal-900 mb-4">🔍 What You'll Find</h2>
              <ul className="space-y-2 text-teal-800">
                <li>• Hidden market opportunities</li>
                <li>• Service and product gaps</li>
                <li>• Competitive advantages</li>
                <li>• Strategic implementation roadmaps</li>
              </ul>
            </div>

            {/* Dynamic Opportunity Finder - Based on AI Content */}
            {content.opportunity_content?.categories && (
              <div className="bg-teal-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-teal-900 mb-4">🔍 {content.opportunity_content.title || 'Opportunity Analysis'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content.opportunity_content.categories.map((item: any, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-teal-200">
                      <h3 className="font-semibold text-teal-900 mb-2">{item.category || item.name || item.title}</h3>
                      <ul className="space-y-1 mb-3">
                        {(item.opportunities || item.items || item.details || []).map((opp: string, idx: number) => (
                          <li key={idx} className="text-sm text-teal-700 flex items-center">
                            <span className="text-teal-500 mr-2">•</span>
                            {opp}
                          </li>
                        ))}
                      </ul>
                      {(item.impact || item.effort) && (
                        <div className="flex justify-between text-xs">
                          {item.impact && (
                            <span className={`px-2 py-1 rounded ${
                              item.impact === 'Very High' || item.impact === 'High' ? 'bg-green-100 text-green-800' :
                              item.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              Impact: {item.impact}
                            </span>
                          )}
                          {item.effort && (
                            <span className={`px-2 py-1 rounded ${
                              item.effort === 'Low' ? 'bg-green-100 text-green-800' :
                              item.effort === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              Effort: {item.effort}
                            </span>
                          )}
                        </div>
                      )}
                      {item.description && (
                        <p className="text-sm text-teal-600 mt-2">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Fallback Opportunity Finder if no AI content */}
            {!content.opportunity_content?.categories && (
              <div className="bg-teal-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-teal-900 mb-4">🔍 Opportunity Analysis</h2>
                <p className="text-teal-700 text-center py-8">
                  Opportunity categories will be generated based on your specific situation and displayed here.
                </p>
              </div>
            )}

            <div className="text-center">
              <button 
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                onClick={() => {
                  const opportunityData = "Opportunity Finder Results:\n\n🎯 Market Opportunities (High Impact, Medium Effort)\n• Untapped customer segment\n• Seasonal trend leverage\n• Partnership potential\n\n⚡ Service Improvements (Medium Impact, Low Effort)\n• Process automation\n• Quality enhancement\n• Customer experience\n\n💰 Cost Optimization (High Impact, High Effort)\n• Supplier negotiations\n• Operational efficiency\n• Technology upgrades\n\n🚀 Revenue Streams (Very High Impact, Medium Effort)\n• Premium services\n• Subscription model\n• Digital products";
                  navigator.clipboard.writeText(opportunityData);
                  alert('Opportunity analysis copied to clipboard!');
                }}
              >
                📋 Copy Analysis
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