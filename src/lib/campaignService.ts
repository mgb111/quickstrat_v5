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

  // Save or update a campaign draft up to outline-review
  static async saveDraftCampaign({ input, concepts, selectedConcept, outline }: {
    input: CampaignInput,
    concepts?: any,
    selectedConcept?: any,
    outline?: any
  }): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required to save campaign drafts');
    // Ensure user exists in users table before saving draft
    await SubscriptionService.getUserSubscription(user.id);
    // Final explicit check: confirm user id exists in users table
    const { data: userCheck, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
    if (!userCheck || userCheckError) {
      throw new Error('User record not found in users table. Aborting draft save to prevent foreign key error.');
    }
    // Generate a unique slug for the draft
    const slug = `draft-${user.id}-${Date.now()}`;
    // Try to find an existing draft for this user and input (by name/brand_name)
    const { data: existing, error: fetchError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'draft')
      .eq('name', input.brand_name)
      .maybeSingle();
    const draftData = {
      user_id: user.id,
      name: input.brand_name,
      customer_profile: input.customer_profile || input.target_audience || 'General',
      problem_statement: input.problem_statement,
      desired_outcome: input.desired_outcome,
      status: 'draft',
      lead_magnet_title: null,
      lead_magnet_content: null,
      landing_page_copy: null,
      social_posts: null,
      outline: outline ? JSON.stringify(outline) : null,
      concepts: concepts ? JSON.stringify(concepts) : null,
      selected_concept: selectedConcept ? JSON.stringify(selectedConcept) : null,
      landing_page_slug: slug // Always set a slug for drafts
    };
    if (existing && existing.id) {
      // Update existing draft
      const { data, error } = await supabase
        .from('campaigns')
        .update(draftData)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw new Error('Failed to update draft: ' + error.message);
      return data;
    } else {
      // Insert new draft
      const { data, error } = await supabase
        .from('campaigns')
        .insert([draftData])
        .select()
        .single();
      if (error) throw new Error('Failed to save draft: ' + error.message);
      return data;
    }
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
} // End of CampaignService class