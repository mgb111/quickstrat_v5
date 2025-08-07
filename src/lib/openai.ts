import OpenAI from 'openai';
import {
  CampaignInput,
  LeadMagnetConcept,
  ContentOutline,
  LandingPage,
  SocialPosts,
  CampaignOutput,
  PDFContent,
  LandingPageCopy,
  PDFCustomization,
  LeadMagnetFormat
} from '../types/index';
import { jsonrepair } from 'jsonrepair';

// Get API key from environment variables
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Debug log environment variables (without exposing sensitive data)
console.log('Environment Variables:', {
  VITE_OPENAI_API_KEY: apiKey ? '***' : 'Not set',
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set',
  NODE_ENV: import.meta.env.MODE
});

// Initialize OpenAI client only when needed, not during module loading
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!apiKey || apiKey === 'your_openai_api_key') {
    const errorMsg = 'OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (!openai) {
    try {
      openai = new OpenAI({ 
        apiKey,
        dangerouslyAllowBrowser: true,
        timeout: 60000, // Configure timeout at client level (60 seconds)
        // Add default headers for better debugging
        defaultHeaders: {
          'x-request-source': 'browser',
          'x-app-name': 'Majorbeam'
        }
      });
      
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
  }

  return openai;
}

// Helper function to clean JSON responses that might be wrapped in markdown
function cleanJsonResponse(content: string): string {
  // Remove markdown code blocks if present
  let cleaned = content.trim();
  
  // Remove ```json and ``` markers
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '');
  }
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  
  // Try to parse the JSON as-is first
  try {
    JSON.parse(jsonrepair(cleaned));
    return cleaned; // If it parses successfully, return as-is
  } catch (e) {
    // Only try to fix if parsing fails
    console.log('JSON parsing failed, attempting to fix...');
    
    // Only fix if there are actual newlines in strings (not in the JSON structure)
    if (cleaned.includes('\n') && cleaned.includes('"')) {
      // More conservative approach - only fix obvious string newlines
      cleaned = cleaned.replace(/"([^"]*)\n([^"]*)"/g, '"$1\\n$2"');
    }
  }
  
  return cleaned.trim();
}

export async function generateLeadMagnetConcepts(input: CampaignInput): Promise<LeadMagnetConcept[]> {
  const client = getOpenAIClient();

  try {
    const format = input.selected_format;
    if (!format) {
      throw new Error('No format selected');
    }

    const formatSpecificPrompt = getFormatSpecificPrompt(format, input);
    
    const res = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a lead magnet strategist. Generate 3 unique concepts for the specified format. Each concept should be specific, actionable, and tailored to the user\'s niche and audience.' },
        { role: 'user', content: formatSpecificPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    if (!res.choices?.[0]?.message?.content) {
      throw new Error('Empty response received from OpenAI API');
    }

    const content = res.choices[0].message.content;
    
    // Clean the content to handle markdown-wrapped JSON
    const cleanedContent = cleanJsonResponse(content);
    console.log('🎯 OpenAI Response (cleaned):', cleanedContent);
    const parsed = JSON.parse(jsonrepair(cleanedContent));

    // Validate the response structure
    if (!Array.isArray(parsed.concepts) || parsed.concepts.length === 0) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return parsed.concepts.map((concept: any, index: number) => ({
      id: `concept-${index + 1}`,
      title: concept.title,
      description: concept.description,
      value_proposition: concept.value_proposition,
      target_audience: concept.target_audience,
      format: format
    }));
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

    throw new Error(`Failed to generate lead magnet concepts: ${err.message}`);
  }
}

function getFormatSpecificPrompt(format: string, input: CampaignInput): string {
  const baseContext = `
User Context:
- Niche: ${input.niche}
- Target Audience: ${input.target_audience}
- Problem Statement: ${input.problem_statement}
- Desired Outcome: ${input.desired_outcome}
- Brand: ${input.brand_name}
- Tone: ${input.tone}
`;

  switch (format) {
    case 'interactive_quiz':
      return `${baseContext}

Generate 3 Interactive Problem Diagnosis Quiz concepts that provide IMMEDIATE tactical value.

Each quiz MUST:
- Diagnose a SPECIFIC problem with a CLEAR solution pathway
- Include questions that reveal ROOT CAUSES (not symptoms)
- Provide ACTIONABLE next steps based on diagnosis
- Feel like a professional assessment worth $200+

❌ AVOID: Generic personality quizzes, "What type are you?" fluff
✅ FOCUS ON: "Why is X not working?" diagnostic quizzes with tactical solutions

EXAMPLES OF HIGH-VALUE QUIZ CONCEPTS:
- "The Conversion Killer Audit" - Reveals exactly why your landing page isn't converting
- "The Lead Generation Leak Detector" - Pinpoints where you're losing prospects in your funnel
- "The Pricing Strategy Analyzer" - Reveals if you're under-pricing and by how much

Return JSON in this exact format:
{
  "concepts": [
    {
      "title": "[Problem] Diagnosis Quiz - Find Out Why [Specific Issue] Isn't Working",
      "description": "A professional diagnostic that reveals the ROOT CAUSE of [specific problem] and provides a custom action plan to fix it within [timeframe]",
      "value_proposition": "Get a professional-grade analysis of [specific issue] and discover the exact steps to [specific outcome] - normally costs $[amount] in consulting",
      "target_audience": "[Specific segment] struggling with [specific problem] who need immediate answers"
    }
  ]
}`;

    case 'pdf':
      return `${baseContext}

Generate 3 PDF Guide concepts that provide COMPREHENSIVE implementation systems.

Each guide MUST:
- Include step-by-step processes with checklists
- Provide templates, scripts, and tools
- Cover common mistakes and how to avoid them
- Include case studies with specific results

❌ AVOID: High-level theory or generic advice
✅ FOCUS ON: Complete implementation systems with tools and templates

EXAMPLES OF HIGH-VALUE PDF Concepts:
- "The Complete Lead Magnet System" - 47 pages including 12 templates, 3 case studies, and step-by-step creation process
- "The Email Automation Playbook" - Complete system with 25+ email templates, automation sequences, and performance metrics
- "The Content Marketing Blueprint" - 60-day content plan with templates, posting schedules, and engagement strategies

Return JSON in this exact format:
{
  "concepts": [
    {
      "title": "The Complete [Topic] System - [Specific Outcome] in [Timeframe]",
      "description": "A comprehensive [X]-page guide with step-by-step processes, [number] templates, case studies, and everything needed to [specific result]",
      "value_proposition": "Get the complete system that took [time period] to develop and has generated [specific results] - includes all templates and tools",
      "target_audience": "[Target audience] who want a comprehensive system they can implement immediately without missing any steps"
    }
  ]
}`;

    default:
      throw new Error(`Unknown format: ${format}`);
  }
}

