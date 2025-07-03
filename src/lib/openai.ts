import OpenAI from 'openai';
import { CampaignInput, ToolkitConcept, ToolkitOutline, ToolkitContent, LandingPageCopy, SocialPosts, CampaignOutput } from '../types';

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
 * PHASE 1: Generate a list of focused, professional toolkit concepts for the user to choose from.
 */
export async function generateToolkitConcepts(input: CampaignInput): Promise<ToolkitConcept[]> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file with your actual API key.');
  }

  const prompt = `
You are a business strategy expert. Based on the user's inputs, generate 6 unique professional toolkit concepts.

User Context:
- Niche: ${input.niche}
- Customer Pain Point: ${input.pain_point}
- Desired Outcome: ${input.desired_outcome}
- Target Audience: ${input.target_audience}

Each concept must be framed as a comprehensive business toolkit that helps professionals master a specific challenge.

Requirements:
- Each concept should be titled "Mastering [Specific Challenge]"
- Focus on business optimization, cost reduction, or competitive advantage
- Frame as professional toolkits with multiple components (checklists, templates, scripts, contract clauses)
- Make them specific to their niche and audience
- Ensure each is distinct and valuable for business professionals

Return JSON in this exact format:
{
  "concepts": [
    {
      "id": "concept-1",
      "title": "Mastering [Specific Challenge in Their Niche]",
      "description": "A 4-Part Toolkit to [Primary Benefit] and [Secondary Benefit] (20-30 words)"
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
          content: 'You are a business strategy expert. Output strictly valid JSON as defined.'
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
    throw new Error('Failed to generate toolkit concepts. Please try again.');
  }
}

/**
 * PHASE 2: Generate a reviewable content outline based on the user's single selected concept.
 */
export async function generateToolkitOutline(
  input: CampaignInput,
  selectedConcept: ToolkitConcept
): Promise<ToolkitOutline> {
  if (!openai) {
    throw new Error('OpenAI API key not configured.');
  }

  const prompt = `
You are a business consultant. Based on the user's inputs and selected concept, create a structured outline for a professional business toolkit.

User Context:
- Niche: ${input.niche}
- Customer Pain Point: ${input.pain_point}
- Desired Outcome: ${input.desired_outcome}
- Target Audience: ${input.target_audience}
- Selected Concept: ${selectedConcept.title}

Create an outline following this exact 4-part structure:
1. Problem Statement (2-3 sentences about the business challenge)
2. Technical Reference Table (4 key terms/concepts with definitions)
3. Action Checklist (4-5 preparation steps)
4. Communication Scripts (3 scenario-based scripts)
5. Contract Template (sample clause or agreement language)

Return JSON in this exact format:
{
  "title": "${selectedConcept.title}",
  "subtitle": "A 4-Part Toolkit to [Primary Benefit] and [Secondary Benefit]",
  "problem_statement": "2-3 sentences identifying the core business challenge",
  "technical_terms": [
    {
      "term": "Technical Term 1",
      "definition": "Plain English explanation",
      "key_question": "The right question to ask vendors/partners"
    }
  ],
  "checklist_items": [
    "First preparation step with specific action",
    "Second preparation step with specific action"
  ],
  "script_scenarios": [
    {
      "scenario": "When dealing with [specific situation]",
      "script": "Exact words to use in quotes"
    }
  ],
  "contract_focus": "Type of contract clause or agreement needed"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a business consultant. Output strictly valid JSON as defined.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1200
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    return JSON.parse(content);
  } catch (error: any) {
    console.error('OpenAI error:', error?.message || error);
    throw new Error('Failed to generate toolkit outline. Please try again.');
  }
}

/**
 * PHASE 3: Generate the complete campaign by orchestrating all three specialists.
 */
export async function generateFinalCampaign(
  input: CampaignInput,
  outline: ToolkitOutline
): Promise<CampaignOutput> {
  try {
    // Run all three specialist functions concurrently
    const [toolkitContent, landingPageCopy, socialPosts] = await Promise.all([
      generateToolkitContent(input, outline),
      generateLandingPageCopy(input, outline),
      generateSocialPosts(input, outline)
    ]);

    // Combine results into final campaign output
    return {
      toolkit_content: toolkitContent,
      landing_page: landingPageCopy,
      social_posts: socialPosts
    };
  } catch (error: any) {
    console.error('Error generating final campaign:', error?.message || error);
    throw new Error('Failed to generate final campaign. Please try again.');
  }
}

/**
 * PHASE 3, SPECIALIST 1: The Professional Writer - Creates the complete toolkit document.
 */
