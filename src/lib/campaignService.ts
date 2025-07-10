import { supabase } from './supabase';
import { Campaign, Lead, CampaignInput, CampaignOutput } from '../types';

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

    console.log('✅ User authenticated:', user.email);
    console.log('🆔 User ID:', user.id);

    // Check if user exists in public.users table
    console.log('🔍 Checking if user exists in public.users table...');
    const { data: publicUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    console.log('📊 User check result:', { 
      publicUser, 
      userError, 
      userId: user.id,
      hasUser: !!publicUser,
      errorMessage: userError?.message 
    });

    // If user doesn't exist in public.users, create them
    if (!publicUser) {
      console.log('➕ Creating user record for:', user.id, user.email);
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Failed to create user record:', insertError);
        console.error('❌ Error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        throw new Error(`Failed to initialize user profile: ${insertError.message}`);
      }

      console.log('✅ User record created successfully:', newUser);
    } else {
      console.log('✅ User record already exists:', publicUser);
    }

    // Generate unique slug
    console.log('🔗 Generating unique slug...');
    const { data: slugData } = await supabase.rpc('generate_unique_slug');
    const slug = slugData || `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🔗 Generated slug:', slug);

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

    const campaignData = {
      user_id: user.id,
      name: `${input.brand_name} - ${input.customer_profile || input.target_audience || 'General'}`,
      customer_profile: input.customer_profile || input.target_audience || 'General',
      problem_statement: input.problem_statement,
      desired_outcome: input.desired_outcome,
      landing_page_slug: slug,
      lead_magnet_title: output.landing_page.headline,
      lead_magnet_content: pdfContentWithFounder,
      landing_page_copy: output.landing_page,
      social_posts: [
        output.social_posts.linkedin,
        output.social_posts.twitter,
        output.social_posts.instagram
      ]
    };

    console.log('📊 Campaign data prepared:', {
      user_id: campaignData.user_id,
      name: campaignData.name,
      slug: campaignData.landing_page_slug,
      hasContent: !!campaignData.lead_magnet_content
    });

    console.log('💾 Inserting campaign into database...');
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single();

    if (error) {
      console.error('❌ Campaign creation error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to create campaign: ${error.message}`);
    }

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