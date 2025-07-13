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
      // First, check if user exists in the users table
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, plan, campaign_count')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors

      if (fetchError) {
        console.error('Error fetching user subscription:', fetchError);
        return this.getDefaultSubscription();
      }

      let user = existingUser;

      // If user doesn't exist, create them with default values
      if (!user) {
        console.log('User not found in users table, creating new user record...');
        
        // Get user email from auth.users
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          console.error('No authenticated user found');
          return this.getDefaultSubscription();
        }

        // Create user record
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: authUser.email,
            plan: 'free',
            campaign_count: 0
          })
          .select('id, plan, campaign_count')
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