export async function generateContentOutline(input: CampaignInput, selected: LeadMagnetConcept): Promise<ContentOutline> {
  const client = getOpenAIClient();
  let content = '';

  try {
    const format = selected.format;
    const formatSpecificPrompt = getFormatSpecificOutlinePrompt(format, input, selected);

    const res = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a content strategist. Output strictly valid JSON as defined.' },
        { role: 'user', content: formatSpecificPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    if (!res.choices?.[0]?.message?.content) {
      throw new Error('Empty response received from OpenAI API');
    }

    content = res.choices[0].message.content;
    
    // Clean the content to handle markdown-wrapped JSON
    const cleanedContent = cleanJsonResponse(content);
    console.log('🎯 OpenAI Response (cleaned):', cleanedContent);
    const parsed = JSON.parse(jsonrepair(cleanedContent));

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
    } else if (err.message.includes('JSON') || err.message.includes('Unexpected token')) {
      console.error('JSON parsing error. Original content:', content);
      throw new Error('Failed to process the response from OpenAI. Please try again.');
    }

    throw new Error(`Failed to generate content outline: ${err.message}`);
  }
}

function getFormatSpecificOutlinePrompt(format: string, input: CampaignInput, selected: LeadMagnetConcept): string {
  const baseContext = `
User Context:
- Niche: ${input.niche}
- Target Audience: ${input.target_audience}
- Tone: ${input.tone}
- Brand: ${input.brand_name}

Selected Concept: "${selected.title}"
Concept Description: "${selected.description}"
Format: ${format}
`;

  switch (format) {
    case 'interactive_quiz':
      return `${baseContext}

Create a TACTICAL content outline for a diagnostic quiz that provides professional-grade insights.

REQUIREMENTS:
- EXACTLY 4 core points in the outline
- Questions must build on each other logically
- Each question should eliminate possible causes
- Final diagnosis must include SPECIFIC next steps

❌ AVOID: Surface-level questions, generic results
✅ FOCUS ON: Professional diagnostic methodology with actionable outcomes

Return JSON in this exact format with EXACTLY 4 core_points:
{
  "title": "${selected.title}",
  "introduction": "Professional hook explaining the diagnostic process and what insights they'll receive",
  "core_points": [
    "Question 1: [Specific diagnostic question that rules out/confirms X]",
    "Question 2: [Builds on Q1 to narrow down to Y or Z]", 
    "Question 3: [Further diagnostic refinement]",
    "Results Framework: [How answers combine to create diagnosis]"
  ],
  "cta": "Take the diagnostic quiz to get your personalized action plan",
  "example": "Example: A marketing agency discovered their lead generation wasn't working because they were targeting too broad an audience (Question 3 revelation), not because of poor ad copy (ruled out in Question 1)",
  "template": "Quiz flow: Symptom identification → Root cause analysis → Diagnosis confirmation → Action prescription"
}

CRITICAL: You must return EXACTLY 4 core_points. Do not add more or fewer points.`;



    case 'pdf':
      return `${baseContext}

Create a COMPREHENSIVE SYSTEM outline with complete implementation tools.

REQUIREMENTS:
- Include step-by-step processes with checklists
- Provide 10+ templates, scripts, or tools
- Cover implementation, optimization, and troubleshooting
- Include case studies with specific results
- Give exact timelines and resource requirements

❌ AVOID: High-level theory or generic advice
✅ FOCUS ON: Complete plug-and-play system with all tools included

Return JSON in this exact format:
{
  "title": "${selected.title}",
  "introduction": "The complete system that eliminates guesswork and provides everything needed for [specific outcome]",
  "core_points": [
    "System Overview: [Complete process from start to finish]",
    "Phase 1 - Setup: [Exact steps with templates provided]",
    "Phase 2 - Implementation: [Step-by-step execution with tools]",
    "Phase 3 - Optimization: [Improvement strategies with metrics]"
  ],
  "cta": "Download the complete system with all templates and tools",
  "example": "Example: Using the provided email templates and sequence timing, a fitness coach increased course sales from $3,200/month to $12,800/month in 6 weeks",
  "template": "Complete implementation system with processes, tools, templates, case studies, and troubleshooting guides"
}`;

    default:
      throw new Error(`Unknown format: ${format}`);
  }
}

