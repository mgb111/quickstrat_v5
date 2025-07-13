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
  RefreshCw,
  Eye,
  DollarSign,
  Activity,
  UserCheck
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminAnalyticsProps {
  className?: string;
}

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ className }) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdminAnalytics();
  }, [timeRange]);

  const loadAdminAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        dailyStats,
        phasePerformance,
        userJourneys,
        conversionData,
        errorRates,
        topEvents
      ] = await Promise.all([
        getDailyStats(),
        getPhasePerformance(),
        getUserJourneys(),
        getConversionData(),
        getErrorRates(),
        getTopEvents()
      ]);

      setAnalyticsData({
        dailyStats,
        phasePerformance,
        userJourneys,
        conversionData,
        errorRates,
        topEvents
      });
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const getDailyStats = async () => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', getDateRange())
      .order('timestamp', { ascending: false });

    if (error) throw error;

    const stats = {
      totalEvents: data.length,
      uniqueSessions: new Set(data.map(e => e.session_id)).size,
      uniqueUsers: new Set(data.filter(e => e.user_id).map(e => e.user_id)).size,
      conversions: data.filter(e => e.event_type === 'conversion').length,
      errors: data.filter(e => e.event_type === 'error').length
    };

    return stats;
  };

  const getPhasePerformance = async () => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', getDateRange())
      .in('event_type', ['phase_entry', 'phase_completion', 'phase_abandonment']);

    if (error) throw error;

    const phaseStats: Record<string, any> = {};
    
    data.forEach(event => {
      if (!phaseStats[event.phase]) {
        phaseStats[event.phase] = { entries: 0, completions: 0, abandonments: 0 };
      }
      
      if (event.event_type === 'phase_entry') phaseStats[event.phase].entries++;
      if (event.event_type === 'phase_completion') phaseStats[event.phase].completions++;
      if (event.event_type === 'phase_abandonment') phaseStats[event.phase].abandonments++;
    });

    return Object.entries(phaseStats).map(([phase, stats]: [string, any]) => ({
      phase,
      ...stats,
      completionRate: stats.entries > 0 ? (stats.completions / stats.entries * 100).toFixed(1) : 0,
      dropOffRate: stats.entries > 0 ? (stats.abandonments / stats.entries * 100).toFixed(1) : 0
    }));
  };

  const getUserJourneys = async () => {
    const { data, error } = await supabase
      .from('user_journeys')
      .select('*')
      .gte('started_at', getDateRange())
      .order('started_at', { ascending: false });

    if (error) throw error;

    return {
      totalJourneys: data.length,
      completedJourneys: data.filter(j => j.completed_at).length,
      averageTime: data.reduce((acc, j) => acc + (j.total_time_seconds || 0), 0) / data.length,
      phasesCompleted: data.reduce((acc, j) => acc + j.phases_completed.length, 0) / data.length
    };
  };

  const getConversionData = async () => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', getDateRange())
      .eq('event_type', 'conversion');

    if (error) throw error;

    const conversions = {
      pdfDownloads: data.filter(e => e.event_name === 'pdf_download').length,
      emailCaptures: data.filter(e => e.event_name === 'email_capture').length,
      upgrades: data.filter(e => e.event_name === 'upgrade_success').length,
      total: data.length
    };

    return conversions;
  };

  const getErrorRates = async () => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', getDateRange())
      .eq('event_type', 'error');

    if (error) throw error;

    const errorStats: Record<string, number> = {};
    data.forEach(event => {
      errorStats[event.event_name] = (errorStats[event.event_name] || 0) + 1;
    });

    return Object.entries(errorStats)
      .map(([errorType, count]) => ({ errorType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getTopEvents = async () => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', getDateRange());

    if (error) throw error;

    const eventStats: Record<string, number> = {};
    data.forEach(event => {
      eventStats[event.event_name] = (eventStats[event.event_name] || 0) + 1;
    });

    return Object.entries(eventStats)
      .map(([eventName, count]) => ({ eventName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const exportData = async () => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', getDateRange());

    if (error) {
      console.error('Export failed:', error);
      return;
    }

    const csvContent = [
      ['Timestamp', 'Event Type', 'Event Name', 'Phase', 'User ID', 'Session ID', 'Metadata'],
      ...data.map(event => [
        event.timestamp,
        event.event_type,
        event.event_name,
        event.phase,
        event.user_id || 'anonymous',
        event.session_id,
        JSON.stringify(event.metadata)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading admin analytics...</span>
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
              onClick={loadAdminAnalytics}
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
            <h2 className="text-2xl font-bold text-gray-900">Admin Analytics Dashboard</h2>
            <p className="text-gray-600">Platform-wide metrics and user behavior insights</p>
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
              onClick={loadAdminAnalytics}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={exportData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Platform Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Events</p>
                <p className="text-3xl font-bold">{analyticsData.dailyStats?.totalEvents || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Unique Sessions</p>
                <p className="text-3xl font-bold">{analyticsData.dailyStats?.uniqueSessions || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Unique Users</p>
                <p className="text-3xl font-bold">{analyticsData.dailyStats?.uniqueUsers || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Conversions</p>
                <p className="text-3xl font-bold">{analyticsData.dailyStats?.conversions || 0}</p>
              </div>
              <Target className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Phase Performance */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Phase Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entries</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop-off Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.phasePerformance?.map((phase: any) => (
                <tr key={phase.phase}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                    {phase.phase.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{phase.entries}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{phase.completions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                    {phase.completionRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                    {phase.dropOffRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion Metrics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Conversion Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{analyticsData.conversionData?.pdfDownloads || 0}</div>
            <div className="text-sm text-gray-500">PDF Downloads</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{analyticsData.conversionData?.emailCaptures || 0}</div>
            <div className="text-sm text-gray-500">Email Captures</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{analyticsData.conversionData?.upgrades || 0}</div>
            <div className="text-sm text-gray-500">Upgrades</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{analyticsData.conversionData?.total || 0}</div>
            <div className="text-sm text-gray-500">Total Conversions</div>
          </div>
        </div>
      </div>

      {/* Error Analysis */}
      {analyticsData.errorRates && analyticsData.errorRates.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Top Errors</h3>
          <div className="space-y-3">
            {analyticsData.errorRates.map((error: any) => (
              <div key={error.errorType} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-red-800">{error.errorType}</p>
                  <p className="text-sm text-red-600">Error type</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">{error.count}</p>
                  <p className="text-sm text-red-500">occurrences</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Events */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Most Common Events</h3>
        <div className="space-y-3">
          {analyticsData.topEvents?.map((event: any) => (
            <div key={event.eventName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{event.eventName}</p>
                <p className="text-sm text-gray-500">Event name</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{event.count}</p>
                <p className="text-sm text-gray-500">occurrences</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics; 