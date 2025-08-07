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
    JSON.parse(cleaned);
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
    const parsed = JSON.parse(cleanedContent);

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
    const parsed = JSON.parse(cleanedContent);

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
    const pdfContent = JSON.parse(cleanedContent) as PDFContent;
    
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

CREATE A PROFESSIONAL DIAGNOSTIC QUIZ SYSTEM:

This must be a complete diagnostic tool that provides professional-grade insights and actionable solutions.

REQUIRED STRUCTURE:
1. **Diagnostic Framework**: Explain the methodology behind the questions
2. **Question Bank**: 8-12 strategic questions that build on each other
3. **Scoring System**: How answers combine to create accurate diagnosis
4. **Result Categories**: 4-6 specific diagnosis types with solutions
5. **Action Protocols**: Exact next steps for each diagnosis type
6. **Success Tracking**: How to measure improvement

CRITICAL REQUIREMENTS:
- Questions must reveal ROOT CAUSES, not just symptoms
- Each result category needs SPECIFIC action steps
- Include success metrics and timelines
- Provide troubleshooting for each diagnosis type
- Questions must be SPECIFIC to the niche and problem
- Results must be ACTIONABLE and TIMELINE-BASED

RETURN JSON IN THIS EXACT FORMAT:
{
  "founder_intro": "Personal introduction explaining why you created this diagnostic and what results users will get",
  "title_page": {
    "title": "${outline.title}",
    "subtitle": "A Professional-Grade Diagnostic Tool for [Specific Problem]"
  },
  "introduction_page": {
    "title": "How This Diagnostic Works",
    "content": "Explain the professional methodology and what insights they'll receive"
  },
  "quiz_content": {
    "title": "Professional Diagnostic Assessment",
    "questions": [
      {
        "question": "[SPECIFIC QUESTION 1 ABOUT THE PROBLEM - e.g., 'What's your biggest challenge with [topic]?']",
        "options": ["[SPECIFIC OPTION 1]", "[SPECIFIC OPTION 2]", "[SPECIFIC OPTION 3]", "[SPECIFIC OPTION 4]"],
        "explanation": "This reveals your primary pain point and helps categorize your situation"
      },
      {
        "question": "[SPECIFIC QUESTION 2 ABOUT CONFIDENCE - e.g., 'How confident are you in your [topic] abilities?']",
        "options": ["[SPECIFIC OPTION 1]", "[SPECIFIC OPTION 2]", "[SPECIFIC OPTION 3]", "[SPECIFIC OPTION 4]"],
        "explanation": "This helps determine your confidence level and experience"
      },
      {
        "question": "[SPECIFIC QUESTION 3 ABOUT CURRENT BEHAVIOR - e.g., 'What's your typical approach to [topic]?']",
        "options": ["[SPECIFIC OPTION 1]", "[SPECIFIC OPTION 2]", "[SPECIFIC OPTION 3]", "[SPECIFIC OPTION 4]"],
        "explanation": "This shows your current approach and what might be missing"
      },
      {
        "question": "[SPECIFIC QUESTION 4 ABOUT DESIRED OUTCOME - e.g., 'What would success look like for your [topic] goals?']",
        "options": ["[SPECIFIC OPTION 1]", "[SPECIFIC OPTION 2]", "[SPECIFIC OPTION 3]", "[SPECIFIC OPTION 4]"],
        "explanation": "This helps tailor the solution to your specific goals"
      },
      {
        "question": "[SPECIFIC QUESTION 5 ABOUT OBSTACLES - e.g., 'What's stopping you from achieving your [topic] goals?']",
        "options": ["[SPECIFIC OPTION 1]", "[SPECIFIC OPTION 2]", "[SPECIFIC OPTION 3]", "[SPECIFIC OPTION 4]"],
        "explanation": "This identifies the main barriers to your success"
      },
      {
        "question": "[SPECIFIC QUESTION 6 ABOUT KNOWLEDGE - e.g., 'How much do you know about [topic] principles?']",
        "options": ["[SPECIFIC OPTION 1]", "[SPECIFIC OPTION 2]", "[SPECIFIC OPTION 3]", "[SPECIFIC OPTION 4]"],
        "explanation": "This assesses your current knowledge level"
      },
      {
        "question": "[SPECIFIC QUESTION 7 ABOUT RESOURCES - e.g., 'What [topic] resources do you currently use?']",
        "options": ["[SPECIFIC OPTION 1]", "[SPECIFIC OPTION 2]", "[SPECIFIC OPTION 3]", "[SPECIFIC OPTION 4]"],
        "explanation": "This shows what tools and resources you're already using"
      },
      {
        "question": "[SPECIFIC QUESTION 8 ABOUT TIMELINE - e.g., 'How quickly do you want to see improvement in your [topic]?']",
        "options": ["[SPECIFIC OPTION 1]", "[SPECIFIC OPTION 2]", "[SPECIFIC OPTION 3]", "[SPECIFIC OPTION 4]"],
        "explanation": "This helps set realistic expectations and timelines"
      },
      {
        "question": "[SPECIFIC QUESTION 9 ABOUT SUPPORT - e.g., 'What kind of support do you need to improve your [topic]?']",
        "options": ["[SPECIFIC OPTION 1]", "[SPECIFIC OPTION 2]", "[SPECIFIC OPTION 3]", "[SPECIFIC OPTION 4]"],
        "explanation": "This identifies what type of guidance would be most helpful"
      },
      {
        "question": "[SPECIFIC QUESTION 10 ABOUT COMMITMENT - e.g., 'How much time can you dedicate to improving your [topic]?']",
        "options": ["[SPECIFIC OPTION 1]", "[SPECIFIC OPTION 2]", "[SPECIFIC OPTION 3]", "[SPECIFIC OPTION 4]"],
        "explanation": "This determines the intensity and pace of your action plan"
      }
    ],
    "results": [
      {
        "category": "[SPECIFIC DIAGNOSIS TYPE - e.g., 'Color Theory Beginner']",
        "description": "[WRITE A DETAILED PARAGRAPH WITH 3 SPECIFIC SENTENCES EXPLAINING WHAT THIS DIAGNOSIS MEANS, WHY IT HAPPENS, AND WHAT THE USER SHOULD EXPECT]",
        "symptoms": ["[SPECIFIC SYMPTOM 1]", "[SPECIFIC SYMPTOM 2]", "[SPECIFIC SYMPTOM 3]"],
        "action_steps": ["[SPECIFIC STEP 1 WITH TIMELINE - e.g., 'Week 1: Learn basic [topic] principles']", "[SPECIFIC STEP 2 WITH TIMELINE - e.g., 'Week 2: Practice with your existing [topic] approach']", "[SPECIFIC STEP 3 WITH TIMELINE - e.g., 'Week 3: Experiment with new [topic] strategies']"],
        "timeline": "[SPECIFIC TIMELINE - e.g., '2-3 weeks to see improvement']",
        "success_metrics": ["[SPECIFIC METRIC 1]", "[SPECIFIC METRIC 2]", "[SPECIFIC METRIC 3]"],
        "recommendations": ["[SPECIFIC RECOMMENDATION 1 - e.g., 'Start with basic [topic] fundamentals to build confidence']", "[SPECIFIC RECOMMENDATION 2 - e.g., 'Use proven [topic] frameworks to identify opportunities']", "[SPECIFIC RECOMMENDATION 3 - e.g., 'Practice with your existing [topic] foundation']", "[SPECIFIC RECOMMENDATION 4 - e.g., 'Track your [topic] progress for continuous improvement']"]
      },
      {
        "category": "[SPECIFIC DIAGNOSIS TYPE - e.g., 'Style Confidence Builder']",
        "description": "[WRITE A DETAILED PARAGRAPH WITH 3 SPECIFIC SENTENCES EXPLAINING WHAT THIS DIAGNOSIS MEANS, WHY IT HAPPENS, AND WHAT THE USER SHOULD EXPECT]",
        "symptoms": ["[SPECIFIC SYMPTOM 1]", "[SPECIFIC SYMPTOM 2]", "[SPECIFIC SYMPTOM 3]"],
        "action_steps": ["[SPECIFIC STEP 1 WITH TIMELINE - e.g., 'Week 1: Identify your [topic] personality type']", "[SPECIFIC STEP 2 WITH TIMELINE - e.g., 'Week 2: Build a [topic] foundation']", "[SPECIFIC STEP 3 WITH TIMELINE - e.g., 'Week 3: Practice daily [topic] exercises']"],
        "timeline": "[SPECIFIC TIMELINE - e.g., '1-2 weeks to see improvement']",
        "success_metrics": ["[SPECIFIC METRIC 1]", "[SPECIFIC METRIC 2]", "[SPECIFIC METRIC 3]"],
        "recommendations": ["[SPECIFIC RECOMMENDATION 1 - e.g., 'Create a [topic] mood board for inspiration']", "[SPECIFIC RECOMMENDATION 2 - e.g., 'Start with [topic] approaches you feel comfortable with']", "[SPECIFIC RECOMMENDATION 3 - e.g., 'Gradually experiment with bolder [topic] choices']", "[SPECIFIC RECOMMENDATION 4 - e.g., 'Seek feedback from trusted mentors or colleagues']"]
      },
      {
        "category": "[SPECIFIC DIAGNOSIS TYPE - e.g., 'Advanced Style Optimizer']",
        "description": "[WRITE A DETAILED PARAGRAPH WITH 3 SPECIFIC SENTENCES EXPLAINING WHAT THIS DIAGNOSIS MEANS, WHY IT HAPPENS, AND WHAT THE USER SHOULD EXPECT]",
        "symptoms": ["[SPECIFIC SYMPTOM 1]", "[SPECIFIC SYMPTOM 2]", "[SPECIFIC SYMPTOM 3]"],
        "action_steps": ["[SPECIFIC STEP 1 WITH TIMELINE - e.g., 'Week 1: Audit your current [topic] approach and identify gaps']", "[SPECIFIC STEP 2 WITH TIMELINE - e.g., 'Week 2: Learn advanced [topic] techniques']", "[SPECIFIC STEP 3 WITH TIMELINE - e.g., 'Week 3: Create signature [topic] strategies and refine your approach']"],
        "timeline": "[SPECIFIC TIMELINE - e.g., '3-5 days to see improvement']",
        "success_metrics": ["[SPECIFIC METRIC 1]", "[SPECIFIC METRIC 2]", "[SPECIFIC METRIC 3]"],
        "recommendations": ["[SPECIFIC RECOMMENDATION 1 - e.g., 'Invest in quality [topic] tools that reflect your business goals']", "[SPECIFIC RECOMMENDATION 2 - e.g., 'Learn to mix high and low effort [topic] strategies effectively']", "[SPECIFIC RECOMMENDATION 3 - e.g., 'Develop a signature [topic] approach that sets you apart']", "[SPECIFIC RECOMMENDATION 4 - e.g., 'Stay updated with current [topic] trends while maintaining your unique approach']"]
      }
    ]
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
    const parsed = JSON.parse(cleanedContent);

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
    const parsed = JSON.parse(cleanedContent);

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