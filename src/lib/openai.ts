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

Generate 3 Interactive Problem Diagnosis Quiz concepts. Each quiz should:
- Focus on diagnosing a specific problem in the user's niche
- Include 5-10 targeted questions that reveal the root cause
- Provide personalized feedback and next steps based on answers
- Be engaging and feel like a professional assessment

Return JSON in this exact format:
{
  "concepts": [
    {
      "title": "Quiz Title (Interactive Quiz)",
      "description": "Brief description of what the quiz diagnoses and what users will learn",
      "value_proposition": "What specific value or insight users will get from taking this quiz",
      "target_audience": "Specific audience segment this quiz targets"
    }
  ]
}`;

    case 'roi_calculator':
      return `${baseContext}

Generate 3 Instant ROI or Cost-Savings Calculator concepts. Each calculator should:
- Focus on quantifying potential gains or savings
- Include relevant metrics for the user's industry
- Show tangible financial impact of improvements
- Make benefits concrete and actionable

Return JSON in this exact format:
{
  "concepts": [
    {
      "title": "Calculator Title (ROI Calculator)",
      "description": "Brief description of what the calculator measures and what insights it provides",
      "value_proposition": "What specific financial insights users will gain",
      "target_audience": "Specific audience segment this calculator targets"
    }
  ]
}`;

    case 'action_plan':
      return `${baseContext}

Generate 3 Quick Wins Action Plan concepts. Each plan should:
- Focus on immediate, actionable steps
- Be tailored to the user's specific niche and goals
- Include 3-5 concrete steps they can start today
- Feel personalized and practical

Return JSON in this exact format:
{
  "concepts": [
    {
      "title": "Action Plan Title (Action Plan)",
      "description": "Brief description of what the plan covers and what users will achieve",
      "value_proposition": "What specific results users can expect from following this plan",
      "target_audience": "Specific audience segment this plan targets"
    }
  ]
}`;

    case 'benchmark_report':
      return `${baseContext}

Generate 3 Industry Benchmark Report concepts. Each report should:
- Compare user metrics to industry standards
- Identify specific areas for improvement
- Provide actionable insights based on gaps
- Create urgency to act on findings

Return JSON in this exact format:
{
  "concepts": [
    {
      "title": "Benchmark Report Title (Benchmark Report)",
      "description": "Brief description of what metrics are analyzed and what insights are provided",
      "value_proposition": "What specific competitive insights users will gain",
      "target_audience": "Specific audience segment this report targets"
    }
  ]
}`;

    case 'opportunity_finder':
      return `${baseContext}

Generate 3 Opportunity Finder Blueprint concepts. Each blueprint should:
- Identify missed opportunities in the user's business
- Provide specific, actionable recommendations
- Focus on low-effort, high-impact improvements
- Feel like a personalized audit

Return JSON in this exact format:
{
  "concepts": [
    {
      "title": "Opportunity Finder Title (Opportunity Finder)",
      "description": "Brief description of what opportunities are analyzed and what recommendations are provided",
      "value_proposition": "What specific opportunities users will discover and how to act on them",
      "target_audience": "Specific audience segment this blueprint targets"
    }
  ]
}`;

    case 'pdf':
      return `${baseContext}

Generate 3 Traditional PDF Guide concepts. Each guide should:
- Focus on comprehensive, educational content
- Include actionable insights and step-by-step instructions
- Provide templates, checklists, or frameworks
- Be valuable enough to download and reference later

