export interface CampaignInput {
  niche: string;
  pain_point: string;
  desired_outcome: string;
  brand_name: string;
  tone: string;
  target_audience: string;
}

export interface ContentBlock {
  id: string;
  title: string;
  description: string;
  category: string;
  selected: boolean;
  userNote?: string;
  expandedContent?: string;
  approved?: boolean;
}

export interface ContentCategory {
  id: string;
  title: string;
  description: string;
  maxSelections?: number;
  blocks: ContentBlock[];
}

export interface IdeaBank {
  categories: ContentCategory[];
}

export interface PDFContent {
  title_page: {
    title: string;
    subtitle: string;
  };
  introduction: string;
  sections: {
    title: string;
    content: string;
  }[];
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

export interface WizardState {
  stage: 'input' | 'curation' | 'review' | 'complete';
  input: CampaignInput | null;
  ideaBank: IdeaBank | null;
  selectedBlocks: ContentBlock[];
  finalOutput: CampaignOutput | null;
}

export interface Campaign {
  id?: string;
  created_at?: string;
  input: CampaignInput;
  output: CampaignOutput;
  status: 'generating' | 'completed' | 'error';
}