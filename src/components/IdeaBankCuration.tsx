import React, { useState } from 'react';
import { CheckCircle, Circle, Edit3, Sparkles, ArrowRight } from 'lucide-react';
import { IdeaBank, ContentBlock, ContentCategory } from '../types';

interface IdeaBankCurationProps {
  ideaBank: IdeaBank;
  onSelectionComplete: (selectedBlocks: ContentBlock[]) => void;
  isLoading?: boolean;
}

const IdeaBankCuration: React.FC<IdeaBankCurationProps> = ({ 
  ideaBank, 
  onSelectionComplete, 
  isLoading = false 
}) => {
  const [categories, setCategories] = useState<ContentCategory[]>(ideaBank.categories);
  const [expandedNotes, setExpandedNotes] = useState<{ [key: string]: boolean }>({});

  const handleBlockToggle = (categoryId: string, blockId: string) => {
    setCategories(prev => prev.map(category => {
      if (category.id !== categoryId) return category;
      
      const selectedCount = category.blocks.filter(b => b.selected).length;
      const block = category.blocks.find(b => b.id === blockId);
      
      // If trying to select and already at max, don't allow
      if (!block?.selected && selectedCount >= (category.maxSelections || Infinity)) {
        return category;
      }
      
      return {
        ...category,
        blocks: category.blocks.map(block => 
          block.id === blockId 
            ? { ...block, selected: !block.selected, userNote: block.selected ? '' : block.userNote }
            : block
        )
      };
    }));
  };

  const handleNoteChange = (categoryId: string, blockId: string, note: string) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId 
        ? {
            ...category,
            blocks: category.blocks.map(block => 
              block.id === blockId ? { ...block, userNote: note } : block
            )
          }
        : category
    ));
  };

  const toggleNoteExpansion = (blockId: string) => {
    setExpandedNotes(prev => ({ ...prev, [blockId]: !prev[blockId] }));
  };

  const getSelectedBlocks = () => {
    return categories.flatMap(category => 
      category.blocks.filter(block => block.selected)
    );
  };

  const selectedCount = getSelectedBlocks().length;
  const canProceed = selectedCount > 0;

  const handleProceed = () => {
    if (canProceed) {
      onSelectionComplete(getSelectedBlocks());
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Curate Your Content</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the ideas that resonate with your expertise. You can add context notes to guide the AI's expansion.
        </p>
        <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 text-blue-800 rounded-full text-sm font-medium">
          {selectedCount} ideas selected
        </div>
      </div>

      <div className="space-y-8">
        {categories.map((category) => {
          const selectedInCategory = category.blocks.filter(b => b.selected).length;
          const maxSelections = category.maxSelections || Infinity;
          
          return (
            <div key={category.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700">
                      {selectedInCategory} / {maxSelections === Infinity ? '∞' : maxSelections} selected
                    </div>
                    {maxSelections !== Infinity && (
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(selectedInCategory / maxSelections) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.blocks.map((block) => {
                    const isSelected = block.selected;
                    const canSelect = selectedInCategory < maxSelections || isSelected;
                    
                    return (
                      <div 
                        key={block.id}
                        className={`border-2 rounded-xl p-4 transition-all duration-200 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : canSelect 
                              ? 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50' 
                              : 'border-gray-100 bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <button
                            onClick={() => handleBlockToggle(category.id, block.id)}
                            disabled={!canSelect}
                            className={`mt-1 transition-colors ${
                              canSelect ? 'hover:scale-110' : 'cursor-not-allowed'
                            }`}
                          >
                            {isSelected ? (
                              <CheckCircle className="h-6 w-6 text-blue-600" />
                            ) : (
                              <Circle className={`h-6 w-6 ${canSelect ? 'text-gray-400' : 'text-gray-300'}`} />
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-sm ${
                              isSelected ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {block.title}
                            </h4>
                            <p className={`text-xs mt-1 ${
                              isSelected ? 'text-blue-700' : 'text-gray-600'
                            }`}>
                              {block.description}
                            </p>
                            
                            {isSelected && (
                              <div className="mt-3">
                                <button
                                  onClick={() => toggleNoteExpansion(block.id)}
                                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  <Edit3 className="h-3 w-3 mr-1" />
                                  Add context note
                                </button>
                                
                                {expandedNotes[block.id] && (
                                  <div className="mt-2">
                                    <textarea
                                      value={block.userNote || ''}
                                      onChange={(e) => handleNoteChange(category.id, block.id, e.target.value)}
                                      placeholder="Add any specific context, examples, or focus areas..."
                                      className="w-full px-3 py-2 text-xs border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                      rows={2}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <button
          onClick={handleProceed}
          disabled={!canProceed || isLoading}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full" />
              Expanding Content...
            </>
          ) : (
            <>
              Expand Selected Ideas
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </button>
        
        {selectedCount > 0 && (
          <p className="text-sm text-gray-600 mt-3">
            AI will expand your {selectedCount} selected ideas into detailed content sections
          </p>
        )}
      </div>
    </div>
  );
};

export default IdeaBankCuration;