Return JSON in this exact format:
{
  "concepts": [
    {
      "title": "PDF Guide Title (PDF)",
      "description": "Brief description of what the guide covers and what users will learn",
      "value_proposition": "What specific value and insights users will get from this guide",
      "target_audience": "Specific audience segment this guide targets"
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

Generate a content outline for an Interactive Problem Diagnosis Quiz.

The quiz should include:
1. Title: A compelling quiz title that promises specific insights
2. Introduction: A hook that explains what the quiz will diagnose and why it matters
3. Core Points: 5-10 key questions that will reveal the root cause of the problem
4. CTA: A call-to-action for taking the quiz and getting personalized results
5. Example: A sample question and what insights it would reveal
6. Template: The quiz structure and question format

Return JSON in this exact format:
{
  "title": "The [Quiz Name]: [Specific Benefit] (Interactive Quiz)",
  "introduction": "...",
  "core_points": ["..."],
  "cta": "...",
  "example": "A sample question and what insights it would reveal",
  "template": "The quiz structure and question format"
}`;

    case 'roi_calculator':
      return `${baseContext}

Generate a content outline for an Instant ROI or Cost-Savings Calculator.

The calculator should include:
1. Title: A compelling calculator title that promises specific financial insights
2. Introduction: A hook that explains what the calculator will measure and why it matters
3. Core Points: Key metrics and calculations the calculator will perform
4. CTA: A call-to-action for using the calculator and getting personalized results
5. Example: A sample calculation and what insights it would reveal
6. Template: The calculator structure and input fields

Return JSON in this exact format:
{
  "title": "The [Calculator Name]: [Specific Benefit] (ROI Calculator)",
  "introduction": "...",
  "core_points": ["..."],
  "cta": "...",
  "example": "A sample calculation and what insights it would reveal",
  "template": "The calculator structure and input fields"
}`;

    case 'action_plan':
      return `${baseContext}

Generate a content outline for a Quick Wins Action Plan.

The plan should include:
1. Title: A compelling plan title that promises specific results
2. Introduction: A hook that explains what the plan will deliver and why it matters
3. Core Points: 3-5 concrete steps they can start today
4. CTA: A call-to-action for getting the full plan and starting implementation
5. Example: A sample step and what results it would deliver
6. Template: The action plan structure and step format

Return JSON in this exact format:
{
  "title": "The [Plan Name]: [Specific Benefit] (Action Plan)",
  "introduction": "...",
  "core_points": ["..."],
  "cta": "...",
  "example": "A sample step and what results it would deliver",
  "template": "The action plan structure and step format"
}`;

    case 'benchmark_report':
      return `${baseContext}

Generate a content outline for an Industry Benchmark Report.

The report should include:
1. Title: A compelling report title that promises competitive insights
2. Introduction: A hook that explains what the report will analyze and why it matters
3. Core Points: Key metrics and benchmarks that will be compared
4. CTA: A call-to-action for getting the full report and personalized insights
5. Example: A sample benchmark comparison and what insights it would reveal
6. Template: The report structure and metric format

Return JSON in this exact format:
{
  "title": "The [Report Name]: [Specific Benefit] (Benchmark Report)",
  "introduction": "...",
  "core_points": ["..."],
  "cta": "...",
  "example": "A sample benchmark comparison and what insights it would reveal",
  "template": "The report structure and metric format"
}`;

    case 'opportunity_finder':
      return `${baseContext}

Generate a content outline for an Opportunity Finder Blueprint.

The blueprint should include:
1. Title: A compelling blueprint title that promises specific opportunities
2. Introduction: A hook that explains what opportunities will be identified and why it matters
3. Core Points: Key areas where opportunities will be analyzed
4. CTA: A call-to-action for getting the full blueprint and personalized recommendations
5. Example: A sample opportunity analysis and what recommendations it would provide
6. Template: The blueprint structure and analysis format

Return JSON in this exact format:
{
  "title": "The [Blueprint Name]: [Specific Benefit] (Opportunity Finder)",
  "introduction": "...",
  "core_points": ["..."],
  "cta": "...",
  "example": "A sample opportunity analysis and what recommendations it would provide",
  "template": "The blueprint structure and analysis format"
}`;

    case 'pdf':
      return `${baseContext}

Generate a content outline for a Traditional PDF Guide.

The guide should include:
1. Title: A compelling guide title that promises comprehensive insights
2. Introduction: A hook that explains what the guide will cover and why it matters
3. Core Points: Key sections and topics the guide will address
4. CTA: A call-to-action for downloading the full guide
5. Example: A sample section and what insights it would provide
6. Template: The guide structure and content format

Return JSON in this exact format:
{
  "title": "The [Guide Name]: [Specific Benefit] (PDF)",
  "introduction": "...",
  "core_points": ["..."],
  "cta": "...",
  "example": "A sample section and what insights it would provide",
  "template": "The guide structure and content format"
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
    
    // Only return PDF content if the format is PDF, otherwise return interactive content structure
    if (input.selected_format === 'pdf') {
      return pdfContent;
    } else {
      // For interactive formats, return a modified structure with format type in title
      return {
        ...pdfContent,
        title: `${pdfContent.title || 'Lead Magnet'} (${input.selected_format.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())})`,
        interactive_content: {
          format: input.selected_format,
          title: pdfContent.title || 'Lead Magnet',
          description: pdfContent.introduction,
          // Add format-specific interactive elements
          ...(input.selected_format === 'interactive_quiz' && {
            questions: [],
            results: []
          }),
          ...(input.selected_format === 'roi_calculator' && {
            inputs: [],
            calculations: []
          }),
          ...(input.selected_format === 'action_plan' && {
            steps: [],
            timeline: []
          }),
          ...(input.selected_format === 'benchmark_report' && {
            metrics: [],
            comparisons: []
          }),
          ...(input.selected_format === 'opportunity_finder' && {
            categories: [],
            opportunities: []
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
Before the toolkit, write a short, authentic introduction in the founder's voice. Use these details:
- Name: ${input.name}
- Position/Title: ${input.position || ''}
- Brand/company: ${input.brand_name}
- Customer problem: ${input.problem_statement}
- Desired outcome: ${input.desired_outcome}
If position/title is provided, use it in the intro (e.g., "I'm [Name], [Position] at [Brand]"). The intro should sound like the founder is speaking directly to the reader, sharing why they built this and what the reader will achieve. Make it authentic, concise, and motivating. Return this as a field called founder_intro in the JSON.
`;

  const corePrinciples = `
CORE PRINCIPLES (NON-NEGOTIABLE):
VISUAL DENSITY: Every content page must be "completely filled." You must generate enough detailed content (text, lists, or structured content) to fill a standard document page. Sparse pages with single paragraphs are forbidden.

STRUCTURED FORMATTING: You MUST use a variety of formats—paragraphs, bulleted lists, numbered lists, and structured content—to enhance readability and ensure pages are full.

EXTREME VALUE: Every section must be a tangible tool that provides the "how," not just the "what."

NO SELLING: The content must be 100% educational and brand-agnostic.

CRITICAL REDUNDANCY RULE: If you include a checklist section, DO NOT create a separate "step-by-step guide" section. The checklist is the superior implementation tool and should be the sole guide. Avoid redundancy at all costs.
`;

  switch (format) {
    case 'interactive_quiz':
      return `${baseContext}

${founderIntro}

${corePrinciples}

GENERATE AN INTERACTIVE QUIZ LEAD MAGNET:

Create a comprehensive quiz that provides real value to users. The content should be engaging, educational, and actionable.

1. Title Page:
- Title: A compelling quiz title that promises specific insights
- Subtitle: Explains what the quiz will diagnose

2. Introduction:
- Hook the reader with a sharp pain point
- Explain what insights they'll receive from taking the quiz

3. Quiz Content:
- 5-10 engaging questions that reveal insights
- Multiple choice answers that help categorize users
- Clear explanations of what each answer reveals
- Diagnosis categories with symptoms and solutions

4. Educational Content:
- Include valuable insights and tips throughout
- Add case studies and real examples
- Provide actionable advice based on quiz results

5. Interactive Elements:
- Questions that engage and educate
- Results that provide immediate value
- Clear next steps for users

Make the content natural, engaging, and genuinely helpful. Focus on providing real value rather than following rigid structures.

RETURN JSON IN THIS EXACT FORMAT:
\`\`\`json
{
  "founder_intro": "A personalized introduction from the founder explaining why they created this quiz and what value it provides.",
  "title_page": {
    "title": "The [Quiz Name] (Interactive Quiz)",
    "subtitle": "A [X]-Question Assessment to [Specific Benefit]."
  },
  "introduction_page": {
    "title": "Why This Quiz Will Reveal Your Hidden Problems",
    "content": "Introduction content explaining the value and benefits of taking this quiz."
  },
  "quiz_content": {
    "questions": [
      {
        "question": "Sample question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "explanation": "What this question reveals about the user"
      }
    ],
    "diagnosis_categories": [
      {
        "category_name": "Category Name",
        "description": "Description of this category",
        "symptoms": ["Symptom 1", "Symptom 2", "Symptom 3"],
        "solutions": ["Solution 1", "Solution 2", "Solution 3"]
      }
    ]
  },
  "educational_content": {
    "insights": ["Insight 1", "Insight 2", "Insight 3"],
    "tips": ["Tip 1", "Tip 2", "Tip 3"],
    "case_studies": ["Case study 1", "Case study 2"]
  },
  "interactive_elements": {
    "next_steps": ["Step 1", "Step 2", "Step 3"],
    "action_items": ["Action 1", "Action 2", "Action 3"]
  }
}
\`\`\`
            "pros": "Identifies specific areas for improvement",
            "cons": "Requires honest self-assessment",
            "case_study": "A SaaS company used skill gap quizzes to improve employee training, reducing support tickets by 30%"
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "checklist",
      "title": "Quiz Preparation Checklist",
      "content": {
        "phases": [
          {
            "phase_title": "Phase 1: Pre-Quiz Preparation",
            "items": [
              "1.1 Set up quiz platform and tracking",
              "1.2 Create compelling quiz title and description",
              "1.3 Design quiz flow and question sequence",
              "1.4 Test quiz functionality and user experience"
            ]
          },
          {
            "phase_title": "Phase 2: During Quiz",
            "items": [
              "2.1 Monitor quiz completion rates",
              "2.2 Track user engagement and drop-off points",
              "2.3 Collect email addresses for follow-up",
              "2.4 Provide immediate value and results"
            ]
          },
          {
            "phase_title": "Phase 3: Post-Quiz Analysis",
            "items": [
              "3.1 Analyze quiz results and patterns",
              "3.2 Segment leads based on quiz answers",
              "3.3 Create personalized follow-up sequences",
              "3.4 Optimize quiz based on performance data"
            ]
          }
        ],
        "case_study": "A real estate agent created a property preference quiz that generated 150 qualified leads in 30 days"
      }
    },
    {
      "layout": "filled",
      "type": "scripts",
      "title": "Quiz Discussion Scripts",
      "content": {
        "scenarios": [
          {
            "trigger": "When someone asks about your quiz",
            "response": "It's a quick assessment that helps identify your specific challenges and provides personalized solutions",
            "explanation": "This positions the quiz as valuable and time-efficient"
          },
          {
            "trigger": "When explaining quiz results",
            "response": "Based on your answers, you fall into the [Category] category. Here's what that means and your next steps",
            "explanation": "Shows you have a systematic approach to problem-solving"
          },
          {
            "trigger": "When following up after quiz completion",
            "response": "Thanks for taking our quiz! Here's your personalized action plan based on your results",
            "explanation": "Demonstrates immediate value delivery"
          }
        ]
      }
    }
  ],
  "cta_page": {
    "layout": "centered",
    "title": "Take Your Quiz Now",
    "content": "Ready to discover your hidden marketing problems? Take this quiz to get your personalized diagnosis and action plan."
  }
}
\`\`\``;

    case 'roi_calculator':
      return `${baseContext}

${founderIntro}

${corePrinciples}

GENERATE AN ROI CALCULATOR LEAD MAGNET:

Create a comprehensive calculator that provides real financial insights. The content should be practical, educational, and actionable.

1. Title Page:
- Title: A compelling calculator title that promises specific ROI insights
- Subtitle: Explains what the calculator will reveal

2. Introduction:
- Hook with the pain of not knowing your true ROI
- Explain what insights they'll get from the calculator

3. Calculator Content:
- Input fields for key business metrics
- Calculation logic and formulas
- Different result categories with insights
- Implementation guidance for improvements

4. Educational Content:
- Explain why each metric matters
- Include industry benchmarks and examples
- Provide actionable improvement strategies
- Add case studies of successful implementations

5. Interactive Elements:
- Input fields that capture real data
- Calculations that provide immediate insights
- Clear action plans based on results

Make the content practical, data-driven, and genuinely helpful. Focus on providing real financial value rather than following rigid structures.

RETURN JSON IN THIS EXACT FORMAT:
{
  "founder_intro": "...",
  "title_page": {
    "layout": "centered",
    "title": "The [Calculator Name] (ROI Calculator)",
    "subtitle": "Calculate Your Potential Revenue Gains and Cost Savings."
  },
  "introduction_page": {
    "layout": "filled",
    "title": "Why You Need This ROI Calculator",
    "content": "Introduction content here..."
  },
  "toolkit_sections": [
    {
      "layout": "filled",
      "type": "pros_and_cons_list",
      "title": "ROI Calculation Strategies",
      "content": {
        "items": [
          {
            "method_name": "Revenue Optimization Analysis",
            "pros": "Identifies immediate revenue opportunities",
            "cons": "May require upfront investment",
            "case_study": "An e-commerce store increased revenue by 35% by optimizing their pricing strategy"
          },
          {
            "method_name": "Cost Reduction Calculator",
            "pros": "Shows immediate savings potential",
            "cons": "May impact quality or service",
            "case_study": "A SaaS company reduced customer acquisition costs by 40% through automation"
          },
          {
            "method_name": "Efficiency Improvement Analysis",
            "pros": "Improves operational effectiveness",
            "cons": "Requires process changes",
            "case_study": "A consulting firm increased billable hours by 25% through process optimization"
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "checklist",
      "title": "ROI Preparation Checklist",
      "content": {
        "phases": [
          {
            "phase_title": "Phase 1: Data Collection",
            "items": [
              "1.1 Gather current financial metrics",
              "1.2 Collect customer acquisition data",
              "1.3 Analyze revenue streams",
              "1.4 Review operational costs"
            ]
          },
          {
            "phase_title": "Phase 2: Calculation Setup",
            "items": [
              "2.1 Set up ROI calculation models",
              "2.2 Define key performance indicators",
              "2.3 Create baseline measurements",
              "2.4 Establish tracking systems"
            ]
          },
          {
            "phase_title": "Phase 3: Analysis Review",
            "items": [
              "3.1 Compare current vs. potential performance",
              "3.2 Identify improvement opportunities",
              "3.3 Prioritize high-impact changes",
              "3.4 Create implementation timeline"
            ]
          }
        ],
        "case_study": "A marketing agency used ROI analysis to increase client retention by 50% and average project value by 30%"
      }
    },
    {
      "layout": "filled",
      "type": "scripts",
      "title": "ROI Discussion Scripts",
      "content": {
        "scenarios": [
          {
            "trigger": "When presenting ROI to stakeholders",
            "response": "Based on our analysis, we can increase revenue by 25-40% while reducing costs by 15-20%",
            "explanation": "Quantifies the value and shows strategic thinking"
          },
          {
            "trigger": "When explaining ROI calculations",
            "response": "We've analyzed your current metrics and identified specific opportunities for improvement",
            "explanation": "Shows data-driven approach"
          },
          {
            "trigger": "When discussing implementation",
            "response": "Here's our 90-day roadmap to achieve these ROI improvements",
            "explanation": "Demonstrates clear action plan"
          }
        ]
      }
    }
  ],
  "cta_page": {
    "layout": "centered",
    "title": "Calculate Your ROI Now",
    "content": "Ready to see your potential revenue gains? Use this calculator to discover hidden opportunities in your business."
  }
}`;

    case 'action_plan':
      return `${baseContext}

${founderIntro}

${corePrinciples}

GENERATE AN ACTION PLAN LEAD MAGNET:

Create a comprehensive action plan that provides real guidance. The content should be practical, step-by-step, and actionable.

1. Title Page:
- Title: A compelling action plan title that promises specific results
- Subtitle: Explains what the action plan will deliver

2. Introduction:
- Hook with the pain of not having a clear plan
- Explain what they'll get from this action plan

3. Action Plan Content:
- Personalization questions to customize the plan
- Weekly or monthly breakdown of tasks
- Clear milestones and success metrics
- Progress tracking and adjustment guidelines

4. Educational Content:
- Explain the reasoning behind each step
- Include tips and best practices
- Add case studies of successful implementations
- Provide troubleshooting for common obstacles

5. Interactive Elements:
- Questions that personalize the experience
- Step-by-step guidance that's easy to follow
- Progress tracking and milestone celebrations

Make the content practical, motivating, and genuinely helpful. Focus on providing real guidance rather than following rigid structures.

RETURN JSON IN THIS EXACT FORMAT:
{
  "founder_intro": "...",
  "title_page": {
    "layout": "centered",
    "title": "The [Action Plan Name] (Action Plan)",
    "subtitle": "Your Personalized [X]-Week Roadmap to [Specific Goal]."
  },
  "introduction_page": {
    "layout": "filled",
    "title": "Why You Need This Action Plan",
    "content": "Introduction content here..."
  },
  "toolkit_sections": [
    {
      "layout": "filled",
      "type": "pros_and_cons_list",
      "title": "Action Plan Strategies",
      "content": {
        "items": [
          {
            "method_name": "Goal-Oriented Action Planning",
            "pros": "Clear roadmap to achieve specific objectives",
            "cons": "May be too rigid for changing circumstances",
            "case_study": "A startup used goal-oriented planning to launch their MVP in 90 days"
          },
          {
            "method_name": "Agile Action Planning",
            "pros": "Flexible and adaptable to changes",
            "cons": "May lack clear long-term direction",
            "case_study": "A marketing agency increased client results by 40% using agile planning"
          },
          {
            "method_name": "Data-Driven Action Planning",
            "pros": "Based on measurable metrics and results",
            "cons": "Requires good data infrastructure",
            "case_study": "An e-commerce store increased conversions by 60% using data-driven planning"
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "checklist",
      "title": "Action Plan Execution Checklist",
      "content": {
        "phases": [
          {
            "phase_title": "Phase 1: Preparation",
            "items": [
              "1.1 Define clear goals and objectives",
              "1.2 Assess current resources and capabilities",
              "1.3 Identify potential obstacles and solutions",
              "1.4 Set up tracking and measurement systems"
            ]
          },
          {
            "phase_title": "Phase 2: Implementation",
            "items": [
              "2.1 Execute high-priority actions first",
              "2.2 Monitor progress and adjust as needed",
              "2.3 Track key performance indicators",
              "2.4 Communicate progress to stakeholders"
            ]
          },
          {
            "phase_title": "Phase 3: Optimization",
            "items": [
              "3.1 Analyze results and identify improvements",
              "3.2 Scale successful strategies",
              "3.3 Refine processes based on data",
              "3.4 Plan next iteration of actions"
            ]
          }
        ],
        "case_study": "A consultant used systematic action planning to help clients achieve 80% of their goals within 6 months"
      }
    },
    {
      "layout": "filled",
      "type": "scripts",
      "title": "Action Plan Discussion Scripts",
      "content": {
        "scenarios": [
          {
            "trigger": "When someone asks about your action plan",
            "response": "We've created a systematic approach with clear milestones and measurable outcomes",
            "explanation": "Shows you have a structured, professional approach"
          },
          {
            "trigger": "When explaining your progress",
            "response": "We're on track with our action plan. Here are our key achievements and next steps",
            "explanation": "Demonstrates accountability and forward thinking"
          },
          {
            "trigger": "When discussing results",
            "response": "Our action plan delivered [specific results]. Here's what we learned and how we'll improve",
            "explanation": "Shows results orientation and continuous improvement"
          }
        ]
      }
    }
  ],
  "cta_page": {
    "layout": "centered",
    "title": "Get Your Action Plan",
    "content": "Ready to take action? Get your personalized roadmap to achieve your goals."
  }
}`;

    case 'benchmark_report':
      return `${baseContext}

${founderIntro}

${corePrinciples}

GENERATE A BENCHMARK REPORT LEAD MAGNET:

Create a comprehensive benchmark report that provides real performance insights. The content should be data-driven, educational, and actionable.

1. Title Page:
- Title: A compelling benchmark report title
- Subtitle: Explains what the benchmark report will reveal

2. Introduction:
- Hook with the pain of not knowing how you compare
- Explain what insights they'll get from the benchmark

3. Benchmark Content:
- Input fields for key performance metrics
- Industry comparisons and benchmarks
- Gap analysis and opportunity identification
- Improvement strategies and implementation plans

4. Educational Content:
- Explain what each metric means and why it matters
- Include industry standards and best practices
- Provide actionable improvement strategies
- Add case studies of successful improvements

5. Interactive Elements:
- Input fields that capture real performance data
- Comparisons that provide immediate insights
- Clear action plans based on gaps

Make the content data-driven, insightful, and genuinely helpful. Focus on providing real performance value rather than following rigid structures.

RETURN JSON IN THIS EXACT FORMAT:
{
  "founder_intro": "...",
  "title_page": {
    "layout": "centered",
    "title": "The [Benchmark Report Name] (Benchmark Report)",
    "subtitle": "Compare Your Performance to Industry Standards."
  },
  "introduction_page": {
    "layout": "filled",
    "title": "Why You Need This Benchmark Report",
    "content": "Introduction content here..."
  },
  "toolkit_sections": [
    {
      "layout": "filled",
      "type": "pros_and_cons_list",
      "title": "Benchmarking Strategies",
      "content": {
        "items": [
          {
            "method_name": "Industry Benchmark Analysis",
            "pros": "Provides clear performance targets",
            "cons": "May not reflect your unique situation",
            "case_study": "A SaaS company improved conversion rates by 30% by benchmarking against industry leaders"
          },
          {
            "method_name": "Competitive Benchmark Analysis",
            "pros": "Identifies specific competitive advantages",
            "cons": "Requires access to competitor data",
            "case_study": "An e-commerce store increased market share by 25% through competitive benchmarking"
          },
          {
            "method_name": "Internal Benchmark Analysis",
            "pros": "Tracks your own progress over time",
            "cons": "May not provide external context",
            "case_study": "A consulting firm improved client satisfaction by 40% using internal benchmarks"
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "checklist",
      "title": "Benchmark Preparation Checklist",
      "content": {
        "phases": [
          {
            "phase_title": "Phase 1: Data Collection",
            "items": [
              "1.1 Gather current performance metrics",
              "1.2 Identify key performance indicators",
              "1.3 Collect industry benchmark data",
              "1.4 Analyze competitor performance"
            ]
          },
          {
            "phase_title": "Phase 2: Analysis Setup",
            "items": [
              "2.1 Set up benchmarking framework",
              "2.2 Define comparison criteria",
              "2.3 Create performance baselines",
              "2.4 Establish measurement systems"
            ]
          },
          {
            "phase_title": "Phase 3: Comparison Review",
            "items": [
              "3.1 Compare your metrics to benchmarks",
              "3.2 Identify performance gaps",
              "3.3 Analyze root causes of differences",
              "3.4 Prioritize improvement opportunities"
            ]
          }
        ],
        "case_study": "A marketing agency used benchmarking to improve client ROI by 45% within 6 months"
      }
    },
    {
      "layout": "filled",
      "type": "scripts",
      "title": "Benchmark Discussion Scripts",
      "content": {
        "scenarios": [
          {
            "trigger": "When presenting benchmarks to stakeholders",
            "response": "Our analysis shows we're performing at [X]% of industry standards. Here are our key opportunities",
            "explanation": "Quantifies performance and shows strategic thinking"
          },
          {
            "trigger": "When explaining performance gaps",
            "response": "We've identified specific areas where we can improve. Here's our action plan to close these gaps",
            "explanation": "Shows problem-solving approach"
          },
          {
            "trigger": "When discussing improvement strategies",
            "response": "Based on our benchmark analysis, we can improve performance by [X]% by implementing these strategies",
            "explanation": "Demonstrates data-driven decision making"
          }
        ]
      }
    }
  ],
  "cta_page": {
    "layout": "centered",
    "title": "Get Your Benchmark Report",
    "content": "Ready to see how you stack up? Get your personalized benchmark analysis."
  }
}`;

    case 'opportunity_finder':
      return `${baseContext}

${founderIntro}

${corePrinciples}

GENERATE AN OPPORTUNITY FINDER LEAD MAGNET:

Create a comprehensive opportunity finder that provides real business insights. The content should be strategic, educational, and actionable.

1. Title Page:
- Title: A compelling opportunity finder title
- Subtitle: Explains what opportunities the finder will reveal

2. Introduction:
- Hook with the pain of missing opportunities
- Explain what opportunities they'll discover

3. Opportunity Finder Content:
- Analysis questions to identify gaps and opportunities
- Different opportunity categories and priorities
- Implementation roadmaps and success metrics
- Risk assessment and mitigation strategies

4. Educational Content:
- Explain how to identify and evaluate opportunities
- Include industry trends and market insights
- Provide strategic frameworks for opportunity analysis
- Add case studies of successful opportunity capture

5. Interactive Elements:
- Questions that reveal hidden opportunities
- Analysis tools that provide strategic insights
- Clear implementation plans for each opportunity

Make the content strategic, insightful, and genuinely helpful. Focus on providing real business value rather than following rigid structures.

RETURN JSON IN THIS EXACT FORMAT:
{
  "founder_intro": "...",
  "title_page": {
    "layout": "centered",
    "title": "The [Opportunity Finder Name] (Opportunity Finder)",
    "subtitle": "Discover Hidden Growth Opportunities in Your Business."
  },
  "introduction_page": {
    "layout": "filled",
    "title": "Why You Need This Opportunity Finder",
    "content": "Introduction content here..."
  },
  "toolkit_sections": [
    {
      "layout": "filled",
      "type": "pros_and_cons_list",
      "title": "Opportunity Finding Strategies",
      "content": {
        "items": [
          {
            "method_name": "Competitive Analysis",
            "pros": "Identifies gaps in your market positioning",
            "cons": "Requires significant research time",
            "case_study": "A SaaS company discovered 3 untapped market segments through competitive analysis"
          },
          {
            "method_name": "Customer Feedback Analysis",
            "pros": "Direct insights from your target audience",
            "cons": "May be biased by vocal minority",
            "case_study": "An e-commerce store increased revenue by 40% after implementing customer feedback"
          },
          {
            "method_name": "Data-Driven Gap Analysis",
            "pros": "Objective, measurable approach",
            "cons": "Requires good data infrastructure",
            "case_study": "A consulting firm found 5 new service opportunities through data analysis"
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "checklist",
      "title": "Opportunity Analysis Checklist",
      "content": {
        "phases": [
          {
            "phase_title": "Phase 1: Business Analysis",
            "items": [
              "1.1 Review current revenue streams",
              "1.2 Analyze customer acquisition channels",
              "1.3 Assess technology stack usage",
              "1.4 Evaluate marketing performance"
            ]
          },
          {
            "phase_title": "Phase 2: Opportunity Identification",
            "items": [
              "2.1 Compare with industry benchmarks",
              "2.2 Identify service gaps",
              "2.3 Analyze competitor offerings",
              "2.4 Review customer feedback"
            ]
          },
          {
            "phase_title": "Phase 3: Implementation Planning",
            "items": [
              "3.1 Prioritize opportunities by impact",
              "3.2 Estimate resource requirements",
              "3.3 Create implementation timeline",
              "3.4 Define success metrics"
            ]
          }
        ],
        "case_study": "A B2B company identified 7 new service opportunities and implemented 3 within 6 months, increasing revenue by 35%"
      }
    },
    {
      "layout": "filled",
      "type": "scripts",
      "title": "Opportunity Discussion Scripts",
      "content": {
        "scenarios": [
          {
            "trigger": "When someone asks about your business opportunities",
            "response": "We've identified several untapped opportunities in our market. Would you like to see our analysis?",
            "explanation": "This positions you as proactive and data-driven"
          },
          {
            "trigger": "When presenting opportunities to stakeholders",
            "response": "Based on our analysis, we've found 3 high-impact opportunities that could increase revenue by 25-40%",
            "explanation": "Quantifies the value and shows strategic thinking"
          },
          {
            "trigger": "When explaining opportunity implementation",
            "response": "We've prioritized these opportunities by impact and resource requirements. Here's our 90-day implementation plan",
            "explanation": "Shows you have a clear action plan"
          }
        ]
      }
    }
  ],
  "cta_page": {
    "layout": "centered",
    "title": "Find Your Opportunities",
    "content": "Ready to discover hidden growth opportunities? Use this finder to identify your next big wins."
  }
}`;

    case 'pdf':
      return `${baseContext}

${founderIntro}

${corePrinciples}

GENERATE A TRADITIONAL PDF GUIDE WITH THE FOLLOWING STRUCTURE:

1. Title Page:
- Title: A compelling guide title that promises comprehensive insights
- Subtitle: Explains what the guide will cover

2. Introduction:
- Hook that explains what the guide will cover and why it matters
- Overview of what readers will learn

3. Content Sections (3-5 sections):
Each section should include:
- Clear section title
- Educational content with actionable insights
- Step-by-step instructions
- Examples and case studies
- Templates or checklists

4. Implementation Guide:
- How to apply the concepts
- Common mistakes to avoid
- Success metrics to track

5. Call to Action:
- Clear next steps
- Additional resources
- Contact information

RETURN JSON IN THIS EXACT FORMAT:
\`\`\`json
{
  "founder_intro": "...",
  "title_page": {
    "layout": "centered",
    "title": "The [Guide Name] (PDF)",
    "subtitle": "A Comprehensive Guide to [Specific Topic]."
  },
  "introduction_page": {
    "layout": "filled",
    "title": "Introduction",
    "content": "Introduction content here..."
  },
  "toolkit_sections": [
    {
      "layout": "filled",
      "type": "educational_content",
      "title": "Section 1: [Topic]",
      "content": "Comprehensive educational content with actionable insights..."
    }
  ],
  "cta_page": {
    "layout": "centered",
    "title": "Next Steps",
    "content": "Ready to implement these strategies? Download your complete guide now."
  }
}
\`\`\``;

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