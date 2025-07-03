import OpenAI from 'openai';
import { CampaignInput, IdeaBank, ContentBlock, CampaignOutput } from '../types';

// Check if API key is available
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey || apiKey === 'your_openai_api_key') {
  console.warn('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
}

const openai = apiKey && apiKey !== 'your_openai_api_key' ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
}) : null;

export async function generateIdeaBank(input: CampaignInput): Promise<IdeaBank> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file with your actual API key.');
  }

  const prompt = `
You are an expert content strategist and lead generation specialist.

Your task is to generate an "Idea Bank" - a curated collection of potential content blocks that an expert can choose from to build their lead magnet.

User Context:
- Niche: ${input.niche}
- Customer Pain Point: ${input.pain_point}
- Desired Outcome: ${input.desired_outcome}
- Brand Name: ${input.brand_name}
- Tone: ${input.tone}
- Target Audience: ${input.target_audience}

Generate content block suggestions organized into these categories:

1. "Core Solutions & Strategies" (user can select up to 5)
2. "Expert Insights & Contrarian Views" (user can select up to 2)
3. "Tools & Templates" (user can select up to 3)
4. "Quick Wins & Immediate Actions" (user can select up to 4)

For each content block, provide:
- A clear, specific title (8-12 words)
- A brief description explaining what this block would cover (20-30 words)

Make each suggestion:
- Highly specific to their niche and pain point
- Actionable and practical
- Something an expert would want to elaborate on
- Valuable enough to include in a premium lead magnet

Return JSON in this exact format:
{
  "categories": [
    {
      "id": "core-solutions",
      "title": "Core Solutions & Strategies",
      "description": "Fundamental approaches and methodologies to solve the core problem",
      "maxSelections": 5,
      "blocks": [
        {
          "id": "solution-1",
          "title": "Specific solution title here",
          "description": "Brief description of what this solution covers",
          "category": "core-solutions"
        }
      ]
    }
  ]
}

Generate 6-8 blocks per category. Make them highly relevant and specific to the user's inputs.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a content strategist. Output strictly valid JSON as defined.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    const parsed = JSON.parse(content);
    
    // Add missing properties to each block
    parsed.categories.forEach((category: any) => {
      category.blocks.forEach((block: any) => {
        block.selected = false;
        block.userNote = '';
        block.expandedContent = '';
        block.approved = false;
      });
    });

    return parsed;
  } catch (error: any) {
    console.error('OpenAI error:', error?.message || error);
    throw new Error('Failed to generate idea bank. Please try again.');
  }
}

export async function expandContentBlock(
  block: ContentBlock, 
  input: CampaignInput, 
  userNote?: string
): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API key not configured.');
  }

  const prompt = `
You are writing a section for a professional lead magnet PDF.

Context:
- Niche: ${input.niche}
- Target Audience: ${input.target_audience}
- Tone: ${input.tone}
- Brand: ${input.brand_name}

Selected Topic: "${block.title}"
Topic Description: "${block.description}"
${userNote ? `User's Additional Context: "${userNote}"` : ''}

Write a detailed, actionable section of 150-200 words that:
- Provides specific, implementable advice
- Includes concrete examples or steps where relevant
- Maintains the specified tone
- Feels valuable and expert-level
- Is ready for inclusion in a professional PDF

Do not include section headers or titles - just the content paragraph(s).
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content writer. Write clear, actionable content.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    return content.trim();
  } catch (error: any) {
    console.error('OpenAI error:', error?.message || error);
    throw new Error('Failed to expand content block. Please try again.');
  }
}

export async function generateFinalCampaign(
  input: CampaignInput,
  selectedBlocks: ContentBlock[]
): Promise<CampaignOutput> {
  if (!openai) {
    throw new Error('OpenAI API key not configured.');
  }

  // Create sections from approved blocks
  const sections = selectedBlocks
    .filter(block => block.approved && block.expandedContent)
    .map(block => ({
      title: block.title,
      content: block.expandedContent!
    }));

  const prompt = `
You are a lead generation expert creating the final components for a lead magnet campaign.

Context:
- Niche: ${input.niche}
- Customer Pain Point: ${input.pain_point}
- Desired Outcome: ${input.desired_outcome}
- Brand Name: ${input.brand_name}
- Tone: ${input.tone}
- Target Audience: ${input.target_audience}

The user has already created and approved the main content sections. Now generate:

1. PDF Title Page (title + subtitle)
2. PDF Introduction (2-3 paragraphs)
3. Actionable Takeaways section
4. Call-to-Action section
5. Landing page copy
6. Social media posts

Return JSON in this exact format:
{
  "pdf_content": {
    "title_page": {
      "title": "Compelling, specific title for the lead magnet",
      "subtitle": "Subtitle that clarifies the value and audience"
    },
    "introduction": "2-3 paragraph introduction that hooks the reader and sets up the content",
    "actionable_takeaways": "A practical action plan or next steps section",
    "cta": "Call-to-action that bridges the value provided to a sales conversation"
  },
  "landing_page": {
    "headline": "Compelling headline for the landing page",
    "subheadline": "Supporting subheadline",
    "benefit_bullets": ["Benefit 1", "Benefit 2", "Benefit 3"],
    "cta_button_text": "Download button text"
  },
  "social_posts": {
    "linkedin": "LinkedIn post with hook, value, and CTA",
    "twitter": "Twitter post - punchy and direct",
    "instagram": "Instagram carousel-style post"
  }
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a conversion copywriter. Output strictly JSON as defined.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    const parsed = JSON.parse(content);
    
    // Add the user-created sections to the PDF content
    parsed.pdf_content.sections = sections;

    return parsed;
  } catch (error: any) {
    console.error('OpenAI error:', error?.message || error);
    throw new Error('Failed to generate final campaign. Please try again.');
  }
}