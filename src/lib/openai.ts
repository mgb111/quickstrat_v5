import OpenAI from 'openai';
import { CampaignInput, LeadMagnetConcept, ContentOutline, PdfContent, LandingPageCopy, SocialPosts, CampaignOutput } from '../types';

// Check if API key is available
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey || apiKey === 'your_openai_api_key') {
  console.warn('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
}

const openai = apiKey && apiKey !== 'your_openai_api_key' ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
}) : null;

/**
 * PHASE 1: Generate a list of focused, tool-based lead magnet concepts for the user to choose from.
 */
export async function generateLeadMagnetConcepts(input: CampaignInput): Promise<LeadMagnetConcept[]> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file with your actual API key.');
  }

  const prompt = `
You are a lead generation expert. Based on the user's inputs, generate 6 unique lead magnet concepts.

User Context:
- Niche: ${input.niche}
- Customer Pain Point: ${input.pain_point}
- Desired Outcome: ${input.desired_outcome}
- Target Audience: ${input.target_audience}

Each concept must be framed as a practical TOOL (checklist, template, cheat sheet, guide, action plan, etc.).

Requirements:
- Each concept should solve ONE specific problem related to their pain point.
- Frame as actionable tools, not general guides.
- Make them specific to their niche and audience.
- Ensure each is distinct and valuable.

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

/**
 * PHASE 2: Generate a reviewable content outline based on the user's single selected concept.
 */
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

/**
 * PHASE 3: Generate the complete campaign by orchestrating all three specialists.
 */
export async function generateFinalCampaign(
  input: CampaignInput,
  outline: ContentOutline
): Promise<CampaignOutput> {
  try {
    // Run all three specialist functions concurrently
    const [pdfContent, landingPageCopy, socialPosts] = await Promise.all([
      generatePdfContent(input, outline),
      generateLandingPageCopy(input, outline),
      generateSocialPosts(input, outline)
    ]);

    // Combine results into final campaign output
    return {
      pdf_content: pdfContent,
      landing_page: landingPageCopy,
      social_posts: socialPosts
    };
  } catch (error: any) {
    console.error('Error generating final campaign:', error?.message || error);
    throw new Error('Failed to generate final campaign. Please try again.');
  }
}

/**
 * PHASE 3, SPECIALIST 1: The Writer - Expands the outline into final PDF content.
 */
export async function generatePdfContent(
    input: CampaignInput, // Pass input for full context if needed later
    outline: ContentOutline
): Promise<PdfContent> {
    if (!openai) {
        throw new Error('OpenAI API key not configured.');
    }

    const prompt = `
You are a clear and concise educational writer. Your task is to expand the approved outline into the final content for a lead magnet PDF.

Approved Outline:
- Title: ${outline.title}
- Introduction: ${outline.introduction}
- Core Points: ${JSON.stringify(outline.core_points)}
- CTA: ${outline.cta}

CRITICAL INSTRUCTIONS:
1. For EACH core point provided, expand it into its own detailed, educational paragraph.
2. Each paragraph must be 60-80 words.
3. The content must be purely educational with NO promotional language.

Return JSON in this exact format:
{
  "title": "${outline.title}",
  "introduction": "${outline.introduction}",
  "sections": [
    {
      "title": "The first core point from the outline",
      "content": "The 60-80 word expanded paragraph for the first core point."
    },
    {
      "title": "The second core point from the outline",
      "content": "The 60-80 word expanded paragraph for the second core point."
    }
  ],
  "cta": "${outline.cta}"
}
`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a clear and concise educational writer. Output strictly valid JSON as defined.'
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

        return JSON.parse(content);
    } catch (error: any) {
        console.error('OpenAI error:', error?.message || error);
        throw new Error('Failed to generate PDF content. Please try again.');
    }
}

/**
 * PHASE 3, SPECIALIST 2: The Marketer - Creates landing page copy.
 */
export async function generateLandingPageCopy(
    input: CampaignInput,
    outline: ContentOutline
): Promise<LandingPageCopy> {
    if (!openai) {
        throw new Error('OpenAI API key not configured.');
    }

    const prompt = `
You are a direct-response copywriter. Your task is to create high-converting copy for a landing page to promote a lead magnet.

Lead Magnet Outline:
- Title: ${outline.title}
- Core Points: ${JSON.stringify(outline.core_points)}
- Target Audience: ${input.target_audience}

INSTRUCTIONS:
1. Write a compelling headline that focuses on the ultimate benefit for the target audience.
2. Write a subheadline that clarifies the offer.
3. Convert the 'core_points' (which are features) into 3-4 powerful 'benefit_bullets'.
4. Write a strong, action-oriented CTA button text.

Return JSON in this exact format:
{
  "headline": "Compelling headline for landing page",
  "subheadline": "Supporting subheadline that builds desire",
  "benefit_bullets": [
    "Benefit-driven bullet point 1",
    "Benefit-driven bullet point 2",
    "Benefit-driven bullet point 3"
  ],
  "cta_button_text": "Download The Toolkit Now"
}
`;
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a direct-response copywriter. Output strictly valid JSON as defined.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        const content = response.choices?.[0]?.message?.content;
        if (!content) throw new Error('Empty response from OpenAI');

        return JSON.parse(content);
    } catch (error: any) {
        console.error('OpenAI error:', error?.message || error);
        throw new Error('Failed to generate landing page copy. Please try again.');
    }
}

/**
 * PHASE 3, SPECIALIST 3: The Social Media Manager - Creates promotional social posts.
 */
export async function generateSocialPosts(
    input: CampaignInput,
    outline: ContentOutline
): Promise<SocialPosts> {
    if (!openai) {
        throw new Error('OpenAI API key not configured.');
    }

    const prompt = `
You are a social media manager. Your task is to create promotional posts for a new lead magnet.

Lead Magnet Title: ${outline.title}
Target Audience: ${input.target_audience}
Brand Name: ${input.brand_name}

INSTRUCTIONS:
Create three distinct social media posts to drive downloads.
1. LinkedIn: Professional, highlights a key problem and solution for the target audience.
2. Twitter: Punchy, direct, and uses a strong hook (under 280 characters).
3. Instagram: Engaging, asks a question to drive comments and interaction.

Return JSON in this exact format:
{
  "linkedin": "A professional LinkedIn post with a hook, value proposition, and a clear call-to-action.",
  "twitter": "A short, punchy Twitter post (under 280 chars) designed to grab attention quickly.",
  "instagram": "An engaging Instagram caption that asks a question related to the audience's pain point."
}
`;
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a social media manager. Output strictly valid JSON as defined.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.8, // Slightly higher for creative social posts
            max_tokens: 1200
        });

        const content = response.choices?.[0]?.message?.content;
        if (!content) throw new Error('Empty response from OpenAI');

        return JSON.parse(content);
    } catch (error: any) {
        console.error('OpenAI error:', error?.message || error);
        throw new Error('Failed to generate social posts. Please try again.');
    }
}