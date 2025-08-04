import React from 'react';
import { LeadMagnetFormat, LeadMagnetFormatOption } from '../types';
import { 
  HelpCircle, 
  Calculator, 
  Target, 
  BarChart3, 
  Search,
  Check,
  FileText
} from 'lucide-react';

interface FormatSelectionProps {
  selectedFormat: LeadMagnetFormat | null;
  onFormatSelect: (format: LeadMagnetFormat) => void;
  disabled?: boolean;
}

const formatOptions: LeadMagnetFormatOption[] = [
  {
    id: 'interactive_quiz',
    title: 'Interactive Problem Diagnosis Quiz',
    description: 'User answers 5–10 quick questions → gets a personalized problem diagnosis + next steps.',
    flow: 'User answers 5–10 quick questions → gets a personalized problem diagnosis + next steps.',
    example: '"Why aren\'t you getting more customers?" quiz for a fitness coach, "Why isn\'t your store making more sales?" quiz for an ecommerce seller.',
    whyItWorks: 'Works in any sector, adapts by changing questions and feedback language.',
    icon: 'HelpCircle',
    isInteractive: true
  },
  {
    id: 'roi_calculator',
    title: 'Instant ROI or Cost-Savings Calculator',
    description: 'User inputs numbers (current revenue, traffic, conversion rate, costs, etc.) → calculator shows potential gains if they fix certain issues.',
    flow: 'User inputs numbers (current revenue, traffic, conversion rate, costs, etc.) → calculator shows potential gains if they fix certain issues.',
    example: 'A restaurant sees "Increase bookings by 20% → +$X/month"; a SaaS company sees "Lower churn by 5% → +$X/year."',
    whyItWorks: 'Makes benefits tangible for any business type.',
    icon: 'Calculator',
    isInteractive: true
  },
  {
    id: 'action_plan',
    title: 'Quick Wins Action Plan',
    description: 'User answers niche, goal, and timeframe → tool outputs a short, visual action plan they can start today.',
    flow: 'User answers niche, goal, and timeframe → tool outputs a short, visual action plan they can start today.',
    example: '"Get 50 more leads in 30 days" → 5 steps for a real estate agent vs. 5 steps for a B2B SaaS founder.',
    whyItWorks: 'Simple, practical, and feels tailored to them.',
    icon: 'Target',
    isInteractive: true
  },
  {
    id: 'benchmark_report',
    title: 'Industry Benchmark Report',
    description: 'User inputs their metrics (sales, social followers, email list size, conversion rate) → tool compares them to average performance in their industry.',
    flow: 'User inputs their metrics (sales, social followers, email list size, conversion rate) → tool compares them to average performance in their industry.',
    example: '"Your email open rate is 7% below industry average — here\'s how to fix it."',
    whyItWorks: 'People hate feeling behind their competition — this creates urgency to act.',
    icon: 'BarChart3',
    isInteractive: true
  },
  {
    id: 'opportunity_finder',
    title: 'Opportunity Finder Blueprint',
    description: 'User answers questions or uploads a link → tool highlights missed opportunities in marketing, customer engagement, or product offering.',
    flow: 'User answers questions or uploads a link → tool highlights missed opportunities in marketing, customer engagement, or product offering.',
    example: 'A clothing store gets "You\'re missing Instagram Reels — competitors see 40% more engagement from them."',
    whyItWorks: 'Turns vague "you could improve" into specific, actionable suggestions that are easy to start.',
    icon: 'Search',
    isInteractive: true
  },
  {
    id: 'pdf',
    title: 'Traditional PDF Guide',
    description: 'Classic PDF lead magnet with comprehensive content, checklists, and actionable insights.',
    flow: 'User downloads a comprehensive PDF guide with step-by-step instructions, templates, and resources.',
    example: '"5 Proven Strategies to Double Your Revenue" PDF guide with checklists and templates.',
    whyItWorks: 'Familiar format that users can save, print, and reference later.',
    icon: 'FileText',
    isInteractive: false
  }
];

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'HelpCircle':
      return HelpCircle;
    case 'Calculator':
      return Calculator;
    case 'Target':
      return Target;
    case 'BarChart3':
      return BarChart3;
    case 'Search':
      return Search;
    case 'FileText':
      return FileText;
    default:
      return Check;
  }
};

const FormatSelection: React.FC<FormatSelectionProps> = ({ 
  selectedFormat, 
  onFormatSelect, 
  disabled = false 
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Step 1: Choose Your Lead Magnet's Core Focus
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Select the format that best matches your audience's needs and your business goals. Each format is designed to capture leads while providing immediate value.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {formatOptions.map((option) => {
            const IconComponent = getIconComponent(option.icon);
            const isSelected = selectedFormat === option.id;
            
            return (
              <div
                key={option.id}
                onClick={() => !disabled && onFormatSelect(option.id)}
                className={`
                  relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className="flex items-center mb-4">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center mr-4
                    ${isSelected ? 'bg-blue-500' : 'bg-gray-100'}
                  `}>
                    <IconComponent className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{option.title}</h3>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {option.description}
                </p>

                {/* Flow */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Flow:</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {option.flow}
                  </p>
                </div>

                {/* Example */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Example:</h4>
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    {option.example}
                  </p>
                </div>

                {/* Why it works */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Why it works:</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {option.whyItWorks}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {selectedFormat && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
              <Check className="w-4 h-4 mr-2" />
              Format selected: {formatOptions.find(f => f.id === selectedFormat)?.title}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormatSelection; 