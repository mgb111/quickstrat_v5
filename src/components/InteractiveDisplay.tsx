import React, { useState } from 'react';
import { CampaignOutput, LeadMagnetFormat } from '../types/index';
import EmailCapture from './EmailCapture';

interface InteractiveDisplayProps {
  results: CampaignOutput;
  selectedFormat: LeadMagnetFormat;
  brandName: string;
  requirePayment?: boolean;
}

const InteractiveDisplay: React.FC<InteractiveDisplayProps> = ({ 
  results, 
  selectedFormat, 
  brandName, 
  requirePayment = false 
}) => {
  const [emailSubmitted, setEmailSubmitted] = useState(false);
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

            <div className="text-center">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                onClick={() => alert('Quiz functionality would be implemented here')}
              >
                {formatInfo.actionText}
              </button>
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

            <div className="text-center">
              <button 
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                onClick={() => alert('Action plan functionality would be implemented here')}
              >
                {formatInfo.actionText}
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

            <div className="text-center">
              <button 
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                onClick={() => alert('Benchmark report functionality would be implemented here')}
              >
                {formatInfo.actionText}
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

            <div className="text-center">
              <button 
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                onClick={() => alert('Opportunity finder functionality would be implemented here')}
              >
                {formatInfo.actionText}
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