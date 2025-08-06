import React, { useState, useEffect } from 'react';

import { Campaign, Lead, LeadMagnetFormat } from '../types';
import { CampaignService } from '../lib/campaignService';
import PDFGenerator from './PDFGenerator';
import InteractiveDisplay from './InteractiveDisplay';
import { supabase } from '../lib/supabase';
import Modal from 'react-modal';


interface DashboardProps {
  onNewCampaign: () => void;
  onResumeDraft?: (draft: Campaign) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNewCampaign, onResumeDraft }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [viewPdfCampaign, setViewPdfCampaign] = useState<Campaign | null>(null);
  const [editPdfCampaign, setEditPdfCampaign] = useState<Campaign | null>(null);
  const [editJson, setEditJson] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false); // New state for payment success modal

  // Function to detect format from content structure
  const detectFormatFromContent = (content: any): LeadMagnetFormat => {
    if (!content || typeof content === 'string') {
      try {
        content = typeof content === 'string' ? JSON.parse(content) : content;
      } catch {
        return 'pdf'; // Default fallback
      }
    }

    // Check for interactive format indicators
    if (content.calculator_content) return 'roi_calculator';
    if (content.quiz_content) return 'interactive_quiz';
    if (content.action_plan_content) return 'action_plan';
    if (content.benchmark_content) return 'benchmark_report';
    if (content.opportunity_content) return 'opportunity_finder';
    
    // Check interactive_content field
    if (content.interactive_content?.format) return content.interactive_content.format;
    
    // Check title for format indicators
    const title = content.title_page?.title || content.title || '';
    if (title.includes('Calculator') || title.includes('ROI Calculator')) return 'roi_calculator';
    if (title.includes('Quiz') || title.includes('Interactive Quiz')) return 'interactive_quiz';
    if (title.includes('Action Plan')) return 'action_plan';
    if (title.includes('Benchmark Report')) return 'benchmark_report';
    if (title.includes('Opportunity Finder')) return 'opportunity_finder';

    return 'pdf'; // Default fallback
  };


  useEffect(() => {
    loadCampaigns();
    // Check for payment=success in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setShowPaymentSuccess(true);
      // Remove the param from the URL
      params.delete('payment');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      loadLeads(selectedCampaign.id);
      loadStats(selectedCampaign.id);
    }
  }, [selectedCampaign]);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const campaignsData = await CampaignService.getCampaigns();
      setCampaigns(campaignsData);
      if (campaignsData.length > 0) {
        setSelectedCampaign(campaignsData[0]);
      }
    } catch {
      setError('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  // Separate drafts and completed campaigns
  const draftCampaigns = campaigns.filter(c => !c.lead_magnet_content);
  const completedCampaigns = campaigns.filter(c => c.lead_magnet_content);

  const loadLeads = async (campaignId: string) => {
    try {
      setIsLoadingLeads(true);
      const leadsData = await CampaignService.getLeads(campaignId);
      setLeads(leadsData);
    } catch {
      setError('Failed to load leads');
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const loadStats = async (campaignId: string) => {
    try {
      setIsLoadingStats(true);
      const statsData = await CampaignService.getCampaignStats(campaignId);
      setStats(statsData);
    } catch (err: any) {
      setError(
        err?.message?.includes('permission denied')
          ? 'Permission denied: You do not have access to this campaign’s statistics. Please check your account or contact support.'
          : 'Failed to load statistics: ' + (err?.message || 'Unknown error')
      );
      console.error('Failed to load statistics:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const copyLandingPageUrl = async (slug: string) => {
    const url = `${window.location.origin}/landing/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const exportLeads = async () => {
    if (!selectedCampaign) return;

    try {
      const csvContent = [
        'Email,Captured At',
        ...leads.map(lead => `${lead.email},${lead.captured_at}`)
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedCampaign.name}-leads.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export leads');
    }
  };

  const handleEditClick = (campaign: Campaign) => {
    setEditPdfCampaign(campaign);
    setEditError(null);
    setEditJson(
      typeof campaign.lead_magnet_content === 'string'
        ? campaign.lead_magnet_content
        : JSON.stringify(campaign.lead_magnet_content, null, 2)
    );
  };

  const handleEditSave = async () => {
    setIsSaving(true);
    setEditError(null);
    let parsed;
    try {
      parsed = JSON.parse(editJson);
    } catch (e) {
      setEditError('Invalid JSON');
      setIsSaving(false);
      return;
    }
    const { error } = await supabase
      .from('campaigns')
      .update({ lead_magnet_content: parsed })
      .eq('id', editPdfCampaign?.id);
    if (error) {
      setEditError('Failed to save: ' + error.message);
    } else {
      setEditPdfCampaign(null);
      setEditJson('');
      loadCampaigns();
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-black mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Navigation or tab bar would be here if present */}
      {draftCampaigns.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Draft Campaigns</h3>
          <ul className="divide-y divide-gray-200 bg-yellow-50 rounded-lg p-4">
            {draftCampaigns.map(campaign => (
              <li key={campaign.id} className="py-3 flex items-center justify-between">
                <span className="font-medium text-yellow-800">{campaign.name}</span>
                <button
                  className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold"
                  onClick={() => onResumeDraft && onResumeDraft(campaign)}
                >
                  Resume
                </button>
                <span className="text-xs text-yellow-600">Draft</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">Completed Campaigns</h3>
      {completedCampaigns.length === 0 ? (
        <div className="text-gray-500">No completed campaigns yet.</div>
      ) : (
        <ul className="divide-y divide-gray-200 bg-white rounded-lg p-4">
          {completedCampaigns.map(campaign => (
            <li key={campaign.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1 min-w-0">
                <button
                  className="font-medium text-gray-700 hover:underline focus:outline-none text-lg"
                  onClick={() => setViewPdfCampaign(campaign)}
                  title="View PDF"
                >
                  {campaign.name}
                </button>
                <div className="text-xs text-gray-700 mt-1">Completed</div>
                <div className="flex flex-wrap gap-2 mt-2">
                                    <button
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-semibold"
                    onClick={() => setViewPdfCampaign(campaign)}
                  >
                    {(() => {
                      const format = detectFormatFromContent(campaign.lead_magnet_content);
                      switch (format) {
                        case 'interactive_quiz': return 'Take Quiz';
                        case 'roi_calculator': return 'Use Calculator';
                        case 'action_plan': return 'Get Action Plan';
                        case 'benchmark_report': return 'View Report';
                        case 'opportunity_finder': return 'Find Opportunities';
                        default: return 'View PDF';
                      }
                    })()}
                  </button>
                  <button
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 text-xs font-semibold"
                    onClick={() => handleEditClick(campaign)}
                  >
                    {(() => {
                      const format = detectFormatFromContent(campaign.lead_magnet_content);
                      switch (format) {
                        case 'interactive_quiz': return 'Edit Quiz';
                        case 'roi_calculator': return 'Edit Calculator';
                        case 'action_plan': return 'Edit Action Plan';
                        case 'benchmark_report': return 'Edit Report';
                        case 'opportunity_finder': return 'Edit Opportunities';
                        default: return 'Edit PDF';
                      }
                    })()}
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-xs font-semibold"
                    onClick={() => window.open(`${window.location.origin}/landing/${campaign.landing_page_slug}`, '_blank')}
                  >
                    Landing Page
                  </button>
                  <button
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-xs font-semibold"
                    onClick={() => copyLandingPageUrl(campaign.landing_page_slug)}
                  >
                    Copy Link
                  </button>
                  <button
                                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-semibold"
                    onClick={exportLeads}
                  >
                    Export Leads
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Leads: {leads.length} {isLoadingLeads && <span className="ml-2 text-gray-700">Loading...</span>}
                  {stats && (
                    <>
                      {' '}| Emails: {stats.totalEmails ?? 0}
                    </>
                  )}
                  {isLoadingStats && <span className="ml-2 text-gray-700">Loading stats...</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {/* View PDF Modal */}
      <Modal
        isOpen={!!viewPdfCampaign}
        onRequestClose={() => setViewPdfCampaign(null)}
        contentLabel={(() => {
          if (viewPdfCampaign?.lead_magnet_content) {
            const format = detectFormatFromContent(viewPdfCampaign.lead_magnet_content);
            switch (format) {
              case 'interactive_quiz': return 'Take Quiz';
              case 'roi_calculator': return 'Use Calculator';
              case 'action_plan': return 'Get Action Plan';
              case 'benchmark_report': return 'View Report';
              case 'opportunity_finder': return 'Find Opportunities';
              default: return 'View PDF';
            }
          }
          return 'View PDF';
        })()}
        ariaHideApp={false}
        style={{ content: { maxWidth: 900, margin: 'auto', height: '90vh', overflow: 'auto' } }}
      >
                        <button className="mb-4 text-black" onClick={() => setViewPdfCampaign(null)}>Close</button>
        {viewPdfCampaign && (() => {
          const detectedFormat = detectFormatFromContent(viewPdfCampaign.lead_magnet_content);
          const brandName = viewPdfCampaign.name?.split(' - ')[0] || '';
          
          console.log('🎯 Dashboard Modal: detectedFormat =', detectedFormat);
          
          // Show InteractiveDisplay for interactive formats
          if (detectedFormat !== 'pdf') {
            return (
                                  <InteractiveDisplay
                      results={{
                        pdf_content: viewPdfCampaign.lead_magnet_content ?? '',
                        landing_page: { headline: '', subheadline: '', benefit_bullets: [], cta_button_text: '' },
                        social_posts: { linkedin: '', twitter: '', instagram: '', reddit: '' }
                      }}
                      selectedFormat={detectedFormat}
                      brandName={brandName}
                      requirePayment={true}
                      emailAlreadySubmitted={false}
                    />
            );
          }
          
          // Show PDFGenerator for PDF format
          return (
            <PDFGenerator
              data={typeof viewPdfCampaign.lead_magnet_content === 'string'
                ? JSON.parse(viewPdfCampaign.lead_magnet_content)
                : viewPdfCampaign.lead_magnet_content}
              campaignId={''}
              requirePayment={true}
              selectedFormat={detectedFormat}
            />
          );
        })()}
      </Modal>
      {/* Edit PDF Modal */}
      <Modal
        isOpen={!!editPdfCampaign}
        onRequestClose={() => setEditPdfCampaign(null)}
        contentLabel="Edit PDF"
        ariaHideApp={false}
        style={{ content: { maxWidth: 900, margin: 'auto', height: '90vh', overflow: 'auto' } }}
      >
                        <button className="mb-4 text-black" onClick={() => setEditPdfCampaign(null)}>Close</button>
        <h2 className="text-lg font-bold mb-2">Edit PDF</h2>
        {editPdfCampaign && (
          <PDFEditor
            value={typeof editPdfCampaign.lead_magnet_content === 'string' ? JSON.parse(editPdfCampaign.lead_magnet_content) : editPdfCampaign.lead_magnet_content}
            onChange={v => setEditJson(JSON.stringify(v))}
          />
        )}
                    {editError && <div className="text-black my-2">{editError}</div>}
        <button
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          onClick={handleEditSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <div className="mt-8">
          <h3 className="font-bold mb-2">Live PDF Preview</h3>
          {editJson && (
            <PDFGenerator data={JSON.parse(editJson)} campaignId={''} />
          )}
        </div>
      </Modal>
      {/* Payment Success Modal */}
      <Modal
        isOpen={showPaymentSuccess}
        onRequestClose={() => setShowPaymentSuccess(false)}
        contentLabel="Payment Success"
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
      >
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Payment Successful!</h2>
          <p className="mb-4 text-lg">Your premium features are now unlocked. Enjoy unlimited access!</p>
          <button
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
            onClick={() => setShowPaymentSuccess(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

// PDFEditor component (scaffolded for inline use)
function PDFEditor({ value, onChange }: { value: any, onChange: (v: any) => void }) {
  const [local, setLocal] = useState(() => JSON.parse(JSON.stringify(value)));

  // Helper to update nested fields
  const update = (path: string[], val: any) => {
    const copy = JSON.parse(JSON.stringify(local));
    let obj = copy;
    for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
    obj[path[path.length - 1]] = val;
    setLocal(copy);
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-bold mb-1">Title</label>
        <input className="w-full border rounded p-2" value={local.structured_content?.title_page?.title || ''} onChange={e => update(['structured_content', 'title_page', 'title'], e.target.value)} />
      </div>
      <div>
        <label className="block font-bold mb-1">Subtitle</label>
        <input className="w-full border rounded p-2" value={local.structured_content?.title_page?.subtitle || ''} onChange={e => update(['structured_content', 'title_page', 'subtitle'], e.target.value)} />
      </div>
      <div>
        <label className="block font-bold mb-1">Introduction</label>
        <textarea className="w-full border rounded p-2" value={local.structured_content?.introduction_page?.content || ''} onChange={e => update(['structured_content', 'introduction_page', 'content'], e.target.value)} />
      </div>
      <div>
        <label className="block font-bold mb-1">Toolkit Sections</label>
        {Array.isArray(local.structured_content?.toolkit_sections) && local.structured_content.toolkit_sections.map((section: any, idx: number) => (
          <div key={idx} className="border rounded p-2 mb-2">
            <input className="w-full border rounded mb-1" value={section.title || ''} onChange={e => {
              const arr = [...local.structured_content.toolkit_sections];
              arr[idx] = { ...arr[idx], title: e.target.value };
              update(['structured_content', 'toolkit_sections'], arr);
            }} placeholder="Section Title" />
            <select className="w-full border rounded mb-1" value={section.type || ''} onChange={e => {
              const arr = [...local.structured_content.toolkit_sections];
              arr[idx] = { ...arr[idx], type: e.target.value };
              update(['structured_content', 'toolkit_sections'], arr);
            }}>
              <option value="pros_and_cons_list">Pros & Cons</option>
              <option value="checklist">Checklist</option>
              <option value="scripts">Scripts</option>
            </select>
            <textarea className="w-full border rounded" value={typeof section.content === 'string' ? section.content : JSON.stringify(section.content, null, 2)} onChange={e => {
              const arr = [...local.structured_content.toolkit_sections];
              try {
                arr[idx] = { ...arr[idx], content: JSON.parse(e.target.value) };
              } catch {
                arr[idx] = { ...arr[idx], content: e.target.value };
              }
              update(['structured_content', 'toolkit_sections'], arr);
            }} placeholder="Section Content (JSON or text)" />
          </div>
        ))}
      </div>
      <div>
        <label className="block font-bold mb-1">CTA Title</label>
        <input className="w-full border rounded p-2" value={local.structured_content?.cta_page?.title || ''} onChange={e => update(['structured_content', 'cta_page', 'title'], e.target.value)} />
      </div>
      <div>
        <label className="block font-bold mb-1">CTA Content</label>
        <textarea className="w-full border rounded p-2" value={local.structured_content?.cta_page?.content || ''} onChange={e => update(['structured_content', 'cta_page', 'content'], e.target.value)} />
      </div>
    </div>
  );
}

export default Dashboard; 
