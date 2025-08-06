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

  // Handle calculator input changes
  const handleCalculatorInputChange = (fieldName: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newInputs = { ...calculatorInputs, [fieldName]: numericValue };
    setCalculatorInputs(newInputs);
    
    // Perform real-time calculations
    calculateROI(newInputs);
  };

  // ROI Calculation Logic
  const calculateROI = (inputs: Record<string, number>) => {
    const results: Record<string, any> = {};
    
    // Get common input values
    const currentRevenue = inputs['Current Revenue'] || inputs['Current Spending on Styling'] || 0;
    const currentCosts = inputs['Current Costs'] || 0;
    const conversionRate = inputs['Conversion Rate'] || inputs['Number of Styling Sessions'] || 0;
    const averageTime = inputs['Average Time Spent on Styling'] || 0;
    
    // Revenue Optimization Calculations
    if (currentRevenue > 0) {
      const optimizedRevenue = currentRevenue * 1.25; // 25% improvement
      const revenueGain = optimizedRevenue - currentRevenue;
      const monthlyGain = revenueGain;
      const yearlyGain = revenueGain * 12;
      
      results.revenueOptimization = {
        current: currentRevenue,
        optimized: optimizedRevenue,
        monthlyGain: monthlyGain,
        yearlyGain: yearlyGain,
        percentage: 25
      };
    }
    
    // Cost Reduction Calculations
    if (currentCosts > 0) {
      const optimizedCosts = currentCosts * 0.8; // 20% cost reduction
      const costSavings = currentCosts - optimizedCosts;
      const monthlySavings = costSavings;
      const yearlySavings = costSavings * 12;
      
      results.costReduction = {
        current: currentCosts,
        optimized: optimizedCosts,
        monthlySavings: monthlySavings,
        yearlySavings: yearlySavings,
        percentage: 20
      };
    }
    
    // Time Efficiency Calculations
    if (averageTime > 0) {
      const optimizedTime = averageTime * 0.7; // 30% time savings
      const timeSaved = averageTime - optimizedTime;
      const sessionsPerMonth = conversionRate || 4;
      const monthlyTimeSaved = timeSaved * sessionsPerMonth;
      
      results.timeEfficiency = {
        currentTime: averageTime,
        optimizedTime: optimizedTime,
        timeSavedPerSession: timeSaved,
        monthlyTimeSaved: monthlyTimeSaved,
        percentage: 30
      };
    }
    
    // ROI Summary
    const totalMonthlyBenefit = (results.revenueOptimization?.monthlyGain || 0) + (results.costReduction?.monthlySavings || 0);
    const totalYearlyBenefit = totalMonthlyBenefit * 12;
    
    results.summary = {
      totalMonthlyBenefit,
      totalYearlyBenefit,
      hasResults: Object.keys(inputs).length > 0 && Object.values(inputs).some(v => v > 0)
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

    // Simple scoring logic - can be customized based on quiz content
    const scores = Object.values(quizAnswers);
    const categoryScores: Record<string, number> = {};
    
    // Analyze answers to determine user category/personality
    scores.forEach((answer, index) => {
      // This is a simplified scoring system
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

    const results = {
      totalAnswered: totalQuestions,
      primaryCategory,
      categoryScores,
      recommendations: getQuizRecommendations(primaryCategory),
      completionPercentage: Math.round((totalQuestions / 5) * 100) // Assuming 5 questions
    };

    setQuizResults(results);
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

            {/* Interactive Quiz Questions */}
            <div className="bg-indigo-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-indigo-900 mb-4">📝 Quick Assessment</h2>
              <div className="space-y-4">
                {[
                  { question: "What's your primary concern when choosing styling services?", options: ["Budget and cost", "Time efficiency", "Quality and results", "Convenience"] },
                  { question: "How often do you typically update your wardrobe?", options: ["Every few months", "Seasonally", "Once a year", "Only when necessary"] },
                  { question: "What's your biggest styling challenge?", options: ["Finding time to shop", "Staying within budget", "Knowing what looks good", "Keeping up with trends"] },
                  { question: "Which best describes your lifestyle?", options: ["Fast-paced professional", "Budget-conscious", "Quality-focused", "Balanced approach"] },
                  { question: "What would make the biggest impact on your styling routine?", options: ["Saving money", "Saving time", "Better quality results", "More convenience"] }
                ].map((q, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-indigo-200">
                    <h3 className="font-medium text-indigo-900 mb-3">{index + 1}. {q.question}</h3>
                    <div className="space-y-2">
                      {q.options.map((option, optIndex) => (
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

            {/* Quiz Results */}
            {quizResults && (
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-green-900 mb-4">🎯 Your Styling Personality</h2>
                <div className="bg-white rounded-lg p-4 border border-green-200 mb-4">
                  <h3 className="font-bold text-green-900 text-lg mb-2">
                    You're: <span className="capitalize">{quizResults.primaryCategory.replace('-', ' ')}</span>
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
                  <h4 className="font-semibold text-green-900 mb-2">📋 Personalized Recommendations:</h4>
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
                  {/* Revenue Optimization */}
                  {calculationResults.revenueOptimization && (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h3 className="font-semibold text-blue-900 mb-2">📈 Revenue Optimization</h3>
                      <p className="text-sm text-blue-700 mb-3">Potential revenue gains from optimization</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-800 font-medium">Current: </span>
                          <span className="text-blue-900">${calculationResults.revenueOptimization.current.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-blue-800 font-medium">Optimized: </span>
                          <span className="text-green-600 font-bold">${calculationResults.revenueOptimization.optimized.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-blue-800 font-medium">Monthly Gain: </span>
                          <span className="text-green-600 font-bold">+${calculationResults.revenueOptimization.monthlyGain.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-blue-800 font-medium">Yearly Gain: </span>
                          <span className="text-green-600 font-bold">+${calculationResults.revenueOptimization.yearlyGain.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          {calculationResults.revenueOptimization.percentage}% improvement
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Cost Reduction */}
                  {calculationResults.costReduction && (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h3 className="font-semibold text-blue-900 mb-2">💰 Cost Reduction</h3>
                      <p className="text-sm text-blue-700 mb-3">Potential cost savings opportunities</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-800 font-medium">Current Costs: </span>
                          <span className="text-blue-900">${calculationResults.costReduction.current.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-blue-800 font-medium">Optimized Costs: </span>
                          <span className="text-green-600 font-bold">${calculationResults.costReduction.optimized.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-blue-800 font-medium">Monthly Savings: </span>
                          <span className="text-green-600 font-bold">${calculationResults.costReduction.monthlySavings.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-blue-800 font-medium">Yearly Savings: </span>
                          <span className="text-green-600 font-bold">${calculationResults.costReduction.yearlySavings.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          {calculationResults.costReduction.percentage}% cost reduction
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Time Efficiency */}
                  {calculationResults.timeEfficiency && (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h3 className="font-semibold text-blue-900 mb-2">⏱️ Time Efficiency</h3>
                      <p className="text-sm text-blue-700 mb-3">Time savings from optimization</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-800 font-medium">Current Time: </span>
                          <span className="text-blue-900">{calculationResults.timeEfficiency.currentTime} min</span>
                        </div>
                        <div>
                          <span className="text-blue-800 font-medium">Optimized Time: </span>
                          <span className="text-green-600 font-bold">{calculationResults.timeEfficiency.optimizedTime.toFixed(1)} min</span>
                        </div>
                        <div>
                          <span className="text-blue-800 font-medium">Time Saved/Session: </span>
                          <span className="text-green-600 font-bold">{calculationResults.timeEfficiency.timeSavedPerSession.toFixed(1)} min</span>
                        </div>
                        <div>
                          <span className="text-blue-800 font-medium">Monthly Time Saved: </span>
                          <span className="text-green-600 font-bold">{calculationResults.timeEfficiency.monthlyTimeSaved.toFixed(1)} min</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          {calculationResults.timeEfficiency.percentage}% time savings
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {calculationResults.summary && calculationResults.summary.totalMonthlyBenefit > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200">
                      <h3 className="font-bold text-green-900 mb-2">🎯 Total ROI Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-green-700">Total Monthly Benefit</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${calculationResults.summary.totalMonthlyBenefit.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-green-700">Total Yearly Benefit</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${calculationResults.summary.totalYearlyBenefit.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Educational Content */}
            {content.educational_content && (
              <div className="bg-purple-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-purple-900 mb-4">📚 Insights & Tips</h2>
                {content.educational_content.insights && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-purple-800 mb-2">Key Insights:</h3>
                    <ul className="text-sm text-purple-700 space-y-1">
                      {content.educational_content.insights.map((insight: string, index: number) => (
                        <li key={index}>• {insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {content.educational_content.benchmarks && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-purple-800 mb-2">Industry Benchmarks:</h3>
                    <ul className="text-sm text-purple-700 space-y-1">
                      {content.educational_content.benchmarks.map((benchmark: string, index: number) => (
                        <li key={index}>• {benchmark}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {content.educational_content.case_studies && (
                  <div>
                    <h3 className="font-semibold text-purple-800 mb-2">Case Studies:</h3>
                    <ul className="text-sm text-purple-700 space-y-1">
                      {content.educational_content.case_studies.map((caseStudy: string, index: number) => (
                        <li key={index}>• {caseStudy}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Interactive Elements */}
            {content.interactive_elements && (
              <div className="bg-orange-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-orange-900 mb-4">🚀 Next Steps</h2>
                {content.interactive_elements.next_steps && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-orange-800 mb-2">Recommended Actions:</h3>
                    <ul className="text-sm text-orange-700 space-y-1">
                      {content.interactive_elements.next_steps.map((step: string, index: number) => (
                        <li key={index}>• {step}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {content.interactive_elements.action_items && (
                  <div>
                    <h3 className="font-semibold text-orange-800 mb-2">Action Items:</h3>
                    <ul className="text-sm text-orange-700 space-y-1">
                      {content.interactive_elements.action_items.map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

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

            {/* Interactive Action Plan */}
            <div className="bg-purple-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-purple-900 mb-4">📋 Your Action Plan Checklist</h2>
              <div className="space-y-3">
                {[
                  "Assess your current situation and goals",
                  "Identify your top 3 priorities for improvement",
                  "Create a timeline with specific milestones",
                  "Implement the first action step within 24 hours",
                  "Track your progress weekly and adjust as needed"
                ].map((step, index) => (
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
                    <span className="text-purple-800 font-medium">Step {index + 1}: {step}</span>
                  </label>
                ))}
              </div>
            </div>

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

            {/* Interactive Benchmark Comparison */}
            <div className="bg-orange-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-orange-900 mb-4">📊 Industry Benchmark Comparison</h2>
              <div className="space-y-4">
                {[
                  { metric: "Customer Satisfaction", yourScore: 75, industry: 68, unit: "%" },
                  { metric: "Response Time", yourScore: 24, industry: 48, unit: " hours" },
                  { metric: "Cost Efficiency", yourScore: 82, industry: 76, unit: "%" },
                  { metric: "Quality Rating", yourScore: 4.2, industry: 3.8, unit: "/5.0" }
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-orange-900">{item.metric}</h3>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        item.yourScore > item.industry ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.yourScore > item.industry ? '↗ Above Average' : '↘ Below Average'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-orange-700">Your Score: </span>
                        <span className="font-bold text-orange-900">{item.yourScore}{item.unit}</span>
                      </div>
                      <div>
                        <span className="text-orange-700">Industry Average: </span>
                        <span className="font-bold text-orange-900">{item.industry}{item.unit}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.yourScore > item.industry ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min((item.yourScore / (item.industry * 1.5)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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

            {/* Interactive Opportunity Finder */}
            <div className="bg-teal-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-teal-900 mb-4">🔍 Opportunity Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { 
                    category: "Market Opportunities", 
                    opportunities: ["Untapped customer segment", "Seasonal trend leverage", "Partnership potential"],
                    impact: "High",
                    effort: "Medium"
                  },
                  { 
                    category: "Service Improvements", 
                    opportunities: ["Process automation", "Quality enhancement", "Customer experience"],
                    impact: "Medium",
                    effort: "Low"
                  },
                  { 
                    category: "Cost Optimization", 
                    opportunities: ["Supplier negotiations", "Operational efficiency", "Technology upgrades"],
                    impact: "High",
                    effort: "High"
                  },
                  { 
                    category: "Revenue Streams", 
                    opportunities: ["Premium services", "Subscription model", "Digital products"],
                    impact: "Very High",
                    effort: "Medium"
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-teal-200">
                    <h3 className="font-semibold text-teal-900 mb-2">{item.category}</h3>
                    <ul className="space-y-1 mb-3">
                      {item.opportunities.map((opp, idx) => (
                        <li key={idx} className="text-sm text-teal-700 flex items-center">
                          <span className="text-teal-500 mr-2">•</span>
                          {opp}
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between text-xs">
                      <span className={`px-2 py-1 rounded ${
                        item.impact === 'Very High' ? 'bg-green-100 text-green-800' :
                        item.impact === 'High' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        Impact: {item.impact}
                      </span>
                      <span className={`px-2 py-1 rounded ${
                        item.effort === 'Low' ? 'bg-green-100 text-green-800' :
                        item.effort === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Effort: {item.effort}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
        {!emailSubmitted && (
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