import { supabase } from './supabase';

export interface AnalyticsEvent {
  id?: string;
  user_id?: string;
  session_id: string;
  event_type: string;
  event_name: string;
  phase: string;
  campaign_id?: string;
  metadata: Record<string, any>;
  timestamp: string;
  user_agent?: string;
  ip_address?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface UserJourney {
  user_id?: string;
  session_id: string;
  started_at: string;
  completed_at?: string;
  phases_completed: string[];
  total_time_seconds?: number;
  conversion_funnel: string;
  subscription_plan?: string;
  campaign_count: number;
  leads_generated: number;
}

export interface PhaseAnalytics {
  phase: string;
  total_entries: number;
  total_completions: number;
  completion_rate: number;
  average_time_seconds: number;
  drop_off_count: number;
  drop_off_rate: number;
  common_issues: string[];
}

export interface CampaignAnalytics {
  campaign_id: string;
  user_id: string;
  creation_time_seconds: number;
  phases_completed: string[];
  final_output_generated: boolean;
  pdf_downloaded: boolean;
  leads_captured: number;
  landing_page_views: number;
  conversion_rate: number;
}

export class AnalyticsService {
  private static sessionId: string = '';

  // Initialize analytics session
  static initializeSession(): string {
    if (!this.sessionId) {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.sessionId;
  }

  // Get current session ID
  static getSessionId(): string {
    return this.sessionId || this.initializeSession();
  }

  // Track a user event
  static async trackEvent(eventData: Omit<AnalyticsEvent, 'session_id' | 'timestamp'>): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        ...eventData,
        session_id: this.getSessionId(),
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        ...this.getUTMParameters()
      };

      console.log('📊 Analytics Event:', event);

      const { error } = await supabase
        .from('analytics_events')
        .insert(event);

