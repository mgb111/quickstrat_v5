import OpenAI from 'openai';
import {
  CampaignInput,
  LeadMagnetConcept,
  ContentOutline,
  PDFContent,
  LandingPageCopy,
  SocialPosts,
  CampaignOutput
} from '../types';

// Get API key from environment variables
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey || apiKey === 'your_openai_api_key') {
  const errorMsg = 'OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.';
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey,
  dangerouslyAllowBrowser: true,
  timeout: 60000,
  defaultHeaders: {
    'x-request-source': 'browser',
    'x-app-name': 'quickstrat-v5'
  }
});

export async function generatePdfContent(input: CampaignInput, outline: ContentOutline): Promise<PDFContent> {
  try {
    const prompt = `Create a comprehensive PDF document for ${input.brand_name} targeting ${input.target_audience}.
    Niche: ${input.niche}
    Pain Point: ${input.pain_point}
    Desired Outcome: ${input.desired_outcome}
    Tone: ${input.tone}
    
    Return a JSON object with this exact structure:
    {
      "title_page": {
        "title": "string",
        "subtitle": "string"
      },
      "introduction_page": {
        "title": "string",
        "content": "string"
      },
      "toolkit_sections": [
        {
          "title": "string",
          "type": "text" | "table" | "checklist" | "pros_and_cons_list" | "scripts",
          "content": {
            // Content structure varies by type
          }
        }
      ],
      "cta_page": {
        "title": "string",
        "content": "string"
      }
    }`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content creator that generates detailed, structured PDF content. Output must be valid JSON matching the specified structure.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    let parsedContent: any;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse the generated content');
    }

    // Validate required sections exist
    if (!parsedContent.title_page || !parsedContent.introduction_page || 
        !parsedContent.toolkit_sections || !parsedContent.cta_page) {
      throw new Error('Generated content is missing required sections');
    }

    // Transform and validate the response
    const pdfContent: PDFContent = {
      title_page: {
        title: parsedContent.title_page?.title || `Guide for ${input.brand_name}`,
        subtitle: parsedContent.title_page?.subtitle || 'Strategic Guide'
      },
      introduction_page: {
        title: parsedContent.introduction_page?.title || 'Introduction',
        content: parsedContent.introduction_page?.content || 
          `This guide provides strategic insights for ${input.brand_name} targeting ${input.target_audience}.`
      },
      toolkit_sections: (parsedContent.toolkit_sections || []).map((section: any, index: number) => {
        // Create a properly typed section based on the type
        const sectionTitle = section.title || `Section ${index + 1}`;
        const sectionType = (['text', 'table', 'checklist', 'pros_and_cons_list', 'scripts'].includes(section.type) 
          ? section.type 
          : 'text') as 'text' | 'table' | 'checklist' | 'pros_and_cons_list' | 'scripts';
        
        // Initialize content with proper typing
        let content: any;
        
        switch (sectionType) {
          case 'table':
            content = {
              headers: Array.isArray(section.content?.headers) ? section.content.headers : [],
              rows: Array.isArray(section.content?.rows) ? section.content.rows : []
            };
            break;
            
          case 'checklist':
            content = {
              phases: Array.isArray(section.content?.phases) ? section.content.phases : []
            };
            break;
            
          case 'pros_and_cons_list':
            content = {
              items: Array.isArray(section.content?.items) ? section.content.items : []
            };
            break;
            
          case 'scripts':
            content = {
              scenarios: Array.isArray(section.content?.scenarios) 
                ? section.content.scenarios.map((s: any) => ({
                    trigger: s.trigger || '',
                    response: s.response || '',
                    explanation: s.explanation || ''
                  }))
                : []
            };
            break;
            
          default: // text
            content = {
              text: typeof section.content?.text === 'string' ? section.content.text : ''
            };
        }
        
        return {
          title: sectionTitle,
          type: sectionType,
          content
        } as const;
      }),
      cta_page: {
        title: parsedContent.cta_page?.title || 'Take Action',
        content: parsedContent.cta_page?.content || 
          `Ready to implement these strategies? Contact ${input.brand_name} today to get started.`
      }
    };

    // Validate toolkit sections
    if (pdfContent.toolkit_sections.length < 3 || pdfContent.toolkit_sections.length > 4) {
      throw new Error('Must have 3-4 toolkit sections');
    }

    // Validate each toolkit section
    for (const section of pdfContent.toolkit_sections) {
      if (!section.title || !section.type) {
        throw new Error('Each toolkit section must have a title and type');
      }

      // TypeScript now knows the exact shape of content based on section.type
      // No need for additional validation as we've already ensured proper types
    }

    return pdfContent;
  } catch (error) {
    console.error('Error in generatePdfContent:', error);
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (error.message.includes('API key')) {
        throw new Error('Invalid API key. Please check your configuration.');
      }
    }
    throw new Error('Failed to generate PDF content. Please try again later.');
  }
}

// Stub implementations for other functions
export async function generateLeadMagnetConcepts(input: CampaignInput): Promise<LeadMagnetConcept[]> {
  return [];
}

export async function generateContentOutline(input: CampaignInput, selected: LeadMagnetConcept): Promise<ContentOutline> {
  return {} as ContentOutline;
}

export async function generateLandingPageCopy(input: CampaignInput, outline: ContentOutline): Promise<LandingPageCopy> {
  return {} as LandingPageCopy;
}

export async function generateSocialPosts(input: CampaignInput, outline: ContentOutline): Promise<SocialPosts> {
  return {} as SocialPosts;
}

export async function generateFinalCampaign(input: CampaignInput, outline: ContentOutline): Promise<CampaignOutput> {
  return {} as CampaignOutput;
}
