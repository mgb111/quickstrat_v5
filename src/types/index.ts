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

// Base section interface
export interface BaseSection {
  type: string;
  title?: string;
  content?: any; // Fallback for any content structure
}

// Section types
export interface ChecklistSection extends BaseSection {
  type: 'checklist';
  content: {
    phases: Array<{
      phase_title: string;
      items: string[];
    }>;
  };
}

export interface ProsAndConsSection extends BaseSection {
  type: 'pros_and_cons_list';
  content: {
    items: Array<{
      method_name: string;
      pros: string[];
      cons: string[];
    }>;
  };
}

export interface ScriptsSection extends BaseSection {
  type: 'scripts';
  content: {
    scenarios: Array<{
      trigger: string;
      response: string;
      explanation: string;
    }>;
  };
}

export interface TableSection extends BaseSection {
  type: 'table';
  content: {
    headers: string[];
    rows: string[][];
  };
}

export type ToolkitSection = ChecklistSection | ProsAndConsSection | ScriptsSection | TableSection;

export interface PDFContent {
  title_page: {
    title: string;
    subtitle: string;
  };
  introduction_page: {
    title: string;
    content: string;
  };
  toolkit_sections: ToolkitSection[];
  cta_page: {
    title: string;
    content: string;
  };
}

export interface SocialPosts {
  linkedin: string;
  twitter: string;
  instagram: string;
}

export interface LandingPageCopy {
  headline: string;
  subheadline: string;
  benefits: string[];
  cta: string;
  seo_meta_description: string;
}


export interface CampaignOutput {
  pdf_content: PDFContent;
  landing_page: {
    headline: string;
    subheadline: string;
    benefit_bullets: string[];
    cta_button_text: string;
  };
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