export interface CampaignInput {
  name?: string; // Add name for personalization
  brand_name: string;
  target_audience: string;
  niche: string;
  problem_statement: string;
  desired_outcome: string;
  tone?: string;
  position?: string;
  // Legacy fields for backward compatibility (optional)
  customer_profile?: string;
  customer_problems?: string;
  industry?: string;
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
  reddit: string;
}

export interface PDFContent {
  founder_intro?: string;
  title: string;
  introduction: string;
  sections: {
    title: string;
    content: string;
  }[];
  cta: string;
  structured_content: {
    title_page: {
      layout?: 'centered' | 'filled';
      title: string;
      subtitle: string;
    };
    introduction_page: {
      layout?: 'centered' | 'filled';
      title: string;
      content: string;
    };
    toolkit_sections: {
      layout?: 'centered' | 'filled';
      type?: 'pros_and_cons_list' | 'checklist' | 'scripts';
      title: string;
      content: string | {
        items?: {
          method_name: string;
          pros: string;
          cons: string;
          case_study?: string;
          template?: string;
        }[];
        phases?: {
          phase_title: string;
          items: string[];
        }[];
        scenarios?: {
          trigger: string;
          response: string;
          explanation: string;
          case_study?: string;
          template?: string;
        }[];
        case_study?: string;
        example?: string;
        template?: string;
      };
    }[];
    cta_page: {
      layout?: 'centered' | 'filled';
      title: string;
      content: string;
    };
  };
  // Branding and CTA customization fields
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  website?: string;
  founderName: string;
  brandName: string;
  problemStatement: string;
  desiredOutcome: string;
  bookingLink?: string;
  supportEmail?: string;
  position?: string;
}

export interface CampaignOutput {
  pdf_content: string | PDFContent;
  landing_page: LandingPage;
  social_posts: SocialPosts;
}

export interface PDFCustomization {
  ctaText?: string;
  mainAction?: string;
  bookingLink?: string;
  website?: string;
  supportEmail?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  font?: string;
}

export type WizardState = {
  stage: 'input' | 'concept-selection' | 'outline-review' | 'upgrade-required' | 'complete';
  input: CampaignInput | null;
  concepts: LeadMagnetConcept[] | null;
  selectedConcept: LeadMagnetConcept | null;
  outline: ContentOutline | null;
  finalOutput: CampaignOutput | null;
  customization?: PDFCustomization | null;
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
  lead_magnet_content: string | PDFContent | null;
  landing_page_copy: LandingPageCopy | null;
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