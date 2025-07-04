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

// Debug log environment variables (without exposing sensitive data)
console.log('Environment Variables:', {
  VITE_OPENAI_API_KEY: apiKey ? '***' : 'Not set',
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set',
  NODE_ENV: import.meta.env.MODE
});

if (!apiKey || apiKey === 'your_openai_api_key') {
  const errorMsg = 'OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.';
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// Initialize OpenAI client
let openai: OpenAI;
try {
  openai = new OpenAI({ 
    apiKey,
    dangerouslyAllowBrowser: true,
    // Add default headers for better debugging
    defaultHeaders: {
      'x-request-source': 'browser',
      'x-app-name': 'quickstrat-v5'
    }
  });
  
  // Test the API key by making a simple request
  console.log('Initializing OpenAI client...');
  
  // Log successful initialization
  console.log('OpenAI client initialized successfully');
  
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error('Failed to initialize OpenAI client:', {
    message: errorMessage,
    error: error,
    apiKeyPresent: !!apiKey,
    apiKeyLength: apiKey?.length,
    apiKeyStartsWith: apiKey?.substring(0, 3) + '...' + apiKey?.substring(apiKey.length - 3)
  });
  
  // Provide more specific error messages for common issues
  if (errorMessage.includes('Incorrect API key provided')) {
    throw new Error('Invalid OpenAI API key. Please check your .env file and ensure the key is correct.');
  } else if (errorMessage.includes('rate limit')) {
    throw new Error('Rate limit exceeded. Please try again later.');
  } else {
    throw new Error(`Failed to initialize OpenAI client: ${errorMessage}`);
  }
}

export async function generateLeadMagnetConcepts(input: CampaignInput): Promise<LeadMagnetConcept[]> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please check your .env file.');
  }

  try {
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
  ]
}`;

    const res = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a content strategist. Output strictly valid JSON as defined.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      timeout: 30000 // 30 seconds timeout
    });

    if (!res.choices?.[0]?.message?.content) {
      throw new Error('Empty response received from OpenAI API');
    }

    const content = res.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    if (!Array.isArray(parsed.concepts)) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return parsed.concepts;
  } catch (err: any) {
    console.error('OpenAI API Error:', {
      message: err.message,
      status: err.status,
      code: err.code,
      type: err.type
    });

    if (err.code === 'rate_limit_exceeded') {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    } else if (err.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please check your .env file.');
    } else if (err.message.includes('timeout')) {
      throw new Error('Request timed out. Please check your internet connection and try again.');
    }

    throw new Error(`Failed to generate lead magnet concepts: ${err.message}`);
  }
}

export async function generateContentOutline(input: CampaignInput, selected: LeadMagnetConcept): Promise<ContentOutline> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please check your .env file.');
  }

  try {
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

    const res = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a content strategist. Output strictly valid JSON as defined.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      timeout: 30000 // 30 seconds timeout
    });

    if (!res.choices?.[0]?.message?.content) {
      throw new Error('Empty response received from OpenAI API');
    }

    const content = res.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Validate the response structure
    if (!parsed.title || !parsed.introduction || !Array.isArray(parsed.core_points) || !parsed.cta) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return parsed;
  } catch (err: any) {
    console.error('OpenAI API Error:', {
      message: err.message,
      status: err.status,
      code: err.code,
      type: err.type
    });

    if (err.code === 'rate_limit_exceeded') {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    } else if (err.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please check your .env file.');
    } else if (err.message.includes('timeout')) {
      throw new Error('Request timed out. Please check your internet connection and try again.');
    } else if (err.message.includes('JSON')) {
      throw new Error('Failed to process the response from OpenAI. Please try again.');
    }

    throw new Error(`Failed to generate content outline: ${err.message}`);
  }
}

export async function generatePdfContent(input: CampaignInput, outline: ContentOutline): Promise<PDFContent> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please check your .env file.');
  }

  try {
    const prompt = `You are a clear and concise educational writer. Your task is to expand the approved outline into the final content for a lead magnet PDF.

Approved Outline:
- Title: ${outline.title}
- Introduction: ${outline.introduction}
- Core Points: ${JSON.stringify(outline.core_points, null, 2)}
- CTA: ${outline.cta}

CRITICAL INSTRUCTIONS:
1. For EACH core point provided, expand it into its own detailed, educational paragraph.
2. Each paragraph must be 60-80 words.
3. The content must be purely educational with NO promotional language.
4. Maintain a consistent tone throughout the document.
5. Ensure the content flows logically from one section to the next.

