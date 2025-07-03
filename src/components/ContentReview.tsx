import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';
import { ContentBlock } from '../types';

interface ContentReviewProps {
  expandedBlocks: ContentBlock[];
  onApprovalComplete: (approvedBlocks: ContentBlock[]) => void;
  onRegenerateBlock: (block: ContentBlock) => void;
  isRegenerating?: string;
  isLoading?: boolean;
}

const ContentReview: React.FC<ContentReviewProps> = ({ 
  expandedBlocks, 
  onApprovalComplete, 
  onRegenerateBlock,
  isRegenerating,
  isLoading = false
}) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>(expandedBlocks);

  const handleApproval = (blockId: string, approved: boolean) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, approved } : block
    ));
  };

  const handleRegenerate = (block: ContentBlock) => {
    onRegenerateBlock(block);
  };

  const approvedCount = blocks.filter(b => b.approved).length;
  const canProceed = approvedCount > 0;

  const handleProceed = () => {
    if (canProceed) {
      onApprovalComplete(blocks.filter(b => b.approved));
    }
  };

  // Update blocks when expandedBlocks prop changes (after regeneration)
  React.useEffect(() => {
    setBlocks(expandedBlocks);
  }, [expandedBlocks]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Review Your Content</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Review the AI-expanded content for each section. Approve the ones you like or regenerate for different approaches.
        </p>
        <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-50 text-green-800 rounded-full text-sm font-medium">
          {approvedCount} of {blocks.length} sections approved
        </div>
      </div>

      <div className="space-y-6">
        {blocks.map((block, index) => {
          const isApproved = block.approved;
          const isRegeneratingThis = isRegenerating === block.id;
          
          return (
            <div 
              key={block.id}
              className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 ${
                isApproved ? 'border-green-500' : 'border-gray-200'
              }`}
            >
              <div className={`px-6 py-4 border-b ${
                isApproved ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{block.title}</h3>
                        <p className="text-sm text-gray-600">{block.category.replace('-', ' ')}</p>
                      </div>
                    </div>
                    {block.userNote && (
                      <div className="mt-2 ml-11">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Your note: {block.userNote}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isApproved && (
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approved
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="prose prose-sm max-w-none">
                  {isRegeneratingThis ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
                        <p className="text-gray-600">Regenerating content...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {block.expandedContent}
                    </div>
                  )}
                </div>
                
                {!isRegeneratingThis && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleRegenerate(block)}
                      className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </button>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleApproval(block.id, false)}
                        className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                          isApproved === false 
                            ? 'bg-red-100 text-red-800' 
                            : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Reject
                      </button>
                      
                      <button
                        onClick={() => handleApproval(block.id, true)}
                        className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                          isApproved === true 
                            ? 'bg-green-100 text-green-800' 
                            : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                        }`}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Approve
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <button
          onClick={handleProceed}
          disabled={!canProceed || isLoading}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full" />
              Generating Campaign...
            </>
          ) : (
            <>
              Generate Final Campaign
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </button>
        
        {approvedCount > 0 && (
          <p className="text-sm text-gray-600 mt-3">
            Creating your complete lead magnet with {approvedCount} approved sections
          </p>
        )}
      </div>
    </div>
  );
};

export default ContentReview;