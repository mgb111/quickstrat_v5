import OpenAI from 'openai';
import { CampaignInput, LeadMagnetConcept, ContentOutline, CampaignOutput } from '../types';

// Check if API key is available
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey || apiKey === 'your_openai_api_key') {
  console.warn('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
}

const openai = apiKey && apiKey !== 'your_openai_api_key' ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
}) : null;

export async function generateLeadMagnetConcepts(input: CampaignInput): Promise<LeadMagnetConcept[]> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file with your actual API key.');
  }

  const prompt = `
You are a lead generation expert. Based on the user's inputs, generate 5-7 unique lead magnet concepts.

User Context:
- Niche: ${input.niche}
- Customer Pain Point: ${input.pain_point}
- Desired Outcome: ${input.desired_outcome}
- Target Audience: ${input.target_audience}

Each concept must be framed as a practical TOOL (checklist, template, cheat sheet, guide, action plan, etc.).

Requirements:
- Each concept should solve ONE specific problem related to their pain point
- Frame as actionable tools, not general guides
- Make them specific to their niche and audience
- Ensure each is distinct and valuable

Return JSON in this exact format:
{
  "concepts": [
    {
      "id": "concept-1",
      "title": "A [Tool Type] for [Specific Problem]",
      "description": "Brief description of what this tool accomplishes (15-25 words)"
    }
  ]
}

Generate exactly 6 concepts.
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
      max_tokens: 1500
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    const parsed = JSON.parse(content);
    return parsed.concepts;
  } catch (error: any) {
    console.error('OpenAI error:', error?.message || error);
    throw new Error('Failed to generate lead magnet concepts. Please try again.');
  }
}

export async function generateContentOutline(
  input: CampaignInput,
  selectedConcept: LeadMagnetConcept
): Promise<ContentOutline> {
  if (!openai) {
    throw new Error('OpenAI API key not configured.');
  }

  const prompt = `
You are creating a content outline for a lead magnet.

User Context:
- Niche: ${input.niche}
- Target Audience: ${input.target_audience}
- Tone: ${input.tone}
- Brand: ${input.brand_name}

Selected Concept: "${selectedConcept.title}"
Concept Description: "${selectedConcept.description}"

Generate a content outline with these components:

1. Title: A sharp, specific headline (8-12 words)
2. Introduction: A concise hook that states the problem this tool solves (40-60 words)
3. Core Points: 4-6 bullet points outlining key steps/points (10-15 words each)
4. CTA: A brief call-to-action offering next steps (25-40 words)

Return JSON in this exact format:
{
  "title": "The [Tool Name]: [Specific Benefit]",
  "introduction": "40-60 word introduction that hooks and states the problem",
  "core_points": [
    "First key point or step (10-15 words)",
    "Second key point or step (10-15 words)",
    "Third key point or step (10-15 words)",
    "Fourth key point or step (10-15 words)"
  ],
  "cta": "25-40 word call-to-action with logical next step"
}
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
      max_tokens: 800
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    return JSON.parse(content);
  } catch (error: any) {
    console.error('OpenAI error:', error?.message || error);
    throw new Error('Failed to generate content outline. Please try again.');
  }
}

export async function generateFinalCampaign(
  input: CampaignInput,
  outline: ContentOutline
): Promise<CampaignOutput> {
  if (!openai) {
    throw new Error('OpenAI API key not configured.');
  }

  const prompt = `
You are creating the final lead magnet campaign.

User Context:
- Niche: ${input.niche}
- Target Audience: ${input.target_audience}
- Tone: ${input.tone}
- Brand: ${input.brand_name}

Approved Outline:
- Title: ${outline.title}
- Introduction: ${outline.introduction}
- Core Points: ${outline.core_points.join('; ')}
- CTA: ${outline.cta}

Tasks:
1. Expand each core point into a detailed paragraph (60-80 words each)
2. Create landing page copy
3. Create social media posts

CRITICAL: Content must be purely educational with NO promotional language for any specific brand.

Return JSON in this exact format:
{
  "pdf_content": {
    "title": "${outline.title}",
    "introduction": "${outline.introduction}",
    "sections": [
      {
        "title": "First core point as section title",
        "content": "60-80 word expanded paragraph"
      }
    ],
    "cta": "${outline.cta}"
  },
  "landing_page": {
    "headline": "Compelling headline for landing page",
    "subheadline": "Supporting subheadline",
    "benefit_bullets": ["Benefit 1", "Benefit 2", "Benefit 3"],
    "cta_button_text": "Download button text"
  },
  "social_posts": {
    "linkedin": "LinkedIn post with hook, value, and CTA",
    "twitter": "Twitter post - punchy and direct",
    "instagram": "Instagram post with engagement"
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
      max_tokens: 2500
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    return JSON.parse(content);
  } catch (error: any) {
    console.error('OpenAI error:', error?.message || error);
    throw new Error('Failed to generate final campaign. Please try again.');
  }
}