import React, { useState } from 'react';
import { Edit3, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { ContentOutline } from '../types';
import UpgradeModal from './UpgradeModal';

interface OutlineReviewProps {
  outline: ContentOutline;
  onOutlineApproved: (finalOutline: ContentOutline) => void;
  isLoading?: boolean;
}

const OutlineReview: React.FC<OutlineReviewProps> = ({ 
  outline, 
  onOutlineApproved, 
  isLoading = false 
}) => {
  const [editableOutline, setEditableOutline] = useState<ContentOutline>(outline);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Add Razorpay Checkout redirect after payment
  React.useEffect(() => {
    // On mount, check for payment success in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setHasPaid(true);
      setShowUpgradeModal(false);
    }
  }, []);

  const handleFieldChange = (field: keyof ContentOutline, value: string | string[]) => {
    setEditableOutline(prev => ({ ...prev, [field]: value }));
  };

  const handleCorePointChange = (index: number, value: string) => {
    const newCorePoints = [...editableOutline.core_points];
    newCorePoints[index] = value;
    setEditableOutline(prev => ({ ...prev, core_points: newCorePoints }));
  };

  const handleSubmit = () => {
    if (!hasPaid) {
      setShowUpgradeModal(true);
      return;
    }
    onOutlineApproved(editableOutline);
  };

  const EditableField: React.FC<{
    field: string;
    value: string;
    placeholder: string;
    multiline?: boolean;
    maxLength?: number;
  }> = ({ field, value, placeholder, multiline = false, maxLength }) => {
    const isEditing = editingField === field;
    
    return (
      <div className="relative">
        {isEditing ? (
          <div className="space-y-2">
            {multiline ? (
              <textarea
                value={value}
                onChange={(e) => handleFieldChange(field as keyof ContentOutline, e.target.value)}
                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder={placeholder}
                maxLength={maxLength}
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => handleFieldChange(field as keyof ContentOutline, e.target.value)}
                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={placeholder}
                maxLength={maxLength}
              />
            )}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setEditingField(null)}
                className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 transition-colors"
              >
                Done
              </button>
              {maxLength && (
                <span className="text-xs text-gray-500">
                  {value.length}/{maxLength}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="group">
            <div className="flex items-start justify-between">
              <p className="text-gray-800 flex-1">{value}</p>
              <button
                onClick={() => setEditingField(field)}
                className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-gray-400 hover:text-blue-600 transition-all"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Step 2: Review & Refine Your Content Outline</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Here is a proposed outline for your lead magnet. Review and approve it before final generation.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-8 space-y-8">
          {/* Title */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Proposed Title</h3>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <EditableField
                field="title"
                value={editableOutline.title}
                placeholder="Enter your lead magnet title (8-12 words)"
                maxLength={80}
              />
            </div>
          </div>

          {/* Introduction */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Proposed Introduction</h3>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <EditableField
                field="introduction"
                value={editableOutline.introduction}
                placeholder="Enter your introduction (40-60 words)"
                multiline
                maxLength={400}
              />
            </div>
          </div>

          {/* Core Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Proposed Core Content (Bulleted Outline)</h3>
            <div className="space-y-3">
              {editableOutline.core_points.map((point, index) => (
                <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start space-x-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-semibold mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      {editingField === `core_point_${index}` ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => handleCorePointChange(index, e.target.value)}
                            className="w-full p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter core point (10-15 words)"
                            maxLength={100}
                          />
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setEditingField(null)}
                              className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200 transition-colors"
                            >
                              Done
                            </button>
                            <span className="text-xs text-gray-500">
                              {point.length}/100
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="group flex items-start justify-between">
                          <p className="text-gray-800 flex-1">{point}</p>
                          <button
                            onClick={() => setEditingField(`core_point_${index}`)}
                            className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-gray-400 hover:text-green-600 transition-all"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-3" />
                Generating Your PDF...
              </>
            ) : (
              <>
                Generate My PDF
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </button>
          <p className="text-sm text-gray-600 mt-3">
            AI will expand your outline into a complete, professional lead magnet
          </p>
        </>
        <UpgradeModal
          isOpen={showUpgradeModal && !hasPaid}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => {
            setHasPaid(true);
            setShowUpgradeModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default OutlineReview;