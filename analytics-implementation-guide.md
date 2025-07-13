# 📊 Analytics Implementation Guide

## Overview

The LeadGen Machine now includes comprehensive analytics tracking for every phase of the user journey. This system provides detailed insights into user behavior, conversion rates, and campaign performance.

## 🎯 What's Tracked

### Phase Tracking
- **Input Phase**: Form submissions, validation errors, completion rates
- **Concept Selection**: Concept choices, customization usage, time spent
- **Outline Review**: Approval rates, modification frequency, completion time
- **Upgrade Required**: Subscription plan, upgrade attempts, conversion rates
- **Complete**: Final output generation, PDF downloads, campaign creation

### User Actions
- Button clicks and form submissions
- Navigation between phases
- Error interactions and retry attempts
- Feature usage and customization
- Time spent on each phase

### Conversion Events
- Email captures and lead generation
- PDF downloads and content consumption
- Subscription upgrades and payments
- Landing page views and engagement

### Performance Metrics
- Page load times and API response times
- Error rates and failure points
- User session duration and engagement
- Device and browser analytics

## 🗄️ Database Schema

### Core Tables

#### `analytics_events`
Stores every user interaction and event:
```sql
- id: UUID (Primary Key)
- user_id: UUID (References auth.users)
- session_id: TEXT (Session tracking)
- event_type: TEXT (phase_entry, user_action, conversion, etc.)
- event_name: TEXT (Specific event name)
- phase: TEXT (Current phase)
- campaign_id: UUID (References campaigns)
- metadata: JSONB (Additional event data)
- timestamp: TIMESTAMPTZ
- user_agent: TEXT
- referrer: TEXT
- utm_source/medium/campaign: TEXT
```

#### `user_journeys`
Tracks complete user journeys:
```sql
- id: UUID (Primary Key)
- user_id: UUID (References auth.users)
- session_id: TEXT
- started_at: TIMESTAMPTZ
- completed_at: TIMESTAMPTZ
- phases_completed: TEXT[]
- total_time_seconds: INTEGER
- conversion_funnel: TEXT
- subscription_plan: TEXT
- campaign_count: INTEGER
- leads_generated: INTEGER
```

#### `campaign_analytics`
Campaign-specific performance data:
```sql
- id: UUID (Primary Key)
- campaign_id: UUID (References campaigns)
- user_id: UUID (References auth.users)
- creation_time_seconds: INTEGER
- phases_completed: TEXT[]
- final_output_generated: BOOLEAN
- pdf_downloaded: BOOLEAN
- leads_captured: INTEGER
- landing_page_views: INTEGER
- conversion_rate: DECIMAL
```

#### `phase_analytics`
Aggregated phase performance:
```sql
- id: UUID (Primary Key)
- phase: TEXT
- date: DATE
- total_entries: INTEGER
- total_completions: INTEGER
- total_abandonments: INTEGER
- average_time_seconds: INTEGER
- completion_rate: DECIMAL
- drop_off_rate: DECIMAL
- common_issues: TEXT[]
```

## 🔧 Implementation Details

### Analytics Service

The `AnalyticsService` class provides methods for tracking:

```typescript
// Track phase entry
await AnalyticsService.trackPhaseEntry('input', {
  input_data: { ... },
  user_id: user?.id
});

// Track phase completion
await AnalyticsService.trackPhaseCompletion('input', {
  concepts_generated: 6,
  user_id: user?.id
});

// Track user actions
await AnalyticsService.trackUserAction('button_click', 'input', {
  button_name: 'generate_concepts',
  user_id: user?.id
});

// Track conversions
await AnalyticsService.trackConversion('pdf_download', {
  pdf_title: 'Lead Magnet',
  download_time: Date.now()
});

// Track errors
await AnalyticsService.trackError('api_error', 'Failed to generate concepts', 'input', {
  user_id: user?.id
});
```

### Automatic Tracking

The system automatically tracks:
- **Session management**: Unique session IDs for anonymous and authenticated users
- **UTM parameters**: Source, medium, and campaign tracking
- **User agent**: Browser and device information
- **Timestamps**: Precise timing for all events
- **Error handling**: Automatic error tracking with context

### Database Triggers

Automatic database triggers update aggregated analytics:
- **Phase analytics**: Real-time completion rates and drop-off tracking
- **Campaign analytics**: Automatic creation when campaigns are made
- **User journeys**: Automatic updates when phases are completed

## 📈 Analytics Dashboard

### Key Metrics Displayed

#### User Summary Cards
- **Total Campaigns**: Number of campaigns created
- **Total Leads**: Email captures and lead generation
- **Average Completion Time**: Time to complete full journey
- **Conversion Rate**: Percentage of users who complete the funnel

#### Phase Performance
- **Completion Rates**: Percentage of users who complete each phase
- **Drop-off Analysis**: Where users abandon the process
- **Time Tracking**: Average time spent on each phase
- **Error Rates**: Common issues and failure points