export async function generateLeadMagnetContent(input: {
  selected_format: LeadMagnetFormat;
  name: string;
  brand_name: string;
  target_audience: string;
  niche: string;
  problem_statement: string;
  desired_outcome: string;
  tone: string;
  position: string;
  concept: LeadMagnetConcept;
  outline: ContentOutline;
}): Promise<PDFContent> {
  const client = getOpenAIClient();
  
  // Create a CampaignInput object for the format-specific prompt
  // This function generates content for all formats: PDF, Interactive Quiz, ROI Calculator, etc.
  const campaignInput: CampaignInput = {
    name: input.name,
    brand_name: input.brand_name,
    target_audience: input.target_audience,
    niche: input.niche,
    problem_statement: input.problem_statement,
    desired_outcome: input.desired_outcome,
    tone: input.tone,
    position: input.position,
    selected_format: input.selected_format
  };
  
  const formatSpecificPrompt = getFormatSpecificPdfPrompt(input.selected_format, campaignInput, input.outline);
  
  const prompt = `You are an expert content creator specializing in ${input.selected_format} lead magnets.

Context:
- Creator: ${input.name} (${input.position})
- Brand: ${input.brand_name}
- Niche: ${input.niche}
- Target audience: ${input.target_audience}
- Problem: ${input.problem_statement}
- Desired outcome: ${input.desired_outcome}
- Tone: ${input.tone}
- Format: ${input.selected_format}

${formatSpecificPrompt}

IMPORTANT: Follow the exact JSON format specified in the format-specific prompt above. Do not override it with a different structure.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content creator who creates high-quality, actionable lead magnet content. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Clean the content to handle markdown-wrapped JSON
    const cleanedContent = cleanJsonResponse(content);
    console.log('🎯 OpenAI PDF Response (cleaned):', cleanedContent);
    
    // Parse the JSON response
    const pdfContent = JSON.parse(jsonrepair(cleanedContent)) as PDFContent;
    
    // Always return the PDF content structure for PDF format
    if (input.selected_format === 'pdf') {
      return pdfContent;
    } else {
      // For interactive formats, return the PDF content structure but with interactive elements
      return {
        ...pdfContent,
        title: `${pdfContent.title || 'Lead Magnet'} (${input.selected_format.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())})`,
        // Keep the structured_content for PDF display
        structured_content: pdfContent.structured_content,
        // Add interactive content for interactive display
        interactive_content: {
          format: input.selected_format,
          title: pdfContent.title || 'Lead Magnet',
          description: pdfContent.introduction,
          // Add format-specific interactive elements
          ...(input.selected_format === 'interactive_quiz' && {
            questions: [],
            results: []
          })
        }
      };
    }
  } catch (error) {
    console.error('Error generating PDF content:', error);
    throw new Error('Failed to generate content');
  }
}

function getFormatSpecificPdfPrompt(format: string, input: CampaignInput, outline: ContentOutline, customization?: PDFCustomization): string {
  const baseContext = `
User Context:
- Niche: ${input.niche}
- Target Audience: ${input.target_audience}
- Tone: ${input.tone}
- Brand Name: ${input.brand_name}
- Position/Title: ${input.position || ''}
- Selected Concept: A lead magnet about ${outline.title}.
- Format: ${format}
`;

  const founderIntro = `
PERSONALIZED FOUNDER INTRODUCTION:
Before the content, write a short, authentic introduction in the founder's voice. Use these details:
- Name: ${input.name}
- Position/Title: ${input.position || ''}
- Brand/company: ${input.brand_name}
- Customer problem: ${input.problem_statement}
- Desired outcome: ${input.desired_outcome}
Make it personal and credible - explain WHY you created this and what specific results the reader will get.
`;

  const valueStandards = `
EXTREME VALUE REQUIREMENTS (NON-NEGOTIABLE):

1. TACTICAL DEPTH: Every section must provide HOW-TO, not just WHAT-TO
2. IMPLEMENTABLE TOOLS: Include templates, scripts, checklists, frameworks
3. SPECIFIC RESULTS: Use exact numbers, timelines, and success metrics
4. CASE STUDIES: Include real examples with specific outcomes
5. TROUBLESHOOTING: Address common obstacles and solutions
6. NO FLUFF: Every paragraph must provide actionable value

❌ FORBIDDEN: Generic advice, theory without application, vague percentages
✅ REQUIRED: Specific tactics, exact steps, measurable outcomes
`;

  switch (format) {
    case 'interactive_quiz':
      return `${baseContext}

${founderIntro}

${valueStandards}

CREATE A BULLETPROOF 10-QUESTION DIAGNOSTIC CHECKLIST SYSTEM:

This must be a comprehensive diagnostic tool that provides professional-grade insights and actionable solutions.

CRITICAL REQUIREMENTS:
- EXACTLY 10 questions (no more, no less)
- Each question must have 4 answer options (A, B, C, D)
- Questions must build on each other logically
- Each answer must contribute to a specific diagnosis category
- Results must include actionable next steps with timelines
- Include success metrics and troubleshooting

RESULTS REQUIREMENTS:
- You MUST return a 'results' array with EXACTLY these 4 categories:
  - 'Foundation Builder'
  - 'Implementation Specialist'
  - 'Optimization Expert'
  - 'Strategic Master'
- For each, provide:
  - description: tailored to the user's [topic/problem]
  - symptoms: 3-5 bullet points, specific to [topic/problem]
  - action_steps: 4-6, step-by-step, specific to [topic/problem]
  - timeline: realistic for [topic/problem]
  - success_metrics: 3-5, measurable, specific to [topic/problem]
  - recommendations: 3-5, actionable, specific to [topic/problem]
- The 'category' string must match exactly as above.
- If you cannot generate a result, use a static fallback with [topic/problem] inserted.