export async function generateToolkitContent(
    input: CampaignInput,
    outline: ToolkitOutline
): Promise<ToolkitContent> {
    if (!openai) {
        throw new Error('OpenAI API key not configured.');
    }

    const prompt = `
You are a professional business toolkit creator. Your task is to create a complete, professional business toolkit document following the exact format and structure.

Approved Outline:
- Title: ${outline.title}
- Subtitle: ${outline.subtitle}
- Problem Statement: ${outline.problem_statement}
- Technical Terms: ${JSON.stringify(outline.technical_terms)}
- Checklist Items: ${JSON.stringify(outline.checklist_items)}
- Script Scenarios: ${JSON.stringify(outline.script_scenarios)}
- Contract Focus: ${outline.contract_focus}

User Context:
- Niche: ${input.niche}
- Target Audience: ${input.target_audience}

CRITICAL INSTRUCTIONS:
You must create a professional business toolkit with exactly this structure:

Page 1: Title page with toolkit title, subtitle, and "2025 Quickstrat"
Page 2: Introduction with "Your Strongest Position is a Prepared One" hook
Page 3: Technical reference table with 4 key terms
Page 4: Pre-action checklist with 4-5 items
Page 5: Communication scripts with 3 scenarios
Page 6: Contract template with sample clause

Each section must be substantial, professional, and immediately actionable.

Return JSON in this exact format:
{
  "title": "${outline.title}",
  "subtitle": "${outline.subtitle}",
  "introduction": {
    "hook": "Your Strongest Position is a Prepared One",
    "problem": "2-3 sentences about the business challenge",
    "solution": "How this toolkit solves the problem",
    "promise": "What users will achieve"
  },
  "technical_reference": {
    "section_title": "The [Topic] 'Decoder Ring' — Key Terms That Impact [Primary Concern]",
    "terms": [
      {
        "term": "Technical Term",
        "definition": "Plain English explanation",
        "key_question": "The right question to ask"
      }
    ]
  },
  "action_checklist": {
    "section_title": "Your Pre-[Action] Checklist",
    "items": [
      "Detailed checklist item with specific action"
    ]
  },
  "communication_scripts": {
    "section_title": "[Context] Scripts You Can Use Today",
    "scenarios": [
      {
        "scenario": "When dealing with specific situation",
        "script": "Exact professional script in quotes"
      }
    ]
  },
  "contract_template": {
    "section_title": "A Sample '[Document Type]' Clause",
    "template": "Professional contract language with specific terms",
    "next_step": "Clear guidance on implementation"
  }
}
`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional business toolkit creator. Output strictly valid JSON as defined.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 3000
        });

        const content = response.choices?.[0]?.message?.content;
        if (!content) throw new Error('Empty response from OpenAI');

        return JSON.parse(content);
    } catch (error: any) {
        console.error('OpenAI error:', error?.message || error);
        throw new Error('Failed to generate toolkit content. Please try again.');
    }
}

/**
 * PHASE 3, SPECIALIST 2: The Marketer - Creates landing page copy for the toolkit.
 */
export async function generateLandingPageCopy(
    input: CampaignInput,
    outline: ToolkitOutline
): Promise<LandingPageCopy> {
    if (!openai) {
        throw new Error('OpenAI API key not configured.');
    }

    const prompt = `
You are a direct-response copywriter. Your task is to create high-converting copy for a landing page to promote a professional business toolkit.

Toolkit Details:
- Title: ${outline.title}
- Subtitle: ${outline.subtitle}
- Target Audience: ${input.target_audience}
- Niche: ${input.niche}

INSTRUCTIONS:
1. Write a compelling headline that focuses on the business benefits and cost savings
2. Write a subheadline that emphasizes the professional toolkit nature
3. Create 3-4 powerful benefit bullets that focus on business outcomes
4. Write a strong, professional CTA button text

The copy should appeal to business professionals and decision-makers.

Return JSON in this exact format:
{
  "headline": "Professional headline focusing on business benefits and cost savings",
  "subheadline": "Supporting subheadline emphasizing the comprehensive toolkit",
  "benefit_bullets": [
    "Business outcome-focused bullet point 1",
    "Business outcome-focused bullet point 2",
    "Business outcome-focused bullet point 3"
  ],
  "cta_button_text": "Download The Professional Toolkit"
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
 * PHASE 3, SPECIALIST 3: The Social Media Manager - Creates promotional social posts for the toolkit.
 */
export async function generateSocialPosts(
    input: CampaignInput,
    outline: ToolkitOutline
): Promise<SocialPosts> {
    if (!openai) {
        throw new Error('OpenAI API key not configured.');
    }

    const prompt = `
You are a B2B social media manager. Your task is to create promotional posts for a professional business toolkit.

Toolkit Details:
- Title: ${outline.title}
- Target Audience: ${input.target_audience}
- Brand Name: ${input.brand_name}
- Niche: ${input.niche}

INSTRUCTIONS:
Create three distinct professional social media posts to drive toolkit downloads.
1. LinkedIn: Professional, highlights business problems and ROI benefits
2. Twitter: Punchy, focuses on cost savings and efficiency (under 280 characters)
3. Instagram: Engaging, asks about business challenges and promotes the toolkit

Tone should be professional and business-focused throughout.

Return JSON in this exact format:
{
  "linkedin": "A professional LinkedIn post highlighting business problems, ROI benefits, and clear call-to-action for the toolkit.",
  "twitter": "A short, punchy Twitter post (under 280 chars) focusing on cost savings and efficiency gains.",
  "instagram": "An engaging Instagram caption that asks about business challenges and promotes the professional toolkit."
}
`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a B2B social media manager. Output strictly valid JSON as defined.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.8,
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