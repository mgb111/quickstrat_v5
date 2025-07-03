import OpenAI from 'openai';
import {
  CampaignInput,
  LeadMagnetConcept,
  ContentOutline,
  PdfContent,
  LandingPageCopy,
  SocialPosts,
  CampaignOutput
} from '../types';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey || apiKey === 'your_openai_api_key') {
  console.warn('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
}

const openai = apiKey && apiKey !== 'your_openai_api_key'
  ? new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
  : null;

export async function generateLeadMagnetConcepts(input: CampaignInput): Promise<LeadMagnetConcept[]> {
  if (!openai) throw new Error('OpenAI API key not configured.');

  const prompt = `You are a lead generation expert. Based on the user's inputs, generate 6 unique lead magnet concepts.
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
  ]}`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a content strategist. Output strictly valid JSON as defined.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const content = res.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');
    const parsed = JSON.parse(content);
    return parsed.concepts;
  } catch (err: any) {
    console.error('OpenAI error:', err?.message || err);
    throw new Error('Failed to generate lead magnet concepts.');
  }
}

export async function generateContentOutline(input: CampaignInput, selected: LeadMagnetConcept): Promise<ContentOutline> {
  if (!openai) throw new Error('OpenAI API key not configured.');

  const prompt = `You are creating a content outline for a lead magnet.
User Context:
- Niche: ${input.niche}
- Target Audience: ${input.target_audience}
- Tone: ${input.tone}
- Brand: ${input.brand_name}
Selected Concept: "${selected.title}"
Concept Description: "${selected.description}"
Generate a content outline with these components:
1. Title: A sharp, specific headline (8-12 words)
2. Introduction: A concise hook that states the problem this tool solves (40-60 words)
3. Core Points: 4-6 bullet points outlining key steps/points (10-15 words each)
4. CTA: A brief call-to-action offering next steps (25-40 words)
Return JSON in this exact format:
{
  "title": "The [Tool Name]: [Specific Benefit]",
  "introduction": "...",
  "core_points": ["..."],
  "cta": "..."
}`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a content strategist. Output strictly valid JSON as defined.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const content = res.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');
    return JSON.parse(content);
  } catch (err: any) {
    console.error('OpenAI error:', err?.message || err);
    throw new Error('Failed to generate content outline.');
  }
}

export async function generatePdfContent(input: CampaignInput, outline: ContentOutline): Promise<PdfContent> {
  if (!openai) throw new Error('OpenAI API key not configured.');

  const prompt = `You are a clear and concise educational writer. Your task is to expand the approved outline into the final content for a lead magnet PDF.
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
    { "title": "The first core point from the outline", "content": "..." },
    { "title": "The second core point from the outline", "content": "..." }
  ],
  "cta": "${outline.cta}"
}`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a clear and concise educational writer. Output strictly valid JSON as defined.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const content = res.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');
    return JSON.parse(content);
  } catch (err: any) {
    console.error('OpenAI error:', err?.message || err);
    throw new Error('Failed to generate PDF content.');
  }
}

export async function generateLandingPageCopy(input: CampaignInput, outline: ContentOutline): Promise<LandingPageCopy> {
  if (!openai) throw new Error('OpenAI API key not configured.');

  const prompt = `You are a direct-response copywriter. Your task is to create high-converting copy for a landing page to promote a lead magnet.
Lead Magnet Outline:
- Title: ${outline.title}
- Core Points: ${JSON.stringify(outline.core_points)}
- Target Audience: ${input.target_audience}
INSTRUCTIONS:
1. Write a compelling headline that focuses on the ultimate benefit for the target audience.
2. Write a subheadline that clarifies the offer.
3. Convert the 'core_points' into 3-4 powerful 'benefit_bullets'.
4. Write a strong, action-oriented CTA button text.
Return JSON in this exact format:
{
  "headline": "...",
  "subheadline": "...",
  "benefit_bullets": ["..."],
  "cta_button_text": "..."
}`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a direct-response copywriter. Output strictly valid JSON as defined.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = res.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');
    return JSON.parse(content);
  } catch (err: any) {
    console.error('OpenAI error:', err?.message || err);
    throw new Error('Failed to generate landing page copy.');
  }
}

export async function generateSocialPosts(input: CampaignInput, outline: ContentOutline): Promise<SocialPosts> {
  if (!openai) throw new Error('OpenAI API key not configured.');

  const prompt = `You are a social media manager. Your task is to create promotional posts for a new lead magnet.
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
  "linkedin": "...",
  "twitter": "...",
  "instagram": "..."
}`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a social media manager. Output strictly valid JSON as defined.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 1200
    });

    const content = res.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');
    return JSON.parse(content);
  } catch (err: any) {
    console.error('OpenAI error:', err?.message || err);
    throw new Error('Failed to generate social posts.');
  }
}

export async function generateFinalCampaign(input: CampaignInput, concept: LeadMagnetConcept): Promise<CampaignOutput> {
  const outline = await generateContentOutline(input, concept);
  const [pdf_content, landing_page, social_posts] = await Promise.all([
    generatePdfContent(input, outline),
    generateLandingPageCopy(input, outline),
    generateSocialPosts(input, outline)
  ]);

  return {
    pdf_content,
    landing_page,
    social_posts
  };
}