RETURN ONLY VALID JSON IN THIS EXACT FORMAT. DO NOT INCLUDE MARKDOWN, EXPLANATION, OR EXTRA TEXT. IF YOU CANNOT GENERATE THE QUIZ, RETURN A STATIC FALLBACK QUIZ WITH 10 GENERIC QUESTIONS IN THE SAME FORMAT:
{
  "structured_content": {
    "title_page": {
      "title": "${outline.title}",
      "subtitle": "10-Question Diagnostic to Identify Your Core Challenges"
    },
    "introduction_page": {
      "title": "Professional Problem Diagnosis",
      "content": "This 10-question diagnostic will reveal the root causes of your [specific problem] and provide a personalized action plan with exact next steps."
    },
    "quiz_content": {
      "title": "Your Diagnostic Checklist",
      "description": "Answer each question honestly to get your personalized diagnosis and action plan.",
      "questions": [
        {
          "id": 1,
          "question": "[SPECIFIC QUESTION 1 ABOUT AWARENESS - e.g., 'How would you rate your current understanding of [topic]?']",
          "options": [
            {
              "id": "A",
              "text": "[OPTION A - Beginner level]",
              "score": { "awareness": 1, "implementation": 1, "optimization": 0, "strategy": 0 }
            },
            {
              "id": "B", 
              "text": "[OPTION B - Some knowledge]",
              "score": { "awareness": 2, "implementation": 1, "optimization": 0, "strategy": 0 }
            },
            {
              "id": "C",
              "text": "[OPTION C - Good understanding]",
              "score": { "awareness": 3, "implementation": 2, "optimization": 1, "strategy": 0 }
            },
            {
              "id": "D",
              "text": "[OPTION D - Expert level]",
              "score": { "awareness": 4, "implementation": 3, "optimization": 2, "strategy": 1 }
            }
          ],
          "explanation": "This identifies your current knowledge level and learning needs"
        },
        {
          "id": 2,
          "question": "[SPECIFIC QUESTION 2 ABOUT CURRENT PRACTICES - e.g., 'What is your current approach to [specific aspect]?']",
          "options": [
            {
              "id": "A",
              "text": "[OPTION A - No systematic approach]",
              "score": { "awareness": 0, "implementation": 0, "optimization": 0, "strategy": 0 }
            },
            {
              "id": "B",
              "text": "[OPTION B - Basic approach]",
              "score": { "awareness": 1, "implementation": 1, "optimization": 0, "strategy": 0 }
            },
            {
              "id": "C",
              "text": "[OPTION C - Structured approach]",
              "score": { "awareness": 2, "implementation": 2, "optimization": 1, "strategy": 1 }
            },
            {
              "id": "D",
              "text": "[OPTION D - Advanced system]",
              "score": { "awareness": 3, "implementation": 3, "optimization": 2, "strategy": 2 }
            }
          ],
          "explanation": "This reveals your current implementation level and gaps"
        },
        {
          "id": 3,
          "question": "[SPECIFIC QUESTION 3 ABOUT CHALLENGES - e.g., 'What is your biggest challenge with [topic]?']",
          "options": [
            {
              "id": "A",
              "text": "[OPTION A - Lack of knowledge]",
              "score": { "awareness": 0, "implementation": 0, "optimization": 0, "strategy": 0 }
            },
            {
              "id": "B",
              "text": "[OPTION B - Inconsistent execution]",
              "score": { "awareness": 1, "implementation": 0, "optimization": 0, "strategy": 0 }
            },
            {
              "id": "C",
              "text": "[OPTION C - Optimization issues]",
              "score": { "awareness": 2, "implementation": 1, "optimization": 0, "strategy": 0 }
            },
            {
              "id": "D",
              "text": "[OPTION D - Strategic gaps]",
              "score": { "awareness": 3, "implementation": 2, "optimization": 1, "strategy": 0 }
            }
          ],
          "explanation": "This identifies your primary obstacle and focus area"
        },
        {
          "id": 4,
          "question": "[SPECIFIC QUESTION 4 ABOUT RESOURCES - e.g., 'What resources do you have available for [topic]?']",
          "options": [
            {
              "id": "A",
              "text": "[OPTION A - Limited resources]",
              "score": { "awareness": 0, "implementation": 0, "optimization": 0, "strategy": 0 }
            },
            {
              "id": "B",
              "text": "[OPTION B - Basic resources]",
              "score": { "awareness": 1, "implementation": 1, "optimization": 0, "strategy": 0 }
            },
            {
              "id": "C",
              "text": "[OPTION C - Good resources]",
              "score": { "awareness": 2, "implementation": 2, "optimization": 1, "strategy": 1 }
            },
            {
              "id": "D",
              "text": "[OPTION D - Excellent resources]",
              "score": { "awareness": 3, "implementation": 3, "optimization": 2, "strategy": 2 }
            }
          ],
          "explanation": "This determines your resource constraints and opportunities"
        },
        {
          "id": 5,
          "question": "[SPECIFIC QUESTION 5 ABOUT TIMELINE - e.g., 'What is your timeline for improving [topic]?']",
          "options": [
            {
              "id": "A",
              "text": "[OPTION A - Immediate (1-2 weeks)]",
              "score": { "awareness": 1, "implementation": 2, "optimization": 1, "strategy": 0 }
            },
            {
              "id": "B",
              "text": "[OPTION B - Short-term (1-3 months)]",
              "score": { "awareness": 2, "implementation": 2, "optimization": 1, "strategy": 1 }
            },
            {
              "id": "C",
              "text": "[OPTION C - Medium-term (3-6 months)]",
              "score": { "awareness": 2, "implementation": 2, "optimization": 2, "strategy": 2 }
            },
            {
              "id": "D",
              "text": "[OPTION D - Long-term (6+ months)]",
              "score": { "awareness": 3, "implementation": 3, "optimization": 3, "strategy": 3 }
            }
          ],
          "explanation": "This determines the pace and intensity of your action plan"
        },
        {
          "id": 6,
          "question": "[SPECIFIC QUESTION 6 ABOUT PAST EXPERIENCE - e.g., 'What has been your experience with [topic] so far?']",
          "options": [
            {
              "id": "A",
              "text": "[OPTION A - No experience]",
              "score": { "awareness": 0, "implementation": 0, "optimization": 0, "strategy": 0 }
            },
            {
              "id": "B",
              "text": "[OPTION B - Limited success]",
              "score": { "awareness": 1, "implementation": 1, "optimization": 0, "strategy": 0 }
            },
            {
              "id": "C",
              "text": "[OPTION C - Moderate success]",
              "score": { "awareness": 2, "implementation": 2, "optimization": 1, "strategy": 1 }
            },
            {
              "id": "D",
              "text": "[OPTION D - Good success]",
              "score": { "awareness": 3, "implementation": 3, "optimization": 2, "strategy": 2 }
            }
          ],
          "explanation": "This reveals your learning curve and what works for you"
        },
        {
          "id": 7,
          "question": "[SPECIFIC QUESTION 7 ABOUT GOALS - e.g., 'What is your primary goal with [topic]?']",
          "options": [
            {
              "id": "A",
              "text": "[OPTION A - Basic understanding]",
              "score": { "awareness": 2, "implementation": 1, "optimization": 0, "strategy": 0 }
            },
            {
              "id": "B",
              "text": "[OPTION B - Practical implementation]",
              "score": { "awareness": 1, "implementation": 2, "optimization": 1, "strategy": 0 }
            },
            {
              "id": "C",
              "text": "[OPTION C - Optimization and improvement]",
              "score": { "awareness": 1, "implementation": 1, "optimization": 2, "strategy": 1 }
            },
            {
              "id": "D",
              "text": "[OPTION D - Strategic mastery]",
              "score": { "awareness": 1, "implementation": 1, "optimization": 1, "strategy": 2 }
            }
          ],
          "explanation": "This determines your desired outcome and focus areas"
        },
        {
          "id": 8,
          "question": "[SPECIFIC QUESTION 8 ABOUT SUPPORT - e.g., 'What kind of support do you need for [topic]?']",
          "options": [
            {
              "id": "A",
              "text": "[OPTION A - Basic guidance]",
              "score": { "awareness": 1, "implementation": 1, "optimization": 0, "strategy": 0 }
            },
            {
              "id": "B",
              "text": "[OPTION B - Step-by-step instructions]",
              "score": { "awareness": 1, "implementation": 2, "optimization": 1, "strategy": 0 }
            },
            {
              "id": "C",
              "text": "[OPTION C - Advanced techniques]",
              "score": { "awareness": 1, "implementation": 1, "optimization": 2, "strategy": 1 }
            },
            {
              "id": "D",
              "text": "[OPTION D - Strategic consulting]",
              "score": { "awareness": 1, "implementation": 1, "optimization": 1, "strategy": 2 }
            }
          ],
          "explanation": "This identifies your support needs and learning style"
        },
        {
          "id": 9,
          "question": "[SPECIFIC QUESTION 9 ABOUT COMMITMENT - e.g., 'How much time can you dedicate to [topic]?']",
          "options": [
            {
              "id": "A",
              "text": "[OPTION A - 1-2 hours per week]",
              "score": { "awareness": 1, "implementation": 1, "optimization": 0, "strategy": 0 }
            },
            {
              "id": "B",
              "text": "[OPTION B - 3-5 hours per week]",
              "score": { "awareness": 2, "implementation": 2, "optimization": 1, "strategy": 0 }
            },
            {
              "id": "C",
              "text": "[OPTION C - 6-10 hours per week]",
              "score": { "awareness": 2, "implementation": 2, "optimization": 2, "strategy": 1 }
            },
            {
              "id": "D",
              "text": "[OPTION D - 10+ hours per week]",
              "score": { "awareness": 3, "implementation": 3, "optimization": 3, "strategy": 2 }
            }
          ],
          "explanation": "This determines the intensity and pace of your action plan"
        },
        {
          "id": 10,
          "question": "[SPECIFIC QUESTION 10 ABOUT MEASUREMENT - e.g., 'How do you plan to measure success with [topic]?']",
          "options": [
            {
              "id": "A",
              "text": "[OPTION A - No specific metrics]",
              "score": { "awareness": 0, "implementation": 0, "optimization": 0, "strategy": 0 }
            },
            {
              "id": "B",
              "text": "[OPTION B - Basic tracking]",
              "score": { "awareness": 1, "implementation": 1, "optimization": 0, "strategy": 0 }
            },
            {
              "id": "C",
              "text": "[OPTION C - Detailed metrics]",
              "score": { "awareness": 2, "implementation": 2, "optimization": 1, "strategy": 1 }
            },
            {
              "id": "D",
              "text": "[OPTION D - Advanced analytics]",
              "score": { "awareness": 3, "implementation": 3, "optimization": 2, "strategy": 2 }
            }
          ],
          "explanation": "This determines your measurement approach and success tracking"
        }
      ],
      "results": [
        {
          "category": "Foundation Builder",
          "description": "You're just starting your journey with [topic]. You need to build a solid foundation with basic knowledge and simple implementation steps.",
          "score_range": { "min": 0, "max": 15 },
          "symptoms": [
            "Limited understanding of [topic] fundamentals",
            "No systematic approach to implementation",
            "Lack of basic tools and resources",
            "Unclear success metrics"
          ],
          "action_steps": [
            "Week 1: Complete [topic] fundamentals course (2 hours)",
            "Week 2: Set up basic tracking system (1 hour)",
            "Week 3: Implement first simple strategy (3 hours)",
            "Week 4: Review and adjust approach (1 hour)"
          ],
          "timeline": "4 weeks to see initial results",
          "success_metrics": [
            "Complete understanding of [topic] basics",
            "Basic implementation system in place",
            "First successful application documented",
            "Clear measurement framework established"
          ],
          "recommendations": [
            "Start with proven fundamentals to build confidence",
            "Use simple templates and checklists",
            "Focus on consistency over perfection",
            "Track progress with basic metrics"
          ]
        },
        {
          "category": "Implementation Specialist",
          "description": "You have good knowledge of [topic] but need help with consistent implementation and optimization. Focus on systematic execution and improvement.",
          "score_range": { "min": 16, "max": 25 },
          "symptoms": [
            "Good theoretical knowledge but inconsistent practice",
            "Some successful implementations but not systematic",
            "Need help with optimization and scaling",
            "Looking for proven frameworks and systems"
          ],
          "action_steps": [
            "Week 1: Audit current practices and identify gaps (3 hours)",
            "Week 2: Implement systematic approach (5 hours)",
            "Week 3: Optimize based on initial results (3 hours)",
            "Week 4: Scale successful elements (4 hours)"
          ],
          "timeline": "3-4 weeks to see significant improvement",
          "success_metrics": [
            "Consistent implementation of [topic] strategies",
            "20-30% improvement in key metrics",
            "Systematic approach documented and refined",
            "Clear optimization process established"
          ],
          "recommendations": [
            "Focus on systematic implementation over theory",
            "Use proven frameworks and templates",
            "Optimize based on data and results",
            "Build scalable processes for growth"
          ]
        },
        {
          "category": "Optimization Expert",
          "description": "You have solid implementation skills and are ready to optimize and refine your [topic] approach. Focus on advanced techniques and strategic improvements.",
          "score_range": { "min": 26, "max": 35 },
          "symptoms": [
            "Strong implementation foundation in place",
            "Looking for advanced optimization techniques",
            "Ready to refine and improve existing systems",
            "Interested in strategic enhancements"
          ],
          "action_steps": [
            "Week 1: Advanced optimization techniques (4 hours)",
            "Week 2: Strategic refinement of current systems (5 hours)",
            "Week 3: Implementation of advanced strategies (6 hours)",
            "Week 4: Performance analysis and further optimization (3 hours)"
          ],
          "timeline": "2-3 weeks to see advanced results",
          "success_metrics": [
            "Advanced optimization techniques implemented",
            "40-50% improvement in performance metrics",
            "Strategic enhancements documented",
            "Advanced measurement systems in place"
          ],
          "recommendations": [
            "Focus on advanced optimization techniques",
            "Implement strategic enhancements",
            "Use sophisticated measurement systems",
            "Develop competitive advantages"
          ]
        },
        {
          "category": "Strategic Master",
          "description": "You have mastered the fundamentals and optimization of [topic]. Now focus on strategic mastery and becoming an industry leader in this area.",
          "score_range": { "min": 36, "max": 40 },
          "symptoms": [
            "Advanced knowledge and implementation skills",
            "Looking for strategic mastery and leadership",
            "Ready to innovate and create new approaches",
            "Interested in industry leadership and influence"
          ],
          "action_steps": [
            "Week 1: Strategic innovation and leadership (6 hours)",
            "Week 2: Industry positioning and influence (5 hours)",
            "Week 3: Advanced strategic implementation (7 hours)",
            "Week 4: Leadership development and mentoring (4 hours)"
          ],
          "timeline": "2-3 weeks to establish leadership position",
          "success_metrics": [
            "Strategic mastery demonstrated",
            "Industry leadership position established",
            "Innovation and influence documented",
            "Mentoring and teaching capabilities developed"
          ],
          "recommendations": [
            "Focus on strategic innovation and leadership",
            "Develop industry influence and positioning",
            "Create new approaches and methodologies",
            "Mentor others and share expertise"
          ]
        }
      ]
    }
  }
}`;









    case 'pdf':
      return `${baseContext}

