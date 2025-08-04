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
    const parsed = JSON.parse(content);

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

export async function generatePdfContent(input: {
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

Return JSON in this exact format:
{
  "founder_intro": {
    "name": "${input.name}",
    "title": "${input.position}",
    "company": "${input.brand_name}",
    "intro_text": "Personal introduction and credibility statement"
  },
  "introduction": "Engaging introduction that hooks the reader",
  "sections": [
    {
      "title": "Section Title",
      "content": "Section content with actionable insights",
      "subsections": [
        {
          "title": "Subsection Title",
          "content": "Detailed content with examples and tips"
        }
      ]
    }
  ],
  "cta": {
    "title": "Call to Action Title",
    "description": "Compelling CTA description",
    "button_text": "Action Button Text"
  },
  "structured_content": {
    "toolkit_sections": [
      {
        "title": "Toolkit Section Title",
        "description": "What this section provides",
        "items": [
          {
            "title": "Item Title",
            "description": "Item description",
            "type": "template|checklist|worksheet|resource"
          }
        ]
      }
    ]
  },
  "founderName": "${input.name}",
  "brandName": "${input.brand_name}",
  "problemStatement": "${input.problem_statement}",
  "desiredOutcome": "${input.desired_outcome}",
  "customization": {
    "tone": "${input.tone}",
    "target_audience": "${input.target_audience}",
    "niche": "${input.niche}"
  }
}`;

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

    // Parse the JSON response
    const pdfContent = JSON.parse(content) as PDFContent;
    
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

THE BLUEPRINT: GENERATE THE FOLLOWING COMPONENTS WITH LAYOUT INSTRUCTIONS

1. Title Page (layout: "centered"):
Title: A compelling quiz title that promises specific insights (8-12 words).
Subtitle: A powerful subtitle that explains what the quiz will diagnose (10-15 words).

2. Introduction Page (layout: "filled"):
Title: A clear, engaging title for the introduction (e.g., "Why This Quiz Will Reveal Your Hidden Problems").
Content: A concise but powerful introduction (80-120 words) that hooks the reader with a sharp pain point and clearly states what insights they will receive from taking the quiz.

3. The Quiz Sections (layout: "filled"):
Generate EXACTLY 3 distinct quiz sections. Each section must be comprehensive enough to be a filled page on its own.

SECTION TYPES TO USE:
- For type: "quiz_questions": Generate 5-10 targeted questions that reveal the root cause of the problem. Each question should have a "question" field, "options" array (3-4 options), and "insight" field explaining what this question reveals. Format exactly like this example:

EXAMPLE QUIZ QUESTIONS FORMAT:
{
  "question": "How do you currently measure your marketing success?",
  "options": [
    "I don't track anything systematically",
    "I check basic metrics like website visits",
    "I track conversions and ROI",
    "I have a comprehensive analytics dashboard"
  ],
  "insight": "This reveals whether you're flying blind or have proper measurement systems in place."
}

- For type: "diagnosis_categories": Create 3-4 diagnosis categories that users will fall into based on their answers. Each category should have a "category_name", "description" of what this means, "symptoms" list, and "solutions" list. Include a "case_study" field with a brief real-world example (2-3 sentences).

- For type: "action_plan": Provide a personalized action plan based on quiz results. Include "immediate_actions" (next 7 days), "short_term" (next 30 days), and "long_term" (next 90 days) with specific, actionable steps.

4. Call to Action Page (layout: "centered"):
Title: A clear, action-oriented title (e.g., "Take Your Quiz Now").
Content: Write a custom, relevant call-to-action for this quiz. The CTA should reference the brand name and encourage users to take the quiz to get their personalized diagnosis.

RETURN JSON IN THIS EXACT, STRUCTURED FORMAT:
{
  "founder_intro": "...",
  "title_page": {
    "layout": "centered",
    "title": "The [Quiz Name] (Interactive Quiz)",
    "subtitle": "A [X]-Question Assessment to [Specific Benefit]."
  },
  "introduction_page": {
    "layout": "filled",
    "title": "Why This Quiz Will Reveal Your Hidden Problems",
    "content": "Introduction content here..."
  },
  "toolkit_sections": [
    {
      "layout": "filled",
      "type": "quiz_questions",
      "title": "Section 1: Problem Diagnosis Questions",
      "content": {
        "questions": [
          {
            "question": "How do you currently measure your marketing success?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "insight": "What this question reveals about the user's situation."
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "diagnosis_categories",
      "title": "Section 2: Your Diagnosis Categories",
      "content": {
        "categories": [
          {
            "category_name": "The Beginner",
            "description": "What this category means",
            "symptoms": ["Symptom 1", "Symptom 2"],
            "solutions": ["Solution 1", "Solution 2"],
            "case_study": "Real-world example of someone in this category."
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "action_plan",
      "title": "Section 3: Your Personalized Action Plan",
      "content": {
        "immediate_actions": ["Action 1", "Action 2"],
        "short_term": ["Action 1", "Action 2"],
        "long_term": ["Action 1", "Action 2"],
        "case_study": "Real-world example of someone following this plan."
      }
    }
  ],
  "cta_page": {
    "layout": "centered",
    "title": "Take Your Quiz Now",
    "content": "A bold, urgent, benefit-driven call-to-action tailored to the brand and quiz topic."
  }
}`;

    case 'roi_calculator':
      return `${baseContext}

${founderIntro}

${corePrinciples}

THE BLUEPRINT: GENERATE THE FOLLOWING COMPONENTS WITH LAYOUT INSTRUCTIONS

1. Title Page (layout: "centered"):
Title: A compelling calculator title that promises specific financial insights (8-12 words).
Subtitle: A powerful subtitle that explains what the calculator will measure (10-15 words).

2. Introduction Page (layout: "filled"):
Title: A clear, engaging title for the introduction (e.g., "Why This Calculator Will Transform Your Business").
Content: A concise but powerful introduction (80-120 words) that hooks the reader with a sharp pain point and clearly states what financial insights they will receive.

3. The Calculator Sections (layout: "filled"):
Generate EXACTLY 3 distinct calculator sections. Each section must be comprehensive enough to be a filled page on its own.

SECTION TYPES TO USE:
- For type: "input_metrics": Generate 5-8 key metrics that users will input. Each metric should have a "metric_name", "description" of what it measures, "input_type" (number, percentage, currency), and "calculation_impact" explaining how this affects results.

- For type: "calculation_formulas": Provide the mathematical formulas and logic for calculating ROI, savings, or gains. Include "formula_name", "formula_description", "variables", and "example_calculation" with real numbers.

- For type: "results_interpretation": Create different result categories and what they mean. Include "result_category", "description", "recommendations", and "next_steps" for each category.

4. Call to Action Page (layout: "centered"):
Title: A clear, action-oriented title (e.g., "Calculate Your ROI Now").
Content: Write a custom, relevant call-to-action for this calculator.

RETURN JSON IN THIS EXACT, STRUCTURED FORMAT:
{
  "founder_intro": "...",
  "title_page": {
    "layout": "centered",
    "title": "The [Calculator Name] (ROI Calculator)",
    "subtitle": "A [X]-Metric Tool to [Specific Benefit]."
  },
  "introduction_page": {
    "layout": "filled",
    "title": "Why This Calculator Will Transform Your Business",
    "content": "Introduction content here..."
  },
  "toolkit_sections": [
    {
      "layout": "filled",
      "type": "input_metrics",
      "title": "Section 1: Your Key Metrics",
      "content": {
        "metrics": [
          {
            "metric_name": "Current Monthly Revenue",
            "description": "What this metric measures",
            "input_type": "currency",
            "calculation_impact": "How this affects the final calculation."
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "calculation_formulas",
      "title": "Section 2: The ROI Formulas",
      "content": {
        "formulas": [
          {
            "formula_name": "Revenue Growth Potential",
            "formula_description": "How this formula works",
            "variables": ["Variable 1", "Variable 2"],
            "example_calculation": "Example with real numbers."
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "results_interpretation",
      "title": "Section 3: Understanding Your Results",
      "content": {
        "result_categories": [
          {
            "result_category": "High Growth Potential",
            "description": "What this means",
            "recommendations": ["Rec 1", "Rec 2"],
            "next_steps": ["Step 1", "Step 2"]
          }
        ]
      }
    }
  ],
  "cta_page": {
    "layout": "centered",
    "title": "Calculate Your ROI Now",
    "content": "A bold, urgent, benefit-driven call-to-action tailored to the brand and calculator topic."
  }
}`;

    case 'action_plan':
      return `${baseContext}

${founderIntro}

${corePrinciples}

THE BLUEPRINT: GENERATE THE FOLLOWING COMPONENTS WITH LAYOUT INSTRUCTIONS

1. Title Page (layout: "centered"):
Title: A compelling action plan title that promises specific results (8-12 words).
Subtitle: A powerful subtitle that explains what the plan will deliver (10-15 words).

2. Introduction Page (layout: "filled"):
Title: A clear, engaging title for the introduction (e.g., "Why This Action Plan Will Transform Your Results").
Content: A concise but powerful introduction (80-120 words) that hooks the reader with a sharp pain point and clearly states what results they will achieve.

3. The Action Plan Sections (layout: "filled"):
Generate EXACTLY 3 distinct action plan sections. Each section must be comprehensive enough to be a filled page on its own.

SECTION TYPES TO USE:
- For type: "phase_planning": Break down the action plan into 3-4 phases. Each phase should have a "phase_name", "duration", "objectives", and "key_actions" list. Include a "case_study" field with a brief real-world example.

- For type: "implementation_tools": Provide specific tools, templates, and resources needed to implement the plan. Include "tool_name", "description", "how_to_use", and "expected_outcome" for each tool.

- For type: "progress_tracking": Create a system for tracking progress and measuring success. Include "milestone_name", "success_metrics", "timeline", and "adjustment_strategies" for each milestone.

4. Call to Action Page (layout: "centered"):
Title: A clear, action-oriented title (e.g., "Start Your Action Plan Now").
Content: Write a custom, relevant call-to-action for this action plan.

RETURN JSON IN THIS EXACT, STRUCTURED FORMAT:
{
  "founder_intro": "...",
  "title_page": {
    "layout": "centered",
    "title": "The [Action Plan Name] (Action Plan)",
    "subtitle": "A [X]-Step Plan to [Specific Benefit]."
  },
  "introduction_page": {
    "layout": "filled",
    "title": "Why This Action Plan Will Transform Your Results",
    "content": "Introduction content here..."
  },
  "toolkit_sections": [
    {
      "layout": "filled",
      "type": "phase_planning",
      "title": "Section 1: Your Implementation Phases",
      "content": {
        "phases": [
          {
            "phase_name": "Foundation Phase",
            "duration": "Week 1-2",
            "objectives": ["Objective 1", "Objective 2"],
            "key_actions": ["Action 1", "Action 2"],
            "case_study": "Real-world example of this phase."
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "implementation_tools",
      "title": "Section 2: Your Implementation Tools",
      "content": {
        "tools": [
          {
            "tool_name": "Progress Tracker Template",
            "description": "What this tool does",
            "how_to_use": "How to implement this tool",
            "expected_outcome": "What results to expect."
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "progress_tracking",
      "title": "Section 3: Your Success Metrics",
      "content": {
        "milestones": [
          {
            "milestone_name": "First Results",
            "success_metrics": ["Metric 1", "Metric 2"],
            "timeline": "When to expect this",
            "adjustment_strategies": ["Strategy 1", "Strategy 2"]
          }
        ]
      }
    }
  ],
  "cta_page": {
    "layout": "centered",
    "title": "Start Your Action Plan Now",
    "content": "A bold, urgent, benefit-driven call-to-action tailored to the brand and action plan topic."
  }
}`;

    case 'benchmark_report':
      return `${baseContext}

${founderIntro}

${corePrinciples}

THE BLUEPRINT: GENERATE THE FOLLOWING COMPONENTS WITH LAYOUT INSTRUCTIONS

1. Title Page (layout: "centered"):
Title: A compelling benchmark report title that promises competitive insights (8-12 words).
Subtitle: A powerful subtitle that explains what the report will analyze (10-15 words).

2. Introduction Page (layout: "filled"):
Title: A clear, engaging title for the introduction (e.g., "Why This Benchmark Report Will Reveal Your Competitive Position").
Content: A concise but powerful introduction (80-120 words) that hooks the reader with a sharp pain point and clearly states what competitive insights they will receive.

3. The Benchmark Report Sections (layout: "filled"):
Generate EXACTLY 3 distinct benchmark report sections. Each section must be comprehensive enough to be a filled page on its own.

SECTION TYPES TO USE:
- For type: "benchmark_metrics": Generate 5-8 key metrics that will be compared to industry standards. Each metric should have a "metric_name", "industry_average", "top_performer_level", and "improvement_potential" explaining the gap and opportunity.

- For type: "competitive_analysis": Provide insights into how competitors are performing and what strategies they're using. Include "competitor_category", "performance_insights", "strategies_used", and "opportunity_gaps" for each category.

- For type: "improvement_roadmap": Create a specific roadmap for closing performance gaps. Include "priority_area", "current_performance", "target_performance", "action_steps", and "timeline" for each area.

4. Call to Action Page (layout: "centered"):
Title: A clear, action-oriented title (e.g., "Get Your Benchmark Report Now").
Content: Write a custom, relevant call-to-action for this benchmark report.

RETURN JSON IN THIS EXACT, STRUCTURED FORMAT:
{
  "founder_intro": "...",
  "title_page": {
    "layout": "centered",
    "title": "The [Benchmark Report Name] (Benchmark Report)",
    "subtitle": "A [X]-Metric Analysis of [Specific Benefit]."
  },
  "introduction_page": {
    "layout": "filled",
    "title": "Why This Benchmark Report Will Reveal Your Competitive Position",
    "content": "Introduction content here..."
  },
  "toolkit_sections": [
    {
      "layout": "filled",
      "type": "benchmark_metrics",
      "title": "Section 1: Your Performance Metrics",
      "content": {
        "metrics": [
          {
            "metric_name": "Email Open Rate",
            "industry_average": "22%",
            "top_performer_level": "35%",
            "improvement_potential": "How to close this gap."
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "competitive_analysis",
      "title": "Section 2: Competitive Landscape",
      "content": {
        "competitor_categories": [
          {
            "competitor_category": "Industry Leaders",
            "performance_insights": "What top performers are doing",
            "strategies_used": ["Strategy 1", "Strategy 2"],
            "opportunity_gaps": ["Gap 1", "Gap 2"]
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "improvement_roadmap",
      "title": "Section 3: Your Improvement Roadmap",
      "content": {
        "priority_areas": [
          {
            "priority_area": "Email Marketing",
            "current_performance": "Current level",
            "target_performance": "Target level",
            "action_steps": ["Step 1", "Step 2"],
            "timeline": "When to achieve this"
          }
        ]
      }
    }
  ],
  "cta_page": {
    "layout": "centered",
    "title": "Get Your Benchmark Report Now",
    "content": "A bold, urgent, benefit-driven call-to-action tailored to the brand and benchmark report topic."
  }
}`;

    case 'opportunity_finder':
      return `${baseContext}

${founderIntro}

${corePrinciples}

THE BLUEPRINT: GENERATE THE FOLLOWING COMPONENTS WITH LAYOUT INSTRUCTIONS

1. Title Page (layout: "centered"):
Title: A compelling opportunity finder title that promises specific opportunities (8-12 words).
Subtitle: A powerful subtitle that explains what opportunities will be identified (10-15 words).

2. Introduction Page (layout: "filled"):
Title: A clear, engaging title for the introduction (e.g., "Why This Opportunity Finder Will Unlock Hidden Growth").
Content: A concise but powerful introduction (80-120 words) that hooks the reader with a sharp pain point and clearly states what opportunities they will discover.

3. The Opportunity Finder Sections (layout: "filled"):
Generate EXACTLY 3 distinct opportunity finder sections. Each section must be comprehensive enough to be a filled page on its own.

SECTION TYPES TO USE:
- For type: "opportunity_categories": Generate 4-6 key opportunity categories to analyze. Each category should have a "category_name", "analysis_focus", "opportunity_signs", and "potential_impact" explaining what to look for and the upside.

- For type: "audit_framework": Provide a systematic framework for conducting the opportunity audit. Include "audit_step", "what_to_look_for", "red_flags", and "green_signals" for each step.

- For type: "implementation_priorities": Create a prioritized list of opportunities to pursue. Include "opportunity_name", "effort_level", "expected_impact", "implementation_steps", and "success_metrics" for each opportunity.

4. Call to Action Page (layout: "centered"):
Title: A clear, action-oriented title (e.g., "Find Your Opportunities Now").
Content: Write a custom, relevant call-to-action for this opportunity finder.

RETURN JSON IN THIS EXACT, STRUCTURED FORMAT:
{
  "founder_intro": "...",
  "title_page": {
    "layout": "centered",
    "title": "The [Opportunity Finder Name] (Opportunity Finder)",
    "subtitle": "A [X]-Category Audit to [Specific Benefit]."
  },
  "introduction_page": {
    "layout": "filled",
    "title": "Why This Opportunity Finder Will Unlock Hidden Growth",
    "content": "Introduction content here..."
  },
  "toolkit_sections": [
    {
      "layout": "filled",
      "type": "opportunity_categories",
      "title": "Section 1: Opportunity Categories to Analyze",
      "content": {
        "categories": [
          {
            "category_name": "Marketing Channels",
            "analysis_focus": "What to analyze in this category",
            "opportunity_signs": ["Sign 1", "Sign 2"],
            "potential_impact": "What upside this could deliver."
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "audit_framework",
      "title": "Section 2: Your Audit Framework",
      "content": {
        "audit_steps": [
          {
            "audit_step": "Step 1: Channel Analysis",
            "what_to_look_for": "What to examine",
            "red_flags": ["Flag 1", "Flag 2"],
            "green_signals": ["Signal 1", "Signal 2"]
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "implementation_priorities",
      "title": "Section 3: Your Implementation Priorities",
      "content": {
        "opportunities": [
          {
            "opportunity_name": "Instagram Reels Strategy",
            "effort_level": "Low effort, high impact",
            "expected_impact": "40% increase in engagement",
            "implementation_steps": ["Step 1", "Step 2"],
            "success_metrics": ["Metric 1", "Metric 2"]
          }
        ]
      }
    }
  ],
  "cta_page": {
    "layout": "centered",
    "title": "Find Your Opportunities Now",
    "content": "A bold, urgent, benefit-driven call-to-action tailored to the brand and opportunity finder topic."
  }
}`;

    case 'pdf':
      return `${baseContext}

${founderIntro}

${corePrinciples}

THE BLUEPRINT: GENERATE THE FOLLOWING COMPONENTS WITH LAYOUT INSTRUCTIONS

1. Title Page (layout: "centered"):
Title: A compelling guide title that promises comprehensive insights (8-12 words).
Subtitle: A powerful subtitle that explains what the guide will cover (10-15 words).

2. Introduction Page (layout: "filled"):
Title: A clear, engaging title for the introduction (e.g., "Why This Guide Will Transform Your Business").
Content: A concise but powerful introduction (80-120 words) that hooks the reader with a sharp pain point and clearly states what comprehensive insights they will receive.

3. The Guide Sections (layout: "filled"):
Generate EXACTLY 3 distinct guide sections. Each section must be comprehensive enough to be a filled page on its own.

SECTION TYPES TO USE:
- For type: "guide_section": Generate a comprehensive section on a specific topic. Include "section_title", "content" (structured or plain text), and "subsections" (if applicable).

- For type: "call_to_action": Create a call-to-action page for downloading the full guide.

4. Call to Action Page (layout: "centered"):
Title: A clear, action-oriented title (e.g., "Download Your Guide Now").
Content: Write a custom, relevant call-to-action for this guide.

RETURN JSON IN THIS EXACT, STRUCTURED FORMAT:
{
  "founder_intro": "...",
  "title_page": {
    "layout": "centered",
    "title": "The [Guide Name] (PDF)",
    "subtitle": "A [X]-Insight Guide to [Specific Benefit]."
  },
  "introduction_page": {
    "layout": "filled",
    "title": "Why This Guide Will Transform Your Business",
    "content": "Introduction content here..."
  },
  "toolkit_sections": [
    {
      "layout": "filled",
      "type": "guide_section",
      "title": "Section 1: Your Core Insights",
      "content": {
        "section_title": "Your Core Insights",
        "content": "Detailed content about the topic here...",
        "subsections": [
          {
            "title": "Subsection 1",
            "content": "Content for subsection 1"
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "guide_section",
      "title": "Section 2: Your Actionable Steps",
      "content": {
        "section_title": "Your Actionable Steps",
        "content": "Content for actionable steps here...",
        "subsections": [
          {
            "title": "Subsection 1",
            "content": "Content for subsection 1"
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "guide_section",
      "title": "Section 3: Your Next Steps",
      "content": {
        "section_title": "Your Next Steps",
        "content": "Content for next steps here...",
        "subsections": [
          {
            "title": "Subsection 1",
            "content": "Content for subsection 1"
          }
        ]
      }
    }
  ],
  "cta_page": {
    "layout": "centered",
    "title": "Download Your Guide Now",
    "content": "A bold, urgent, benefit-driven call-to-action tailored to the brand and guide topic."
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

    const content = res.choices[0].message.content;
    const parsed = JSON.parse(content);

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
    } else if (err.message.includes('JSON')) {
      throw new Error('Failed to process the landing page content. Please try again.');
    }

    throw new Error(`Failed to generate landing page copy: ${err.message}`);
  }
}

export async function generateSocialPosts(input: CampaignInput, outline: ContentOutline): Promise<SocialPosts> {
  const client = getOpenAIClient();

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

    const content = res.choices[0].message.content;
    const parsed = JSON.parse(content);

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
    } else if (err.message.includes('JSON')) {
      throw new Error('Failed to process the social media content. Please try again.');
    }

    throw new Error(`Failed to generate social media posts: ${err.message}`);
  }
}

export async function generateFinalCampaign(input: CampaignInput, outline: ContentOutline, customization?: PDFCustomization): Promise<CampaignOutput> {
  const client = getOpenAIClient();

  try {
    // Generate content sequentially instead of in parallel for better error handling
    console.log('Starting PDF content generation...');
    
    // Create the input object for the new generatePdfContent signature
    const pdfInput = {
      selected_format: input.selected_format || 'pdf',
      name: input.name || '',
      brand_name: input.brand_name,
      target_audience: input.target_audience,
      niche: input.niche,
      problem_statement: input.problem_statement,
      desired_outcome: input.desired_outcome,
      tone: input.tone || 'professional',
      position: input.position || '',
      concept: { id: '1', title: 'Generated Concept', description: '', value_proposition: '', target_audience: '', format: input.selected_format || 'pdf' },
      outline: outline
    };
    
    const pdf_content = await generatePdfContent(pdfInput).catch(err => {
      console.error('PDF Generation Error:', err);
      throw new Error(`PDF Generation Failed: ${err.message}`);
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
    if (!pdf_content) throw new Error('PDF content generation failed');
    if (!landing_page) throw new Error('Landing page generation failed');
    if (!social_posts) throw new Error('Social posts generation failed');

    // Use the structured content that was already generated by generatePdfContent
    const structured_pdf_content: PDFContent = {
      ...pdf_content,
      // Keep the original structured_content that was generated by generatePdfContent
      structured_content: pdf_content.structured_content
    };

    console.log('Campaign generation completed successfully');
    return {
      pdf_content: structured_pdf_content,
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