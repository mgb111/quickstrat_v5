import { supabase } from './supabase';

export interface SubscriptionStatus {
  isSubscribed: boolean;
  plan: 'free' | 'premium' | 'enterprise';
  canAccessPDF: boolean;
  canAccessUnlimitedCampaigns: boolean;
  monthlyCampaignLimit: number;
  usedCampaigns: number;
  subscriptionExpiry?: string; // ISO date string
  campaignCountPeriod?: string; // e.g., '2024-06'
}

export class SubscriptionService {
  static async getUserSubscription(userId: string): Promise<SubscriptionStatus> {
    try {
      // Fetch user with new fields
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, plan, campaign_count, subscription_expiry, campaign_count_period')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user subscription:', fetchError);
        return this.getDefaultSubscription();
      }

      let user = existingUser;

      // If user doesn't exist, create them with default values
      if (!user) {
        console.log('User not found in users table, creating new user record...');
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          console.error('No authenticated user found');
          return this.getDefaultSubscription();
        }
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: authUser.email,
            plan: 'free',
            campaign_count: 0,
            subscription_expiry: null,
            campaign_count_period: null
          })
          .select('id, plan, campaign_count, subscription_expiry, campaign_count_period')
          .single();
        if (createError) {
          console.error('Error creating user record:', createError);
          return this.getDefaultSubscription();
        }
        user = newUser;
        console.log('Created new user record:', user);
      }

      // Map plan to subscription status
      const plan = user?.plan || 'free';
      const usedCampaigns = user?.campaign_count || 0;
      const subscriptionExpiry = user?.subscription_expiry || undefined;
      const campaignCountPeriod = user?.campaign_count_period || undefined;

      return {
        isSubscribed: plan !== 'free' && SubscriptionService.isWithinPaidPeriod(subscriptionExpiry),
        plan: plan as 'free' | 'premium' | 'enterprise',
        canAccessPDF: plan !== 'free' && SubscriptionService.isWithinPaidPeriod(subscriptionExpiry),
        canAccessUnlimitedCampaigns: plan === 'enterprise',
        monthlyCampaignLimit: this.getCampaignLimit(plan),
        usedCampaigns,
        subscriptionExpiry,
        campaignCountPeriod
      };
    } catch (error) {
      console.error('Error in getUserSubscription:', error);
      return this.getDefaultSubscription();
    }
  }

  static isWithinPaidPeriod(subscriptionExpiry?: string | null): boolean {
    if (!subscriptionExpiry) return false;
    const now = new Date();
    const expiry = new Date(subscriptionExpiry);
    return expiry >= now;
  }

  static async resetCampaignCountIfPeriodChanged(userId: string, currentPeriod: string): Promise<void> {
    // Fetch user
    const { data: user, error } = await supabase
      .from('users')
      .select('campaign_count_period')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.error('Error fetching user for campaign count reset:', error);
      return;
    }
    if (!user || user.campaign_count_period !== currentPeriod) {
      // Reset campaign_count and update period
      const { error: updateError } = await supabase
        .from('users')
        .update({ campaign_count: 0, campaign_count_period: currentPeriod })
        .eq('id', userId);
      if (updateError) {
        console.error('Error resetting campaign count:', updateError);
      }
    }
  }

  static getDefaultSubscription(): SubscriptionStatus {
    return {
      isSubscribed: false,
      plan: 'free',
      canAccessPDF: false,
      canAccessUnlimitedCampaigns: false,
      monthlyCampaignLimit: 3, // Free users get 3 campaigns per month
      usedCampaigns: 0,
      subscriptionExpiry: undefined,
      campaignCountPeriod: undefined
    };
  }

  static getCampaignLimit(plan: string): number {
    switch (plan) {
      case 'free':
        return 3;
      case 'premium':
        return 5;
      case 'enterprise':
        return 25;
      default:
        return 3;
    }
  }

  static canCreateCampaign(subscription: SubscriptionStatus): boolean {
    if (!subscription.isSubscribed) return false;
    if (subscription.canAccessUnlimitedCampaigns) {
      return true;
    }
    return subscription.usedCampaigns < subscription.monthlyCampaignLimit;
  }

  static async incrementCampaignCount(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ campaign_count: supabase.rpc('increment') })
        .eq('id', userId);

      if (error) {
        console.error('Error incrementing campaign count:', error);
      }
    } catch (error) {
      console.error('Error in incrementCampaignCount:', error);
    }
  }

  static getUpgradeBenefits(plan: 'premium') {
    const benefits = {
      premium: [
        '✅ Unlimited PDF downloads',
        '✅ 5 campaigns per month (included)',
        '✅ $14 per additional campaign',
        '✅ Landing page generation',
        '✅ Lead capture & management',
        '✅ Complete end-to-end campaigns',
        '✅ Priority support',
        '✅ Advanced customization options',
        '✅ Branded templates'
      ]
    };
    return benefits[plan];
  }

  static getPricing() {
    return {
      premium: {
        monthly: {
          price: 49,
          period: 'month',
          features: this.getUpgradeBenefits('premium'),
          includedCampaigns: 5,
          extraCampaignPrice: 14
        }
      }
    };
  }

  // Calculate the cost for extra campaigns (beyond included)
  static calculateExtraCampaignCost(plan: 'premium', usedCampaigns: number, billingCycle: 'monthly' = 'monthly') {
    const pricing = this.getPricing().premium.monthly;
    const included = pricing.includedCampaigns;
    const extra = Math.max(0, usedCampaigns - included);
    return extra * pricing.extraCampaignPrice;
  }

  // Upgrade user to premium after payment
  static async upgradeToPremium(userId: string): Promise<void> {
    // Fetch current expiry
    const { data: user, error } = await supabase
      .from('users')
      .select('subscription_expiry')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw new Error('Failed to fetch user for upgrade');
    let newExpiry: Date;
    const now = new Date();
    if (user && user.subscription_expiry && new Date(user.subscription_expiry) > now) {
      // Extend from current expiry
      newExpiry = new Date(user.subscription_expiry);
      newExpiry.setMonth(newExpiry.getMonth() + 1);
    } else {
      // Set to 1 month from now
      newExpiry = new Date(now.setMonth(now.getMonth() + 1));
    }
    await supabase
      .from('users')
      .update({
        plan: 'premium',
        subscription_expiry: newExpiry.toISOString()
      })
      .eq('id', userId);
  }
} 