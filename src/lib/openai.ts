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
import OpenAI from 'openai';
import { CampaignInput, LeadMagnetConcept, AplusToolkit } from '../types'; // Assuming AplusToolkit is a new type for the final output

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
 * The "A+ Toolkit" Generator.
 * This single function takes the user's context and selected concept,
 * and generates the complete, final, tool-rich PDF content in one step.
 * This replaces the previous outline-and-expand workflow.
 */
export async function generateAplusToolkitContent(
  input: CampaignInput,
  selectedConcept: LeadMagnetConcept
): Promise<AplusToolkit> {
  if (!openai) {
    throw new Error('OpenAI API key not configured.');
  }

  const prompt = `
You are an expert Instructional Designer and a world-class Conversion Copywriter. Your one and only task is to generate the COMPLETE AND FINAL content for an A+ grade, high-value lead magnet based on the user's selected concept.

USER CONTEXT:
- Niche: ${input.niche}
- Target Audience: ${input.target_audience}
- Tone: ${input.tone}
- Selected Concept: A lead magnet about "${selectedConcept.title}"

CORE PRINCIPLES (NON-NEGOTIABLE):
1.  EXTREME VALUE: Every section must be a tangible, practical tool. Do not just state what to do; provide the specific checklist, template, script, or framework to show HOW to do it.
2.  NO GENERIC ADVICE: Avoid high-level, obvious statements. Every sentence must provide unique value.
3.  NO SELLING: The content must be 100% educational. Do not mention any brands.
4.  DENSE & STRUCTURED: The output must be structured for professional design, using a variety of content formats (tables, lists, blockquotes, etc.).

THE BLUEPRINT: GENERATE THE FOLLOWING COMPONENTS

1.  **Title & Subtitle:**
    -   Title: A sharp, specific headline for the selected concept (8-12 words).
    -   Subtitle: A powerful subtitle that makes a quantifiable promise or clarifies the tool's function (10-15 words).

2.  **Introduction:**
    -   A concise, hard-hitting introduction (50-70 words) that starts with a sharp pain point and clearly states what tangible tool the reader will possess by the end of the document.

3.  **The Toolkit Sections:**
    -   You MUST generate at least THREE distinct sections. Each section must be a different TYPE of tool from the list below. Choose the types most relevant to the selected concept.

    -   **Tool Type Option 1: A "Decoder Ring" Table**
        -   A 3-column table explaining technical terms or concepts. Headers: ["Term/Concept", "What It Means (Simple Terms)", "Why It Matters To You"]

    -   **Tool Type Option 2: An "Action Checklist"**
        -   A practical, bulleted checklist of specific, actionable items. Each item must start with a strong verb (e.g., "Verify," "Calculate," "Draft").

    -   **Tool Type Option 3: "Copy-Paste Scripts"**
        -   A section with 2-3 blockquotes containing actual phrases, email sentences, or conversation snippets the user can use immediately.

    -   **Tool Type Option 4: A "Fill-in-the-Blank Template"**
        -   A structural template for an email, project brief, or proposal section. Use [Brackets] for fields the user needs to fill in.

    -   **Tool Type Option 5: "Common Mistakes to Avoid"**
        -   A numbered list of the 3 most common and costly mistakes people make regarding the topic, with a brief sentence explaining how to avoid each one.

4.  **Call to Action (CTA):**
    -   A brief (25-40 words), logical CTA that offers a clear next step toward a sales conversation.

RETURN JSON IN THIS EXACT, STRUCTURED FORMAT:
{
  "title": "The Generated Title",
  "subtitle": "The Generated Subtitle",
  "introduction": "The 50-70 word introduction.",
  "toolkit_sections": [
    {
      "type": "table",
      "title": "Example Section Title for a Table",
      "content": {
        "headers": ["Header 1", "Header 2", "Header 3"],
        "rows": [
          ["Row 1 Cell 1", "Row 1 Cell 2", "Row 1 Cell 3"],
          ["Row 2 Cell 1", "Row 2 Cell 2", "Row 2 Cell 3"]
        ]
      }
    },
    {
      "type": "checklist",
      "title": "Example Section Title for a Checklist",
      "items": [
        "First actionable checklist item.",
        "Second actionable checklist item.",
        "Third actionable checklist item."
      ]
    },
    {
      "type": "scripts",
      "title": "Example Section Title for Scripts",
      "scripts": [
        "Script Snippet 1: 'When they say X, you should respond with Y...'",
        "Script Snippet 2: 'Here is a sample sentence to use in your email...'"
      ]
    }
  ],
  "cta": "The generated 25-40 word call-to-action."
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Instructional Designer and world-class Conversion Copywriter. Your task is to generate the complete and final content for an A+ grade lead magnet. Output strictly valid JSON as defined.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000 // Increased token limit for a complete, detailed document
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    return JSON.parse(content);
  } catch (error: any) {
    console.error('OpenAI error:', error?.message || error);
    throw new Error('Failed to generate A+ toolkit content. Please try again.');
  }
}

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