export interface CampaignInput {
  niche: string;
  pain_point: string;
  desired_outcome: string;
  brand_name: string;
  tone: string;
  target_audience: string;
}

export interface PDFContent {
  title_page: {
    title: string;
    subtitle: string;
  };
  introduction: string;
  key_solutions: {
    solution1: string;
    solution2: string;
    solution3: string;
  };
  actionable_takeaways: string;
  cta: string;
}

export interface LandingPageContent {
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

export interface CampaignOutput {
  pdf_content: PDFContent;
  landing_page: LandingPageContent;
  social_posts: SocialPosts;
}

export interface Campaign {
  id?: string;
  created_at?: string;
  input: CampaignInput;
  output: CampaignOutput;
  status: 'generating' | 'completed' | 'error';
}