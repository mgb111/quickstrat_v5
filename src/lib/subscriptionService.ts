import { supabase } from './supabase';

export interface SubscriptionStatus {
  isSubscribed: boolean;
  plan: 'free' | 'premium' | 'enterprise';
  canAccessPDF: boolean;
  canAccessUnlimitedCampaigns: boolean;
  monthlyCampaignLimit: number;
  usedCampaigns: number;
}

export class SubscriptionService {
  static async getUserSubscription(userId: string): Promise<SubscriptionStatus> {
    try {
      // Fetch user's subscription data from Supabase
      const { data: user, error } = await supabase
        .from('users')
        .select('plan, campaign_count')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user subscription:', error);
        return this.getDefaultSubscription();
      }

      // Map plan to subscription status
      const plan = user?.plan || 'free';
      const usedCampaigns = user?.campaign_count || 0;

      return {
        isSubscribed: plan !== 'free',
        plan: plan as 'free' | 'premium' | 'enterprise',
        canAccessPDF: plan !== 'free',
        canAccessUnlimitedCampaigns: plan === 'enterprise',
        monthlyCampaignLimit: this.getCampaignLimit(plan),
        usedCampaigns
      };
    } catch (error) {
      console.error('Error in getUserSubscription:', error);
      return this.getDefaultSubscription();
    }
  }

  static getDefaultSubscription(): SubscriptionStatus {
    return {
      isSubscribed: false,
      plan: 'free',
      canAccessPDF: false,
      canAccessUnlimitedCampaigns: false,
      monthlyCampaignLimit: 3, // Free users get 3 campaigns per month
      usedCampaigns: 0
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
        '✅ 5 campaigns per month',
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
          features: this.getUpgradeBenefits('premium')
        },
        yearly: {
          price: 399,
          period: 'year',
          features: this.getUpgradeBenefits('premium'),
          savings: 189 // $49 * 12 - $399 = $189 savings
        }
      }
    };
  }
} 