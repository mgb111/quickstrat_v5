// SaaS Configuration and Multi-tenancy Management
// This handles the SaaS platform architecture

export interface SaaSUser {
  id: string;
  email: string;
  plan: 'free' | 'premium';
  subscription_status: 'active' | 'cancelled' | 'past_due';
  created_at: string;
  last_login: string;
  settings: UserSettings;
}

export interface UserSettings {
  branding: {
    company_name: string;
    logo_url?: string;
    primary_color: string;
    secondary_color: string;
  };
  email_settings: {
    from_name: string;
    from_email: string;
    reply_to?: string;
  };
  notifications: {
    email_notifications: boolean;
    new_lead_alerts: boolean;
    campaign_completion_alerts: boolean;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: {
    max_campaigns: number;
    max_leads_per_month: number;
    custom_branding: boolean;
    email_sequences: boolean;
    analytics: boolean;
    api_access: boolean;
    priority_support: boolean;
  };
  limits: {
    campaigns: number;
    leads_per_month: number;
    emails_per_month: number;
    storage_gb: number;
  };
}

export class SaaSPlatform {
  private static plans: Map<string, SubscriptionPlan> = new Map([
    ['free', {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'USD',
      features: {
        max_campaigns: 1,
        max_leads_per_month: 50,
        custom_branding: false,
        email_sequences: false,
        analytics: false,
        api_access: false,
        priority_support: false,
      },
      limits: {
        campaigns: 1,
        leads_per_month: 50,
        emails_per_month: 100,
        storage_gb: 1,
      }
    }],
    ['premium', {
      id: 'premium',
      name: 'Premium',
      price: 19,
      currency: 'USD',
      features: {
        max_campaigns: -1, // unlimited
        max_leads_per_month: -1, // unlimited
        custom_branding: true,
        email_sequences: true,
        analytics: true,
        api_access: true,
        priority_support: true,
      },
      limits: {
        campaigns: -1, // unlimited
        leads_per_month: -1, // unlimited
        emails_per_month: 10000,
        storage_gb: 50,
      }
    }]
  ]);

  // Get plan details
  static getPlan(planId: string): SubscriptionPlan | null {
    return this.plans.get(planId) || null;
  }

  // Check if user can create campaign
  static canCreateCampaign(user: SaaSUser, currentCampaignCount: number): boolean {
    const plan = this.getPlan(user.plan);
    if (!plan) return false;

    if (plan.limits.campaigns === -1) return true; // unlimited
    return currentCampaignCount < plan.limits.campaigns;
  }

  // Check if user can capture lead
  static canCaptureLead(user: SaaSUser, currentMonthLeads: number): boolean {
    const plan = this.getPlan(user.plan);
    if (!plan) return false;

    if (plan.limits.leads_per_month === -1) return true; // unlimited
    return currentMonthLeads < plan.limits.leads_per_month;
  }

  // Check if user can send email
  static canSendEmail(user: SaaSUser, currentMonthEmails: number): boolean {
    const plan = this.getPlan(user.plan);
    if (!plan) return false;

    if (plan.limits.emails_per_month === -1) return true; // unlimited
    return currentMonthEmails < plan.limits.emails_per_month;
  }

  // Get user's landing page domain
  static getLandingPageDomain(userId: string): string {
    // In production, this would be your SaaS domain
    return `${window.location.origin}/landing`;
  }

  // Generate campaign slug
  static generateCampaignSlug(userId: string, campaignName: string): string {
    const timestamp = Date.now();
    const slug = campaignName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `${userId}-${slug}-${timestamp}`;
  }

  // Get user's branding settings
  static getUserBranding(user: SaaSUser): {
    company_name: string;
    logo_url?: string;
    primary_color: string;
    secondary_color: string;
  } {
    if (user.settings.branding) {
      return user.settings.branding;
    }

    // Default branding
    return {
      company_name: 'LeadGen Machine',
      primary_color: '#667eea',
      secondary_color: '#764ba2',
    };
  }

  // Get user's email settings
  static getUserEmailSettings(user: SaaSUser): {
    from_name: string;
    from_email: string;
    reply_to?: string;
  } {
    if (user.settings.email_settings) {
      return user.settings.email_settings;
    }

    // Default email settings
    return {
      from_name: 'LeadGen Machine',
      from_email: 'noreply@leadgenmachine.com',
    };
  }

  // Check feature access
  static hasFeature(user: SaaSUser, feature: keyof SubscriptionPlan['features']): boolean {
    const plan = this.getPlan(user.plan);
    if (!plan) return false;

    return Boolean(plan.features[feature]);
  }

  // Get usage statistics
  static async getUserUsage(userId: string): Promise<{
    campaigns_created: number;
    leads_this_month: number;
    emails_sent_this_month: number;
    storage_used_gb: number;
  }> {
    // This would fetch from your database
    // For now, return mock data
    return {
      campaigns_created: 3,
      leads_this_month: 127,
      emails_sent_this_month: 254,
      storage_used_gb: 0.5,
    };
  }

  // Upgrade user plan
  static async upgradeUser(userId: string, newPlan: string): Promise<boolean> {
    try {
      // This would integrate with your payment processor
      // and update the user's plan in the database
      console.log(`Upgrading user ${userId} to plan ${newPlan}`);
      return true;
    } catch (error) {
      console.error('Failed to upgrade user:', error);
      return false;
    }
  }

  // Send usage alerts
  static async checkUsageLimits(user: SaaSUser): Promise<{
    near_limit: boolean;
    over_limit: boolean;
    alerts: string[];
  }> {
    const usage = await this.getUserUsage(user.id);
    const plan = this.getPlan(user.plan);
    const alerts: string[] = [];

    if (!plan) {
      return { near_limit: false, over_limit: false, alerts: [] };
    }

    // Check campaign limit
    if (plan.limits.campaigns !== -1 && usage.campaigns_created >= plan.limits.campaigns * 0.8) {
      alerts.push(`You're approaching your campaign limit (${usage.campaigns_created}/${plan.limits.campaigns})`);
    }

    // Check leads limit
    if (plan.limits.leads_per_month !== -1 && usage.leads_this_month >= plan.limits.leads_per_month * 0.8) {
      alerts.push(`You're approaching your monthly lead limit (${usage.leads_this_month}/${plan.limits.leads_per_month})`);
    }

    // Check email limit
    if (plan.limits.emails_per_month !== -1 && usage.emails_sent_this_month >= plan.limits.emails_per_month * 0.8) {
      alerts.push(`You're approaching your monthly email limit (${usage.emails_sent_this_month}/${plan.limits.emails_per_month})`);
    }

    const near_limit = alerts.length > 0;
    const over_limit = false; // Would check if actually over limit

    return { near_limit, over_limit, alerts };
  }
} 