${founderIntro}

${valueStandards}

CREATE A COMPREHENSIVE IMPLEMENTATION SYSTEM:

This must be a complete, plug-and-play system with everything needed for success.

REQUIRED STRUCTURE:
1. **System Overview**: The complete process from start to finish
2. **Implementation Phases**: 3-5 phases with exact steps and timelines
3. **Tool Arsenal**: 15+ templates, scripts, checklists, and frameworks
4. **Case Studies**: 3+ detailed examples with specific results
5. **Troubleshooting Guide**: Common problems and exact solutions
6. **Optimization Strategies**: How to improve results over time

CRITICAL REQUIREMENTS:
- Include step-by-step processes with exact instructions
- Provide comprehensive tool kit with templates and scripts
- Include detailed case studies with measurable results
- Cover common mistakes and how to avoid them

RETURN JSON IN THIS EXACT FORMAT:
{
  "structured_content": {
  "title_page": {
      "title": "${outline.title}",
      "subtitle": "A step-by-step blueprint to help you achieve your goals"
    },
    "introduction": "Complete introduction explaining the system and what users will achieve",
  "toolkit_sections": [
    {
        "title": "Strategy Analysis",
        "type": "pros_and_cons_list",
        "content": {
          "items": [
            {
              "method_name": "Strategy 1: [Specific Method Name]",
              "pros": "• Immediate impact on [specific metric]\n• Easy to implement with [specific tool]\n• Proven to work in [specific industry/situation]\n• Cost-effective with [specific budget range]",
              "cons": "• Requires [specific time commitment]\n• May need [specific resources]\n• Initial learning curve of [specific timeframe]"
            },
            {
              "method_name": "Strategy 2: [Specific Method Name]",
              "pros": "• Delivers [specific result] within [timeframe]\n• Scalable to [specific growth level]\n• Integrates with [specific existing systems]\n• ROI of [specific percentage]",
              "cons": "• Requires [specific investment]\n• Needs [specific expertise]\n• Takes [specific timeframe] to see results"
            },
            {
              "method_name": "Strategy 3: [Specific Method Name]",
              "pros": "• Addresses [specific pain point] directly\n• Provides [specific measurable outcome]\n• Works with [specific constraints]\n• Delivers [specific value proposition]",
              "cons": "• Requires [specific upfront work]\n• May need [specific adjustments]\n• Initial setup takes [specific time]"
            }
          ]
        }
      },
      {
        "title": "Action Checklist",
        "type": "checklist",
        "content": {
          "phases": [
            {
              "phase_title": "Phase 1: Foundation Setup (Days 1-7)",
              "items": [
                "Set up your [specific tool/system]",
                "Create your [specific tracking mechanism]",
                "Establish your [specific baseline metrics]",
                "Prepare your [specific resources]"
              ]
            },
            {
              "phase_title": "Phase 2: Implementation (Days 8-21)",
              "items": [
                "Execute [specific daily actions]",
                "Track [specific key metrics]",
                "Optimize based on [specific feedback]",
                "Scale [specific successful elements]"
              ]
            },
            {
              "phase_title": "Phase 3: Optimization (Days 22-30)",
              "items": [
                "Analyze [specific performance data]",
                "Refine [specific processes]",
                "Implement [specific improvements]",
                "Prepare for [specific next phase]"
              ]
            }
          ]
        }
      },
      {
        "title": "Conversation Scripts",
        "type": "scripts",
        "content": {
          "scenarios": [
            {
              "trigger": "When someone says [specific objection/question]",
              "response": "You say: [specific proven response that addresses the concern]",
              "explanation": "This works because [specific psychological principle or proven tactic]"
            },
            {
              "trigger": "When someone asks [specific question]",
              "response": "You say: [specific response that provides value and builds trust]",
              "explanation": "This approach [specific benefit or outcome it delivers]"
            },
            {
              "trigger": "When someone shows [specific interest signal]",
              "response": "You say: [specific response that capitalizes on the opportunity]",
              "explanation": "This converts because [specific conversion principle or tactic]"
            }
          ]
        }
      }
    ],
    "cta": "Ready to take your business to the next level? Download your complete system now."
  }
}`;

    default:
      throw new Error(`Unknown format: ${format}`);
  }
}

// Helper function to format layout-focused section content into readable format
function formatLayoutSectionContent(section: any): string {
  switch (section.type) {
    case 'checklist':
      let checklistContent = '';
      section.content.phases.forEach((phase: any) => {
        checklistContent += `\n${phase.phase_title}\n`;
        phase.items.forEach((item: string) => {
          checklistContent += `${item}\n`;
        });
      });
      return checklistContent;
    
    case 'scripts':
      return section.content.scenarios.map((scenario: any, index: number) => {
        return `Scenario ${index + 1}:\nWhen they say: "${scenario.trigger}"\nYou say: "${scenario.response}"\nStrategy: ${scenario.explanation}`;
      }).join('\n\n');
    
    case 'mistakes_to_avoid':
      return section.content.mistakes.map((mistake: any, index: number) => {
        return `${index + 1}. The Mistake: ${mistake.mistake}\nThe Solution: ${mistake.solution}`;
      }).join('\n\n');
    
    case 'pros_and_cons_list':
      return section.content.items.map((item: any, index: number) => {
        return `${index + 1}. ${item.method_name}\n\nPros: ${item.pros}\n\nCons: ${item.cons}`;
      }).join('\n\n');
    
    case 'step_by_step_guide':
      return section.content.steps.map((step: any, index: number) => {
        return `${step.step_title}\n${step.description}`;
      }).join('\n\n');
    
    case 'template':
      return section.content.template || section.content;
    
    default:
      return section.content || 'Content not available';
  }
}

export async function generateLandingPageCopy(input: CampaignInput, outline: ContentOutline): Promise<LandingPageCopy> {
  const client = getOpenAIClient();
  let content = '';

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
5. Example: Add a real-life example or micro-case study (1-2 sentences) showing the transformation or benefit.
6. Template: If possible, include a plug-and-play template or swipe file for the user to use immediately.

IMPORTANT:
- Focus on the transformation the user will experience
- Use clear, concise, actionable language—avoid generic advice
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
  "cta_button_text": "Get Instant Access",
  "example": "A real-life example or micro-case study (1-2 sentences)",
  "template": "A plug-and-play template or swipe file (if applicable)"
}`;

    const res = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a direct-response copywriter. Output strictly valid JSON as defined.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1200
    });

    if (!res.choices?.[0]?.message?.content) {
      throw new Error('Empty response received from OpenAI API');
    }

    content = res.choices[0].message.content;
    
    // Clean the content to handle markdown-wrapped JSON
    const cleanedContent = cleanJsonResponse(content);
    console.log('🎯 OpenAI Landing Page Response (cleaned):', cleanedContent);
    const parsed = JSON.parse(jsonrepair(cleanedContent));

    // Validate the response structure
    if (!parsed.headline || !parsed.subheadline || !Array.isArray(parsed.benefit_bullets) || !parsed.cta_button_text) {
      throw new Error('Invalid response format from OpenAI API');
    }

    // Ensure benefit_bullets is a usable array, even if the AI messes up.