#### Conversion Funnel
- **Funnel Visualization**: Step-by-step conversion tracking
- **Conversion Rates**: Percentage moving through each step
- **Drop-off Points**: Where users leave the funnel
- **Optimization Opportunities**: Areas for improvement

#### User Journey
- **Personal Journey**: Individual user's path through the system
- **Phase Completion**: Which phases the user has completed
- **Time Analysis**: Total time spent and phase timing
- **Campaign Stats**: User's campaign and lead generation

### Time Range Filtering
- **Last 24 hours**: Real-time performance
- **Last 7 days**: Weekly trends
- **Last 30 days**: Monthly analysis

## 🚀 Usage Examples

### Track Custom Events

```typescript
// Track feature usage
await AnalyticsService.trackFeatureUsage('customization_used', {
  customization_type: 'color_scheme',
  user_id: user?.id
});

// Track performance metrics
await AnalyticsService.trackPerformanceMetric('api_response_time', 1250, {
  endpoint: '/api/generate-concepts',
  user_id: user?.id
});

// Track page views
await AnalyticsService.trackPageView('/dashboard', {
  user_id: user?.id,
  referrer: '/wizard'
});
```

### Get Analytics Data

```typescript
// Get phase analytics
const phaseData = await AnalyticsService.getPhaseAnalytics('week');

// Get user journey
const journey = await AnalyticsService.getUserJourney(userId);

// Get funnel analytics
const funnelData = await AnalyticsService.getFunnelAnalytics('month');

// Get user summary
const summary = await AnalyticsService.getUserAnalyticsSummary(userId);
```

## 📊 Data Export

### CSV Export
The analytics dashboard includes CSV export functionality for:
- **Event data**: Raw analytics events
- **Phase performance**: Aggregated phase metrics
- **User journeys**: Complete user paths
- **Campaign analytics**: Campaign-specific data

### API Access
All analytics data is available through the Supabase API:
- **Real-time queries**: Live analytics data
- **Filtered views**: Time-based and user-based filtering
- **Aggregated metrics**: Pre-calculated performance data

## 🔒 Privacy & Security

### Data Protection
- **Row Level Security**: Users can only access their own data
- **Anonymous tracking**: Session-based tracking before authentication
- **Data retention**: Configurable data retention policies
- **GDPR compliance**: User data deletion capabilities

### Security Features
- **Encrypted storage**: All sensitive data is encrypted
- **Access controls**: Role-based access to analytics
- **Audit logging**: Track who accesses analytics data
- **Data anonymization**: Option to anonymize user data

## 🎯 Key Insights Available

### User Behavior
- **Entry points**: Where users start their journey
- **Drop-off patterns**: Common abandonment points
- **Engagement metrics**: Time spent and interaction depth
- **Feature adoption**: Which features are most used

### Conversion Optimization
- **Funnel analysis**: Step-by-step conversion tracking
- **A/B testing data**: Performance comparison
- **Error analysis**: Common failure points
- **Optimization opportunities**: Areas for improvement

### Business Metrics
- **Lead generation**: Email capture rates and quality
- **Revenue tracking**: Subscription conversions
- **Campaign performance**: Individual campaign success
- **User lifetime value**: Long-term user engagement

## 🔧 Configuration

### Environment Variables
```env
# Analytics Configuration
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_SAMPLE_RATE=100
VITE_ANALYTICS_RETENTION_DAYS=90
```

### Custom Events
Define custom event types in `AnalyticsEvents`:
```typescript
export const AnalyticsEvents = {
  // Add custom events here
  CUSTOM_FEATURE_USED: 'custom_feature_used',
  SPECIAL_OFFER_CLICKED: 'special_offer_clicked'
};
```

### Custom Phases
Add new phases in `AnalyticsPhases`:
```typescript
export const AnalyticsPhases = {
  // Add custom phases here
  CUSTOM_PHASE: 'custom_phase'
};
```

## 📈 Reporting

### Automated Reports
- **Daily summaries**: Key metrics for each day
- **Weekly trends**: Performance over time
- **Monthly analysis**: Long-term patterns
- **Conversion reports**: Funnel performance

### Custom Dashboards
- **Real-time monitoring**: Live user activity
- **Performance alerts**: Automatic notifications
- **Custom metrics**: Business-specific KPIs
- **Export capabilities**: Data for external analysis

## 🚀 Next Steps

### Advanced Analytics
- **Predictive analytics**: User behavior prediction
- **Cohort analysis**: User group performance
- **Attribution modeling**: Conversion attribution
- **Machine learning**: Automated insights

### Integration Options
- **Google Analytics**: GA4 integration
- **Mixpanel**: Advanced event tracking
- **Amplitude**: User behavior analytics
- **Custom dashboards**: External BI tools

### Optimization
- **Performance monitoring**: System performance impact
- **Data optimization**: Storage and query optimization
- **Real-time processing**: Stream processing for live data
- **Advanced filtering**: Complex query capabilities

---

This analytics system provides comprehensive insights into user behavior and campaign performance, enabling data-driven optimization of the LeadGen Machine platform. 