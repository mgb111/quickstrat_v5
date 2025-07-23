import { supabase } from './supabase';
import { Campaign, Lead, CampaignInput, CampaignOutput } from '../types';
import { SubscriptionService } from './subscriptionService';

export class CampaignService {
  // Get or create a demo session ID for anonymous users
  private static getDemoSessionId(): string {
    let sessionId = localStorage.getItem('demo_session_id');
    if (!sessionId) {
      sessionId = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('demo_session_id', sessionId);
    }
    return sessionId;
  }

  // Create a new campaign
  static async createCampaign(input: CampaignInput, output: CampaignOutput): Promise<Campaign> {
    console.log('🚀 Starting campaign creation...');
    console.log('📝 Input:', input);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ No authenticated user found');
      throw new Error('Authentication required to create campaigns');
    }

    // Robust plan/campaign limit enforcement
    const subscription = await SubscriptionService.getUserSubscription(user.id);
    if (subscription.plan === 'free' && subscription.usedCampaigns >= subscription.monthlyCampaignLimit) {
      throw new Error('Free plan limit reached. Upgrade to premium to create more campaigns.');
    }
    if (subscription.plan === 'premium') {
      if (subscription.usedCampaigns >= subscription.monthlyCampaignLimit) {
        // Check for extra campaign purchase/payment for this period
        const now = new Date();
        const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const { data: extraPurchases, error: extraError } = await supabase
          .from('extra_campaign_purchases')
          .select('*')
          .eq('user_id', user.id)
          .eq('period', period);
        if (extraError) {
          throw new Error('Error checking extra campaign purchases. Please try again.');
        }
        if (!extraPurchases || extraPurchases.length === 0) {
          throw new Error('Premium plan: 5 campaign limit reached. Please purchase an extra campaign for $14.');
        }
        // Optionally, mark one extra purchase as used (if you want to prevent re-use)
      }
    }
    // Enterprise: unlimited

    // User creation and verification is now handled atomically by SubscriptionService.getUserSubscription.
    // We can proceed with confidence that the user record exists.

    // Generate unique slug
    console.log('🔗 Generating unique slug...');
    const { data: slugData, error: slugError } = await supabase.rpc('generate_unique_slug');
    let slug = `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    if (slugError) {
      console.error('Slug RPC error:', slugError);
    }
    if (Array.isArray(slugData) && slugData.length > 0 && typeof slugData[0].slug === 'string') {
      slug = slugData[0].slug;
    } else if (typeof slugData === 'object' && slugData !== null && typeof slugData.slug === 'string') {
      slug = slugData.slug;
    } else if (typeof slugData === 'string') {
      slug = slugData;
    } else if (slugData !== undefined && slugData !== null) {
      console.error('Unexpected slugData from RPC:', slugData);
    }
    if (typeof slug !== 'string') {
      console.error('Slug is not a string, falling back to generated slug:', slug);
      slug = `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
   
    // Merge founder intro fields into pdf_content
    let pdfContentWithFounder = output.pdf_content;
    if (typeof pdfContentWithFounder === 'object') {
      pdfContentWithFounder = {
        ...pdfContentWithFounder,
        founderName: input.name || '',
        brandName: input.brand_name || '',
        problemStatement: input.problem_statement || '',
        desiredOutcome: input.desired_outcome || ''
      };
    }

    let campaignData;
    try {
      campaignData = {
        user_id: user.id,
        name: `${input.brand_name} - ${input.customer_profile || input.target_audience || 'General'}`,
        customer_profile: input.customer_profile || input.target_audience || 'General',
        problem_statement: input.problem_statement,
        desired_outcome: input.desired_outcome,
        landing_page_slug: slug,
        lead_magnet_title: output.landing_page.headline,
        lead_magnet_content: pdfContentWithFounder, // pass as object
        landing_page_copy: output.landing_page || {}, // pass as object
        social_posts: Array.isArray(output.social_posts) ? output.social_posts : [], // pass as array
        lead_count: 0
      };
    } catch (serr) {
      console.error('Serialization error for campaignData:', serr);
      campaignData = {
        user_id: user.id,
        name: 'Serialization Error',
        customer_profile: 'Error',
        problem_statement: 'Error',
        desired_outcome: 'Error',
        landing_page_slug: slug,
        lead_magnet_title: 'Error',
        lead_magnet_content: {},
        landing_page_copy: {},
        social_posts: [],
        lead_count: 0
      };
    }

    // Log the payload before insert
    console.log('typeof lead_magnet_content:', typeof campaignData.lead_magnet_content);
    console.log('typeof social_posts:', typeof campaignData.social_posts);
    console.log('social_posts content:', campaignData.social_posts);
    console.log('Payload for campaign insert:', campaignData);
    console.log('Payload type:', typeof campaignData, Array.isArray(campaignData));

    const { data, error } = await supabase
      .from('campaigns')
      .insert([campaignData])
      .select()
      .single();