if (!parsed.benefit_bullets || !Array.isArray(parsed.benefit_bullets) || parsed.benefit_bullets.length === 0) {
    // If the AI failed to provide bullets, create some safe defaults. This is better than crashing.
    parsed.benefit_bullets = [
        `Unlock ${input.desired_outcome}`,
        `Solve ${input.pain_point} Instantly`,
        `Get Actionable Insights Today`
    ];
}

// If the AI was overeager and gave too many bullets, just take the first 4.
parsed.benefit_bullets = parsed.benefit_bullets.slice(0, 4);

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
    } else if (err.message.includes('JSON') || err.message.includes('Unexpected token')) {
      console.error('JSON parsing error. Original content:', content);
      throw new Error('Failed to process the landing page content. Please try again.');
    }

    throw new Error(`Failed to generate landing page copy: ${err.message}`);
  }
}

export async function generateSocialPosts(input: CampaignInput, outline: ContentOutline): Promise<SocialPosts> {
  const client = getOpenAIClient();
  let content = '';

  try {
    const prompt = `You are a social media manager. Your task is to create promotional posts for a new lead magnet.

LEAD MAGNET DETAILS:
- Title: ${outline.title}
- Main Benefit: ${outline.introduction}
- Target Audience: ${input.target_audience}
- Brand Name: ${input.brand_name}
- Tone: ${input.tone}

INSTRUCTIONS:
Create four distinct social media posts to drive downloads. Each post should:
1. Be platform-appropriate and engaging
2. Include relevant hashtags (2-3 per post, except Reddit)
3. Have a clear call-to-action
4. Match the brand's tone: ${input.tone}
5. For at least one post, include a real-life example, micro-case study, or plug-and-play template/swipe file (1-2 sentences).
6. Use sharp, actionable language—avoid generic advice.

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

4. Reddit (Conversational & Community-Focused):
   - Write as if posting to a relevant subreddit
   - Be longer, more detailed, and invite discussion
   - Ask a question or share a personal experience
   - No hashtags, no emojis
   - Use a conversational, authentic tone
   - At the end, suggest 2-3 relevant subreddits (as a list) where this post could be shared, based on the topic and audience.

Return JSON in this exact format:
{
  "linkedin": "Professional post text with 1-2 hashtags... #example #marketing",
  "twitter": "Engaging tweet under 280 chars with 1-2 hashtags... #example",
  "instagram": "Engaging Instagram caption with 2-3 hashtags... #example #socialmedia #tips",
  "reddit": "Conversational Reddit post, longer, no hashtags, invites discussion.",
  "subreddits": ["subreddit1", "subreddit2", "subreddit3"],
  "example": "A real-life example or micro-case study (1-2 sentences)",
  "template": "A plug-and-play template or swipe file (if applicable)"
}`;

    const res = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a social media manager. Output strictly valid JSON as defined.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 1500
    });

    if (!res.choices?.[0]?.message?.content) {
      throw new Error('Empty response received from OpenAI API');
    }

    content = res.choices[0].message.content;
    
    // Clean the content to handle markdown-wrapped JSON
    const cleanedContent = cleanJsonResponse(content);
    console.log('🎯 OpenAI Social Posts Response (cleaned):', cleanedContent);
    const parsed = JSON.parse(jsonrepair(cleanedContent));

    // Validate the response structure
    if (!parsed.linkedin || !parsed.twitter || !parsed.instagram || !parsed.reddit || !parsed.subreddits) {
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
    } else if (err.message.includes('JSON') || err.message.includes('Unexpected token')) {
      console.error('JSON parsing error. Original content:', content);
      throw new Error('Failed to process the social media content. Please try again.');
    }

    throw new Error(`Failed to generate social media posts: ${err.message}`);
  }
}

