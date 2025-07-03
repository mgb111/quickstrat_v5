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
      landing_page_copy: landingPageCopy,
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
You are a B2B lead magnet writer. Expand the approved outline into detailed PDF content.

User Context:
- Title: ${outline.title}
- Introduction: ${outline.introduction}
- Core Points: ${JSON.stringify(outline.core_points)}
- CTA: ${outline.cta}
- Target Audience: ${input.target_audience}
- Niche: ${input.niche}
- Brand: ${input.brand_name}

Instructions:
1. The PDF will have a clear title and 4 educational sections based on the core points.
2. For each core point, write a section with a title and a clear, structured paragraph (80–100 words).
   - Use bullet points, numbered lists, or examples **inside the paragraph**, but do not change the JSON structure.
3. Maintain this exact JSON format:

{
  "title": "Same as input title",
  "introduction": "60-word intro from outline",
  "sections": [
    {
      "title": "Section Title 1 (Based on Core Point 1)",
      "content": "Expanded, detailed content (~80–100 words)"
    },
    {
      "title": "Section Title 2 (Based on Core Point 2)",
      "content": "..."
    },
    {
      "title": "Section Title 3 (Based on Core Point 3)",
      "content": "..."
    },
    {
      "title": "Section Title 4 (Based on Core Point 4)",
      "content": "..."
    }
  ],
  "cta": "40–60 word closing CTA from outline"
}

Important:
- Output must be valid JSON.
- DO NOT nest additional fields like 'format', 'scripts', 'items', etc.
- Keep 'sections' as a flat array of { title, content }.
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
You are a direct-response copywriter.

Your job is to write high-converting landing page copy for a downloadable B2B lead magnet.

User Context:
- Lead Magnet Title: ${outline.title}
- Core Points: ${JSON.stringify(outline.core_points)}
- Target Audience: ${input.target_audience}
- Brand Name: ${input.brand_name}

Instructions:
Return ONLY valid JSON in the format below.
Do not include any explanation or extra text.

{
  "headline": "Strong, benefit-driven headline that highlights the outcome the audience will get",
  "subheadline": "Clarifying subheadline that builds urgency and expands on the headline",
  "benefit_bullets": [
    "Benefit 1: Short, punchy, outcome-focused",
    "Benefit 2: Short, punchy, outcome-focused",
    "Benefit 3: Short, punchy, outcome-focused"
  ],
  "cta_button_text": "Download the Toolkit"
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