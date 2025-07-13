import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  AlertTriangle,
  Download,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { 
  AnalyticsService, 
  PhaseAnalytics, 
  UserJourney,
  CampaignAnalytics 
} from '../lib/analyticsService';
import { useAuth } from '../contexts/AuthContext';

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [phaseAnalytics, setPhaseAnalytics] = useState<PhaseAnalytics[]>([]);
  const [userJourney, setUserJourney] = useState<UserJourney | null>(null);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [userSummary, setUserSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const [
        phaseData,
        journeyData,
        funnelData,
        summaryData
      ] = await Promise.all([
        AnalyticsService.getPhaseAnalytics(timeRange),
        AnalyticsService.getUserJourney(user.id),
        AnalyticsService.getFunnelAnalytics(timeRange),
        AnalyticsService.getUserAnalyticsSummary(user.id)
      ]);

      setPhaseAnalytics(phaseData);
      setUserJourney(journeyData);
      setFunnelData(funnelData);
      setUserSummary(summaryData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      input: 'bg-blue-500',
      concept_selection: 'bg-purple-500',
      outline_review: 'bg-green-500',
      upgrade_required: 'bg-yellow-500',
      complete: 'bg-emerald-500',
      dashboard: 'bg-indigo-500'
    };
    return colors[phase] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-center h-64 text-center">
          <div>
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadAnalytics}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 inline mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600">Track your user journey and campaign performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'day' | 'week' | 'month')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="day">Last 24 hours</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
              </select>
            </div>
            <button
              onClick={loadAnalytics}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* User Summary Cards */}
        {userSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Campaigns</p>
                  <p className="text-3xl font-bold">{userSummary.total_campaigns}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Leads</p>
                  <p className="text-3xl font-bold">{userSummary.total_leads}</p>
                </div>
                <Users className="h-8 w-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Avg. Completion Time</p>
                  <p className="text-3xl font-bold">{formatTime(userSummary.average_completion_time || 0)}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Conversion Rate</p>
                  <p className="text-3xl font-bold">{formatPercentage(userSummary.conversion_rate || 0)}</p>
                </div>
                <Target className="h-8 w-8 text-orange-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Phase Performance */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Phase Performance</h3>
        <div className="space-y-4">
          {phaseAnalytics.map((phase) => (
            <div key={phase.phase} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full ${getPhaseColor(phase.phase)} mr-3`}></div>
                  <h4 className="font-semibold text-gray-900 capitalize">
                    {phase.phase.replace('_', ' ')}
                  </h4>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPercentage(phase.completion_rate)}
                  </p>
                  <p className="text-sm text-gray-500">Completion Rate</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Entries</p>
                  <p className="font-semibold">{phase.total_entries}</p>
                </div>
                <div>
                  <p className="text-gray-500">Completions</p>
                  <p className="font-semibold text-green-600">{phase.total_completions}</p>
                </div>
                <div>
                  <p className="text-gray-500">Drop-offs</p>
                  <p className="font-semibold text-red-600">{phase.drop_off_count}</p>
                </div>
                <div>
                  <p className="text-gray-500">Avg. Time</p>
                  <p className="font-semibold">{formatTime(phase.average_time_seconds || 0)}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{formatPercentage(phase.completion_rate)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${phase.completion_rate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
        <div className="space-y-4">
          {funnelData.map((funnel, index) => (
            <div key={funnel.phase} className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full ${getPhaseColor(funnel.phase)} flex items-center justify-center text-white text-sm font-bold`}>
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 capitalize">
                    {funnel.phase.replace('_', ' ')}
                  </h4>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {formatPercentage(funnel.conversion_rate || 0)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {funnel.completions} of {funnel.entries}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${funnel.conversion_rate || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Journey */}
      {userJourney && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Journey</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Phases Completed</h4>
              <div className="space-y-2">
                {userJourney.phases_completed.map((phase, index) => (
                  <div key={phase} className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                      ✓
                    </div>
                    <span className="text-gray-700 capitalize">
                      {phase.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Journey Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Started</span>
                  <span className="font-semibold">
                    {new Date(userJourney.started_at).toLocaleDateString()}
                  </span>
                </div>
                {userJourney.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold">
                      {new Date(userJourney.completed_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {userJourney.total_time_seconds && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Time</span>
                    <span className="font-semibold">
                      {formatTime(userJourney.total_time_seconds)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Campaigns Created</span>
                  <span className="font-semibold">{userJourney.campaign_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Leads Generated</span>
                  <span className="font-semibold">{userJourney.leads_generated}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Analytics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Export Analytics</h3>
            <p className="text-gray-600">Download your analytics data for external analysis</p>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 