export interface CampaignInput {
  brand_name: string;
  target_audience: string;
  customer_problems: string;
  industry?: string;
  tone?: string;
  // Keep legacy fields for backward compatibility
  customer_profile?: string;
  problem_statement?: string;
  desired_outcome?: string;
  niche?: string;
  pain_point?: string;
}

export interface LeadMagnetConcept {
  id: string;
  title: string;
  description: string;
  value_proposition: string;
  target_audience: string;
  format: string;
}

export interface ContentOutline {
  title: string;
  sections: {
    title: string;
    content: string;
    key_points: string[];
  }[];
  estimated_length: string;
  target_audience: string;
  main_value_proposition: string;
  introduction: string;
  core_points: string[];
}

export interface LandingPage {
  headline: string;
  subheadline: string;
  benefit_bullets: string[];
  cta_button_text: string;
}

export interface LandingPageCopy {
  headline: string;
  subheadline: string;
  benefit_bullets: string[];
  cta_button_text: string;
}

export interface SocialPosts {
  linkedin: string;
  twitter: string;
  instagram: string;
}

export interface PDFContent {
  title: string;
  introduction: string;
  sections: {
    title: string;
    content: string;
  }[];
  cta: string;
  structured_content?: any;
}

export interface CampaignOutput {
  pdf_content: string;
  landing_page: LandingPage;
  social_posts: SocialPosts;
}

export type WizardState = {
  stage: 'input' | 'concept-selection' | 'outline-review' | 'complete';
  input: CampaignInput | null;
  concepts: LeadMagnetConcept[] | null;
  selectedConcept: LeadMagnetConcept | null;
  outline: ContentOutline | null;
  finalOutput: CampaignOutput | null;
};

export interface Campaign {
  id: string;
  name: string;
  customer_profile: string;
  problem_statement: string;
  desired_outcome: string;
  landing_page_slug: string;
  lead_count: number;
  lead_magnet_title: string | null;
  lead_magnet_content: string | null;
  landing_page_copy: any | null;
  social_posts: string[] | null;
  created_at: string;
}

export interface Lead {
  id: string;
  campaign_id: string;
  email: string;
  captured_at: string;
}

export interface User {
  id: string;
  email: string;
  plan: string;
  campaign_count: number;
  created_at: string;
} 