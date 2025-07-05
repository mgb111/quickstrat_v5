export interface CampaignInput {
  niche: string;
  pain_point: string;
  desired_outcome: string;
  brand_name: string;
  tone: string;
  target_audience: string;
}

export interface LeadMagnetConcept {
  id: string;
  title: string;
  description: string;
}

export interface ContentOutline {
  title: string;
  introduction: string;
  core_points: string[];
  cta: string;
}

export interface PDFContent {
  title: string;
  introduction: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  cta: string;
}

export interface SocialPosts {
  linkedin: string;
  twitter: string;
  instagram: string;
}

export interface LandingPageCopy {
  headline: string;
  subheadline: string;
  benefit_bullets: string[];
  cta_button_text: string;
}

export interface CampaignOutput {
  pdf_content: PDFContent;
  landing_page: LandingPageCopy;
  social_posts: SocialPosts;
}

export interface WizardState {
  stage: 'input' | 'concept-selection' | 'outline-review' | 'complete';
  input: CampaignInput | null;
  concepts: LeadMagnetConcept[] | null;
  selectedConcept: LeadMagnetConcept | null;
  outline: ContentOutline | null;
  finalOutput: CampaignOutput | null;
}