Return JSON in this exact format:
{
  "title": "${outline.title.replace(/"/g, '\\"')}",
  "introduction": "${outline.introduction.replace(/"/g, '\\"')}",
  "sections": [
    { "title": "The first core point from the outline", "content": "Expanded content here..." },
    { "title": "The second core point from the outline", "content": "Expanded content here..." }
  ],
  "cta": "${outline.cta.replace(/"/g, '\\"')}"
}`;

    const res = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a clear and concise educational writer. Output strictly valid JSON as defined.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      timeout: 45000 // 45 seconds timeout
    });

    if (!res.choices?.[0]?.message?.content) {
      throw new Error('Empty response received from OpenAI API');
    }

    const content = res.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Validate the response structure
    if (!parsed.title || !parsed.introduction || !Array.isArray(parsed.sections) || !parsed.cta) {
      throw new Error('Invalid response format from OpenAI API');
    }

    // Validate each section
    for (const section of parsed.sections) {
      if (!section.title || !section.content) {
        throw new Error('Invalid section format in PDF content');
      }
    }

    return parsed;
  } catch (err: any) {
    console.error('OpenAI API Error:', {
      message: err.message,
      status: err.status,
      code: err.code,
      type: err.type
    });

    if (err.code === 'rate_limit_exceeded') {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    } else if (err.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please check your .env file.');
    } else if (err.message.includes('timeout')) {
      throw new Error('Request timed out. The content generation is taking longer than expected. Please try again.');
    } else if (err.message.includes('JSON')) {
      throw new Error('Failed to process the PDF content. Please try again.');
    }

    throw new Error(`Failed to generate PDF content: ${err.message}`);
  }
}

export async function generateLandingPageCopy(input: CampaignInput, outline: ContentOutline): Promise<LandingPageCopy> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please check your .env file.');
  }

  try {
    const prompt = `You are a direct-response copywriter. Your task is to create high-converting copy for a landing page to promote a lead magnet.

Lead Magnet Details:
- Title: ${outline.title}
- Core Points: ${JSON.stringify(outline.core_points, null, 2)}
- Target Audience: ${input.target_audience}
- Brand: ${input.brand_name}
- Tone: ${input.tone}

INSTRUCTIONS:
1. Headline: Create a compelling, benefit-focused headline (under 10 words)
2. Subheadline: Write a clear subheadline that expands on the headline (15-25 words)
3. Benefit Bullets: Convert the core points into 3-4 powerful benefit statements (each 10-15 words)
4. CTA Button: Create a strong, action-oriented call-to-action (2-5 words)

IMPORTANT:
- Focus on the transformation the user will experience
- Use clear, concise language
- Match the tone: ${input.tone}
- Include a sense of urgency or exclusivity
- Make it scannable and easy to read

Return JSON in this exact format:
{
  "headline": "Compelling headline here...",
  "subheadline": "Clear subheadline that expands on the headline here...",
  "benefit_bullets": [
    "First compelling benefit...",
    "Second compelling benefit...",
    "Third compelling benefit..."
  ],
  "cta_button_text": "Get Instant Access"
}`;

    const res = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a direct-response copywriter. Output strictly valid JSON as defined.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1200,
      timeout: 30000 // 30 seconds timeout
    });

    if (!res.choices?.[0]?.message?.content) {
      throw new Error('Empty response received from OpenAI API');
    }

    const content = res.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Validate the response structure
    if (!parsed.headline || !parsed.subheadline || !Array.isArray(parsed.benefit_bullets) || !parsed.cta_button_text) {
      throw new Error('Invalid response format from OpenAI API');
    }

    // Validate benefit bullets
    if (parsed.benefit_bullets.length === 0 || parsed.benefit_bullets.length > 4) {
      throw new Error('Invalid number of benefit bullets received');
    }

    return parsed;
  } catch (err: any) {
    console.error('OpenAI API Error:', {
      message: err.message,
      status: err.status,
      code: err.code,
      type: err.type
    });

    if (err.code === 'rate_limit_exceeded') {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    } else if (err.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please check your .env file.');
    } else if (err.message.includes('timeout')) {
      throw new Error('Request timed out while generating landing page copy. Please try again.');
    } else if (err.message.includes('JSON')) {
      throw new Error('Failed to process the landing page content. Please try again.');
    }

    throw new Error(`Failed to generate landing page copy: ${err.message}`);
  }
}

export async function generateSocialPosts(input: CampaignInput, outline: ContentOutline): Promise<SocialPosts> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please check your .env file.');
  }

  try {
    const prompt = `You are a social media manager. Your task is to create promotional posts for a new lead magnet.