export async function generateFinalCampaign(input: CampaignInput, outline: ContentOutline, customization?: PDFCustomization): Promise<CampaignOutput> {
  const client = getOpenAIClient();

  try {
    // Generate content sequentially instead of in parallel for better error handling
    const format = input.selected_format || 'pdf';
    const formatDisplayName = format === 'pdf' ? 'PDF' : format.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    console.log(`Starting ${formatDisplayName} content generation...`);
    
    // Create the input object for the new generateLeadMagnetContent signature
    const contentInput = {
      selected_format: format,
      name: input.name || '',
      brand_name: input.brand_name,
      target_audience: input.target_audience,
      niche: input.niche,
      problem_statement: input.problem_statement,
      desired_outcome: input.desired_outcome,
      tone: input.tone || 'professional',
      position: input.position || '',
      concept: { id: '1', title: 'Generated Concept', description: '', value_proposition: '', target_audience: '', format: format },
      outline: outline
    };
    
    const lead_magnet_content = await generateLeadMagnetContent(contentInput).catch(err => {
      console.error(`${formatDisplayName} Generation Error:`, err);
      throw new Error(`${formatDisplayName} Generation Failed: ${err.message}`);
    });

    console.log('Starting landing page generation...');
    const landing_page = await generateLandingPageCopy(input, outline).catch(err => {
      console.error('Landing Page Generation Error:', err);
      throw new Error(`Landing Page Generation Failed: ${err.message}`);
    });

    console.log('Starting social posts generation...');
    const social_posts = await generateSocialPosts(input, outline).catch(err => {
      console.error('Social Posts Generation Error:', err);
      throw new Error(`Social Posts Generation Failed: ${err.message}`);
    });

    // Validate all required content was generated
    if (!lead_magnet_content) throw new Error(`${formatDisplayName} content generation failed`);
    if (!landing_page) throw new Error('Landing page generation failed');
    if (!social_posts) throw new Error('Social posts generation failed');

    // Use the structured content that was already generated by generateLeadMagnetContent
    const structured_content: PDFContent = {
      ...lead_magnet_content,
      // Keep the original structured_content that was generated by generateLeadMagnetContent
      structured_content: lead_magnet_content.structured_content
    };

    console.log('Campaign generation completed successfully');
    return {
      pdf_content: structured_content,
      landing_page,
      social_posts
    };
  } catch (err: any) {
    console.error('Campaign Generation Error:', {
      message: err.message,
      stack: err.stack,
      cause: err.cause,
      type: err.type,
      code: err.code
    });

    // Handle specific OpenAI API errors
    if (err.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please check your billing status.');
    } else if (err.code === 'rate_limit_exceeded') {
      throw new Error('OpenAI API rate limit exceeded. Please wait a moment and try again.');
    } else if (err.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please check your API key configuration.');
    } else if (err.message.includes('timeout')) {
      throw new Error('Request timed out. The server is taking too long to respond. Please try again.');
    } else if (err.message.includes('JSON')) {
      throw new Error('Failed to process AI response. Please try again.');
    }

    // If it's a specific generation error, pass it through
    if (err.message.includes('Generation Failed:')) {
      throw err;
    }

    // For unknown errors, provide a generic message
    throw new Error('Failed to generate campaign content. Please try again.');
  }
}