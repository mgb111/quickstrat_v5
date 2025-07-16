import React, { useState, useEffect } from 'react';
import { Copy, FileText, Mail, TrendingUp, Users, Download, MessageCircle, UserCheck } from 'lucide-react';
import { Campaign, Lead } from '../types';
import { CampaignService } from '../lib/campaignService';


interface DashboardProps {
  onNewCampaign: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNewCampaign }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
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
    } catch {
      setError('Failed to load statistics');
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
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6 overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600 text-base sm:text-lg">Manage your lead generation campaigns</p>
      </div>

      {/* Campaigns */}
      {campaigns.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="bg-gray-50 rounded-lg p-4 sm:p-8 max-w-md mx-auto">
            <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">Create your first campaign to start generating leads</p>
            <button
              onClick={onNewCampaign}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 text-base sm:text-lg"
            >
              Create Campaign
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Campaign List */}
          <div className="lg:col-span-1 mb-4 lg:mb-0">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Campaigns</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedCampaign?.id === campaign.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate text-base sm:text-lg">{campaign.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          {campaign.lead_count} leads
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyLandingPageUrl(campaign.landing_page_slug);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full flex-shrink-0"
                        title="Copy landing page URL"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Details */}
          {selectedCampaign && (
            <div className="lg:col-span-2 space-y-6 overflow-x-hidden">
              {/* Campaign Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">{selectedCampaign.lead_count}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Total Leads</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                      {stats?.conversion_rate ? `${stats.conversion_rate}%` : 'N/A'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">Conversion Rate</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg sm:col-span-2 md:col-span-1">
                    <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-xl sm:text-2xl font-bold text-purple-600">
                      {stats?.avg_time_to_convert ? `${stats.avg_time_to_convert} days` : 'N/A'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">Avg Time to Convert</p>
                  </div>
                </div>
              </div>

              {/* Leads List */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
                  <button
                    onClick={exportLeads}
                    className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {isLoadingLeads ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading leads...</p>
                    </div>
                  ) : leads.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No leads captured yet
                    </div>
                  ) : (
                    leads.map((lead) => (
                      <div key={lead.id} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{lead.email}</p>
                          <p className="text-sm text-gray-500">
                            Captured {new Date(lead.captured_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => copyLandingPageUrl(selectedCampaign.landing_page_slug)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy landing page URL"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Campaign Settings */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Landing Page URL
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={`${window.location.origin}/landing/${selectedCampaign.landing_page_slug}`}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50"
                      />
                      <button
                        onClick={() => copyLandingPageUrl(selectedCampaign.landing_page_slug)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Magnet Title
                    </label>
                    <p className="text-gray-900">{selectedCampaign.lead_magnet_title || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}


    </div>
  );
};

export default Dashboard; 