LEAD MAGNET DETAILS:
- Title: ${outline.title}
- Main Benefit: ${outline.introduction}
- Target Audience: ${input.target_audience}
- Brand Name: ${input.brand_name}
- Tone: ${input.tone}

INSTRUCTIONS:
Create three distinct social media posts to drive downloads. Each post should:
1. Be platform-appropriate and engaging
2. Include relevant hashtags (2-3 per post)
3. Have a clear call-to-action
4. Match the brand's tone: ${input.tone}

PLATFORM REQUIREMENTS:
1. LinkedIn (Professional):
   - Focus on professional value and career impact
   - 3-4 sentences
   - Include 1-2 relevant hashtags

2. Twitter (Concise & Engaging):
   - Max 280 characters including hashtags
   - Attention-grabbing first line
   - Include 1-2 relevant hashtags

3. Instagram (Visual & Engaging):
   - 1-2 short paragraphs
   - Include a question to encourage comments
   - Include 2-3 relevant hashtags
   - Add emojis where appropriate

Return JSON in this exact format:
{
  "linkedin": "Professional post text with 1-2 hashtags... #example #marketing",
  "twitter": "Engaging tweet under 280 chars with 1-2 hashtags... #example",
  "instagram": "Engaging Instagram caption with 2-3 hashtags... #example #socialmedia #tips"
}`;

    const res = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a social media manager. Output strictly valid JSON as defined.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 1500,
      timeout: 30000 // 30 seconds timeout
    });

    if (!res.choices?.[0]?.message?.content) {
      throw new Error('Empty response received from OpenAI API');
    }

    const content = res.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Validate the response structure
    if (!parsed.linkedin || !parsed.twitter || !parsed.instagram) {
      throw new Error('Invalid response format from OpenAI API');
    }

    // Validate content length for each platform
    if (parsed.twitter.length > 280) {
      throw new Error('Twitter post exceeds 280 characters');
    }

    return parsed;
  } catch (err: any) {
    console.error('OpenAI API Error:', {
      message: err.message,
      status: err.status,
      code: err.code,
      type: err.type
    });

    if (err.code === 'rate_limit_exceeded') {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    } else if (err.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please check your .env file.');
    } else if (err.message.includes('timeout')) {
      throw new Error('Request timed out while generating social media posts. Please try again.');
    } else if (err.message.includes('JSON')) {
      throw new Error('Failed to process the social media content. Please try again.');
    }

    throw new Error(`Failed to generate social media posts: ${err.message}`);
  }
}

export async function generateFinalCampaign(input: CampaignInput, concept: LeadMagnetConcept): Promise<CampaignOutput> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please check your .env file.');
  }

  try {
    // Step 1: Generate the content outline
    const outline = await generateContentOutline(input, concept);
    
    // Step 2: Generate all content in parallel
    const [pdf_content, landing_page, social_posts] = await Promise.all([
      generatePdfContent(input, outline).catch(err => {
        console.error('Error generating PDF content:', err);
        throw new Error(`Failed to generate PDF content: ${err.message}`);
      }),
      generateLandingPageCopy(input, outline).catch(err => {
        console.error('Error generating landing page copy:', err);
        throw new Error(`Failed to generate landing page: ${err.message}`);
      }),
      generateSocialPosts(input, outline).catch(err => {
        console.error('Error generating social posts:', err);
        throw new Error(`Failed to generate social media posts: ${err.message}`);
      })
    ]);

    // Validate all required content was generated
    if (!pdf_content || !landing_page || !social_posts) {
      throw new Error('Incomplete content generation. Some components failed to generate.');
    }

    return {
      pdf_content,
      landing_page,
      social_posts
    };
  } catch (err: any) {
    console.error('Campaign Generation Error:', {
      message: err.message,
      stack: err.stack,
      cause: err.cause
    });

    // Handle specific error cases
    if (err.message.includes('rate_limit_exceeded')) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    } else if (err.message.includes('invalid_api_key')) {
      throw new Error('Invalid API key. Please check your OpenAI API key in the .env file.');
    } else if (err.message.includes('timeout')) {
      throw new Error('Request timed out. The server is taking too long to respond. Please try again.');
    }

    // For other errors, include the original error message for better debugging
    throw new Error(`Failed to generate campaign: ${err.message}`);
  }
}