    if (error) {
      console.error('❌ Campaign creation error:', error);
      console.error('❌ Insert payload:', campaignData);
      throw new Error(`Failed to create campaign: ${error.message}`);
    }

    // Increment campaign count after successful creation
    await supabase
      .from('users')
      .update({ campaign_count: (subscription.usedCampaigns || 0) + 1 })
      .eq('id', user.id);

    console.log('✅ Campaign created successfully:', data);
    return data;
  }

  // Get all campaigns for the current user
  static async getCampaigns(): Promise<Campaign[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Authentication required to view campaigns');
    }

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Campaign fetch error:', error);
      throw new Error(`Failed to fetch campaigns: ${error.message}`);
    }

    return data || [];
  }

  // Get a specific campaign by ID
  static async getCampaign(id: string): Promise<Campaign> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Authentication required to view campaigns');
    }

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Campaign fetch error:', error);
      throw new Error(`Failed to fetch campaign: ${error.message}`);
    }

    return data;
  }

  // Get a campaign by slug (for public landing pages)
  static async getCampaignBySlug(slug: string): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('landing_page_slug', slug)
      .single();

    if (error) {
      console.error('Campaign fetch error:', error);
      throw new Error(`Failed to fetch campaign: ${error.message}`);
    }

    return data;
  }

  // Capture a lead
  static async captureLead(campaignId: string, email: string): Promise<Lead> {
    // Removed authentication check for public lead capture
    // Insert the lead
    const { data, error } = await supabase
      .from('leads')
      .insert({
        campaign_id: campaignId,
        email: email
      })
      .select()
      .single();

    if (error) {
      console.error('Lead capture error:', error);
      throw error;
    }

    // Also insert into emails table for automation (optional)
    await supabase
      .from('emails')
      .insert({
        email: email,
        campaign_id: campaignId
      });

    return data;
  }

  // Get leads for a campaign
  static async getLeads(campaignId: string): Promise<Lead[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Authentication required to view leads');
    }

    // Verify the campaign belongs to the user
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single();

    if (!campaign) {
      throw new Error('Campaign not found or access denied');
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('captured_at', { ascending: false });

    if (error) {
      console.error('Leads fetch error:', error);
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }

    return data || [];
  }

  // Export leads as CSV
  static async exportLeadsCSV(campaignId: string): Promise<string> {
    const leads = await this.getLeads(campaignId);
    
    const csvHeader = 'Email,Captured At\n';
    const csvRows = leads.map(lead => 
      `"${lead.email}","${new Date(lead.captured_at).toISOString()}"`
    ).join('\n');
    
    return csvHeader + csvRows;
  }

  // Mark email as sent
  static async markEmailSent(email: string, campaignId: string): Promise<void> {
    const { error } = await supabase
      .from('emails')
      .update({ email_sent: true })
      .eq('email', email)
      .eq('campaign_id', campaignId);

    if (error) {
      console.error('Email update error:', error);
      throw new Error(`Failed to mark email as sent: ${error.message}`);
    }
  }

  // Mark PDF as downloaded
  static async markPDFDownloaded(email: string, campaignId: string): Promise<void> {
    const { error } = await supabase
      .from('emails')
      .update({ pdf_downloaded: true })
      .eq('email', email)
      .eq('campaign_id', campaignId);

    if (error) {
      console.error('PDF update error:', error);
      throw new Error(`Failed to mark PDF as downloaded: ${error.message}`);
    }
  }

  // Get campaign statistics
  static async getCampaignStats(campaignId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // For demo purposes, get stats without user verification
      // Get lead count
      const { count: leadCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId);

      // Get email stats
      const { count: emailCount } = await supabase
        .from('emails')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId);

      const { count: sentEmailCount } = await supabase
        .from('emails')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .eq('email_sent', true);

      const { count: pdfDownloadCount } = await supabase
        .from('emails')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .eq('pdf_downloaded', true);

      return {
        totalLeads: leadCount || 0,
        totalEmails: emailCount || 0,
        emailsSent: sentEmailCount || 0,
        pdfsDownloaded: pdfDownloadCount || 0,
        conversionRate: emailCount ? ((pdfDownloadCount || 0) / emailCount * 100).toFixed(1) : '0'
      };
    }

    // Verify the campaign belongs to the user
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single();

    if (!campaign) {
      throw new Error('Campaign not found or access denied');
    }

    // Get lead count
    const { count: leadCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId);

    // Get email stats
    const { count: emailCount } = await supabase
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId);

    const { count: sentEmailCount } = await supabase
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('email_sent', true);

    const { count: pdfDownloadCount } = await supabase
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('pdf_downloaded', true);

    return {
      totalLeads: leadCount || 0,
      totalEmails: emailCount || 0,
      emailsSent: sentEmailCount || 0,
      pdfsDownloaded: pdfDownloadCount || 0,
      conversionRate: emailCount ? ((pdfDownloadCount || 0) / emailCount * 100).toFixed(1) : '0'
    };
  }
} 