      if (error) {
        console.error('❌ Failed to track analytics event:', error);
      }
    } catch (error) {
      console.error('❌ Analytics tracking error:', error);
    }
  }

  // Track phase entry
  static async trackPhaseEntry(phase: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.trackEvent({
      event_type: 'phase_entry',
      event_name: `${phase}_entered`,
      phase,
      metadata: {
        ...metadata,
        phase_entry_time: Date.now()
      }
    });
  }

  // Track phase completion
  static async trackPhaseCompletion(phase: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.trackEvent({
      event_type: 'phase_completion',
      event_name: `${phase}_completed`,
      phase,
      metadata: {
        ...metadata,
        phase_completion_time: Date.now()
      }
    });
  }

  // Track phase abandonment
  static async trackPhaseAbandonment(phase: string, reason: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.trackEvent({
      event_type: 'phase_abandonment',
      event_name: `${phase}_abandoned`,
      phase,
      metadata: {
        ...metadata,
        abandonment_reason: reason,
        abandonment_time: Date.now()
      }
    });
  }

  // Track user action
  static async trackUserAction(action: string, phase: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.trackEvent({
      event_type: 'user_action',
      event_name: action,
      phase,
      metadata: {
        ...metadata,
        action_time: Date.now()
      }
    });
  }

  // Track conversion events
  static async trackConversion(conversionType: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.trackEvent({
      event_type: 'conversion',
      event_name: conversionType,
      phase: 'conversion',
      metadata: {
        ...metadata,
        conversion_time: Date.now()
      }
    });
  }

  // Track error events
  static async trackError(errorType: string, errorMessage: string, phase: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.trackEvent({
      event_type: 'error',
      event_name: errorType,
      phase,
      metadata: {
        ...metadata,
        error_message: errorMessage,
        error_time: Date.now()
      }
    });
  }

  // Track subscription events
  static async trackSubscriptionEvent(eventType: string, plan: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.trackEvent({
      event_type: 'subscription',
      event_name: eventType,
      phase: 'subscription',
      metadata: {
        ...metadata,
        plan,
        event_time: Date.now()
      }
    });
  }

  // Get UTM parameters from URL
  private static getUTMParameters(): Record<string, string> {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || ''
    };
  }

  // Get user journey analytics
  static async getUserJourney(userId: string): Promise<UserJourney | null> {
    try {
      const { data, error } = await supabase
        .from('user_journeys')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('❌ Failed to get user journey:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Error getting user journey:', error);
      return null;
    }
  }

  // Get phase analytics
  static async getPhaseAnalytics(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<PhaseAnalytics[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_phase_analytics', { time_range: timeRange });

      if (error) {
        console.error('❌ Failed to get phase analytics:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting phase analytics:', error);
      return [];
    }
  }

  // Get campaign analytics
  static async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics | null> {
    try {
      const { data, error } = await supabase
        .from('campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      if (error) {
        console.error('❌ Failed to get campaign analytics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Error getting campaign analytics:', error);
      return null;
    }
  }

  // Get user analytics summary
  static async getUserAnalyticsSummary(userId: string): Promise<{
    total_campaigns: number;
    total_leads: number;
    average_completion_time: number;
    conversion_rate: number;
    most_used_phases: string[];
  } | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_analytics_summary', { user_id: userId });

      if (error) {
        console.error('❌ Failed to get user analytics summary:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Error getting user analytics summary:', error);
      return null;
    }
  }

  // Get funnel analytics
  static async getFunnelAnalytics(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<{
    phase: string;
    entries: number;
    completions: number;
    drop_offs: number;
    conversion_rate: number;
  }[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_funnel_analytics', { time_range: timeRange });

      if (error) {
        console.error('❌ Failed to get funnel analytics:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting funnel analytics:', error);
      return [];
    }
  }

  // Track page views
  static async trackPageView(page: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.trackEvent({
      event_type: 'page_view',
      event_name: 'page_viewed',
      phase: 'navigation',
      metadata: {
        ...metadata,
        page,
        page_view_time: Date.now()
      }
    });
  }

  // Track time spent on phase
  static async trackTimeSpent(phase: string, timeSpentSeconds: number, metadata: Record<string, any> = {}): Promise<void> {
    await this.trackEvent({
      event_type: 'time_spent',
      event_name: 'phase_time_tracked',
      phase,
      metadata: {
        ...metadata,
        time_spent_seconds: timeSpentSeconds,
        tracking_time: Date.now()
      }
    });
  }

  // Track feature usage
  static async trackFeatureUsage(feature: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.trackEvent({
      event_type: 'feature_usage',
      event_name: feature,
      phase: 'feature_interaction',
      metadata: {
        ...metadata,
        feature_usage_time: Date.now()
      }
    });
  }

  // Track performance metrics
  static async trackPerformanceMetric(metric: string, value: number, metadata: Record<string, any> = {}): Promise<void> {
    await this.trackEvent({
      event_type: 'performance',
      event_name: metric,
      phase: 'performance',
      metadata: {
        ...metadata,
        metric_value: value,
        tracking_time: Date.now()
      }
    });
  }
}

// Predefined event types for consistency
export const AnalyticsEvents = {
  // Phase events
  PHASE_ENTRY: 'phase_entry',
  PHASE_COMPLETION: 'phase_completion',
  PHASE_ABANDONMENT: 'phase_abandonment',
  
  // User actions
  USER_ACTION: 'user_action',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMISSION: 'form_submission',
  FORM_VALIDATION_ERROR: 'form_validation_error',
  
  // Conversion events
  CONVERSION: 'conversion',
  PDF_DOWNLOAD: 'pdf_download',
  EMAIL_CAPTURE: 'email_capture',
  UPGRADE_ATTEMPT: 'upgrade_attempt',
  UPGRADE_SUCCESS: 'upgrade_success',
  
  // Error events
  ERROR: 'error',
  API_ERROR: 'api_error',
  VALIDATION_ERROR: 'validation_error',
  NETWORK_ERROR: 'network_error',
  
  // Subscription events
  SUBSCRIPTION: 'subscription',
  PLAN_UPGRADE: 'plan_upgrade',
  PLAN_DOWNGRADE: 'plan_downgrade',
  PAYMENT_FAILURE: 'payment_failure',
  
  // Navigation events
  PAGE_VIEW: 'page_view',
  NAVIGATION: 'navigation',
  
  // Performance events
  PERFORMANCE: 'performance',
  LOAD_TIME: 'load_time',
  API_RESPONSE_TIME: 'api_response_time',
  
  // Feature usage
  FEATURE_USAGE: 'feature_usage',
  CUSTOMIZATION_USED: 'customization_used',
  TEMPLATE_SELECTED: 'template_selected'
};

// Predefined phases for consistency
export const AnalyticsPhases = {
  INPUT: 'input',
  CONCEPT_SELECTION: 'concept_selection',
  OUTLINE_REVIEW: 'outline_review',
  UPGRADE_REQUIRED: 'upgrade_required',
  COMPLETE: 'complete',
  DASHBOARD: 'dashboard',
  LANDING_PAGE: 'landing_page',
  AUTHENTICATION: 'authentication',
  SUBSCRIPTION: 'subscription',
  ERROR: 'error'
}; 