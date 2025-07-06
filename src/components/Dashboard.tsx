import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Mail, 
  Download, 
  ExternalLink, 
  Copy, 
  FileText, 
  TrendingUp,
  Calendar,
  Eye,
  Plus,
  Settings
} from 'lucide-react';
import { Campaign, Lead } from '../types';
import { CampaignService } from '../lib/campaignService';
import LoadingSpinner, { ContentLoader, TableLoader } from './LoadingSpinner';
import EmailTest from './EmailTest';

interface DashboardProps {
  onNewCampaign: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNewCampaign }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailTest, setShowEmailTest] = useState(false);

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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const exportLeadsCSV = async () => {
    if (!selectedCampaign) return;

    try {
      const csvData = await CampaignService.exportLeadsCSV(selectedCampaign.id);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedCampaign.name}-leads.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export leads');
    }
  };

  const copyLandingPageUrl = (slug: string) => {
    const url = `${window.location.origin}/landing/${slug}`;
    navigator.clipboard.writeText(url);
  };

  if (showEmailTest) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Configuration</h1>
            <p className="text-gray-600">Test and configure your email service</p>
          </div>
          <button
            onClick={() => setShowEmailTest(false)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
        <EmailTest />
      </div>
    );
  }

  if (isLoading) {
    return <ContentLoader text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Dashboard</h1>
          <p className="text-gray-600">Manage your lead generation campaigns</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowEmailTest(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Email Setup
          </button>
          <button
            onClick={onNewCampaign}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </button>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-4">Create your first campaign to start generating leads</p>
            <button
              onClick={onNewCampaign}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Campaign
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Campaigns</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedCampaign?.id === campaign.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 truncate">{campaign.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
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
                        className="text-gray-400 hover:text-gray-600"
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
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Cards */}
              {isLoadingStats ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Leads</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalLeads || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <div className="flex items-center">
                      <Mail className="h-8 w-8 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.emailsSent || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <div className="flex items-center">
                      <Download className="h-8 w-8 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">PDF Downloads</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.pdfDownloads || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.conversionRate || '0%'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Leads Table */}
              <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Leads</h2>
                    <button
                      onClick={exportLeadsCSV}
                      className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export CSV
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {isLoadingLeads ? (
                    <TableLoader rows={3} />
                  ) : leads.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
                      <p className="text-gray-600">Leads will appear here once they sign up through your landing page</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Captured
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {lead.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(lead.captured_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Active
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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