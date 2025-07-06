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
  Plus
} from 'lucide-react';
import { Campaign, Lead } from '../types';
import { CampaignService } from '../lib/campaignService';

interface DashboardProps {
  onNewCampaign: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNewCampaign }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    } catch (err) {
      setError('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeads = async (campaignId: string) => {
    try {
      const leadsData = await CampaignService.getLeads(campaignId);
      setLeads(leadsData);
    } catch (err) {
      setError('Failed to load leads');
    }
  };

  const loadStats = async (campaignId: string) => {
    try {
      const statsData = await CampaignService.getCampaignStats(campaignId);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load statistics');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
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
        <button
          onClick={onNewCampaign}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </button>
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
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Leads</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Mail className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.emailsSent}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Download className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">PDF Downloads</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.pdfsDownloaded}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Campaign Info */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Campaign Details</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyLandingPageUrl(selectedCampaign.landing_page_slug)}
                      className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy URL
                    </button>
                    <a
                      href={`/landing/${selectedCampaign.landing_page_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Page
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Landing Page URL</p>
                    <p className="font-mono text-gray-900 bg-gray-50 p-2 rounded">
                      {window.location.origin}/landing/{selectedCampaign.landing_page_slug}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="text-gray-900">
                      {new Date(selectedCampaign.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Leads Table */}
              <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Leads ({leads.length})</h3>
                  <button
                    onClick={exportLeadsCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </button>
                </div>
                
                {leads.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No leads captured yet. Share your landing page to start collecting emails.
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
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {leads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {lead.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(lead.captured_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 