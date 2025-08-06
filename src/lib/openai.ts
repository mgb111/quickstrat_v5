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
  
  // Fix newline characters in JSON strings
  // Replace literal newlines with escaped newlines
  cleaned = cleaned.replace(/\n/g, '\\n');
  
  // Fix other problematic control characters
  cleaned = cleaned.replace(/\r/g, '\\r');
  cleaned = cleaned.replace(/\t/g, '\\t');
  
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
- "The Conversion Killer Audit" - 7 questions that reveal exactly why your landing page isn't converting
- "The Lead Generation Leak Detector" - 10 questions that pinpoint where you're losing prospects in your funnel
- "The Pricing Strategy Analyzer" - 8 questions that reveal if you're under-pricing and by how much

Return JSON in this exact format:
{
  "concepts": [
    {
      "title": "[Problem] Diagnosis Quiz - Find Out Why [Specific Issue] Isn't Working",
      "description": "A [X]-question diagnostic that reveals the ROOT CAUSE of [specific problem] and provides a custom action plan to fix it within [timeframe]",
      "value_proposition": "Get a professional-grade analysis of [specific issue] and discover the exact steps to [specific outcome] - normally costs $[amount] in consulting",
      "target_audience": "[Specific segment] struggling with [specific problem] who need immediate answers"
    },
    {
      "title": "[Problem] Diagnosis Quiz - Find Out Why [Specific Issue] Isn't Working",
      "description": "A [X]-question diagnostic that reveals the ROOT CAUSE of [specific problem] and provides a custom action plan to fix it within [timeframe]",
      "value_proposition": "Get a professional-grade analysis of [specific issue] and discover the exact steps to [specific outcome] - normally costs $[amount] in consulting",
      "target_audience": "[Specific segment] struggling with [specific problem] who need immediate answers"
    },
    {
      "title": "[Problem] Diagnosis Quiz - Find Out Why [Specific Issue] Isn't Working",
      "description": "A [X]-question diagnostic that reveals the ROOT CAUSE of [specific problem] and provides a custom action plan to fix it within [timeframe]",
      "value_proposition": "Get a professional-grade analysis of [specific issue] and discover the exact steps to [specific outcome] - normally costs $[amount] in consulting",
      "target_audience": "[Specific segment] struggling with [specific problem] who need immediate answers"
    }
  ]
}`;

    case 'roi_calculator':
      return `${baseContext}

Generate 3 ROI Calculator concepts that show EXACT dollar amounts and create urgency.

Each calculator MUST:
- Calculate SPECIFIC financial impact (not vague percentages)
- Show opportunity cost of NOT taking action
- Include industry benchmarks for comparison
- Generate a sense of urgency with real numbers

❌ AVOID: Generic "calculate your savings" tools
✅ FOCUS ON: Specific, shocking financial revelations with benchmarked data

EXAMPLES OF HIGH-VALUE CALCULATOR CONCEPTS:
- "The Email List Money Calculator" - Shows exact revenue you're missing by not having X subscribers
- "The Automation ROI Calculator" - Calculates exact hours/dollars wasted on manual tasks vs automation investment
- "The Employee Turnover Cost Calculator" - Shows shocking true cost of losing employees (with industry averages)

Return JSON in this exact format:
{
  "concepts": [
    {
      "title": "The [Specific Cost/Revenue] Calculator - See What [Problem] Is Really Costing You",
      "description": "Input [X] simple numbers and discover the EXACT dollar amount [problem] is costing you per [timeframe], plus see how you compare to [industry] benchmarks",
      "value_proposition": "Reveals the shocking true cost of [specific problem] - most [target audience] discover they're losing $[amount] per [timeframe] without realizing it",
      "target_audience": "[Specific audience] who don't realize the true financial impact of [specific problem]"
    },
    {
      "title": "The [Specific Cost/Revenue] Calculator - See What [Problem] Is Really Costing You",
      "description": "Input [X] simple numbers and discover the EXACT dollar amount [problem] is costing you per [timeframe], plus see how you compare to [industry] benchmarks",
      "value_proposition": "Reveals the shocking true cost of [specific problem] - most [target audience] discover they're losing $[amount] per [timeframe] without realizing it",
      "target_audience": "[Specific audience] who don't realize the true financial impact of [specific problem]"
    },
    {
      "title": "The [Specific Cost/Revenue] Calculator - See What [Problem] Is Really Costing You",
      "description": "Input [X] simple numbers and discover the EXACT dollar amount [problem] is costing you per [timeframe], plus see how you compare to [industry] benchmarks",
      "value_proposition": "Reveals the shocking true cost of [specific problem] - most [target audience] discover they're losing $[amount] per [timeframe] without realizing it",
      "target_audience": "[Specific audience] who don't realize the true financial impact of [specific problem]"
    }
  ]
}`;

    case 'action_plan':
      return `${baseContext}

Generate 3 Action Plan concepts that provide STEP-BY-STEP implementation roadmaps.

Each plan MUST:
- Include EXACT steps with timelines and success metrics
- Provide templates, scripts, or tools for each step
- Include troubleshooting for common obstacles
- Show MEASURABLE outcomes within 30-90 days

❌ AVOID: Vague advice like "create better content"
✅ FOCUS ON: Exact implementation with tools, templates, scripts, and metrics

EXAMPLES OF HIGH-VALUE ACTION PLAN CONCEPTS:
- "The 30-Day Email List Building Blueprint" - Exact steps to build 1,000 subscribers including templates, tools, and daily tasks
- "The 7-Day Social Media Content System" - Complete system with templates, posting schedules, and engagement tactics
- "The 90-Day SEO Action Plan" - Step-by-step keyword research, content creation, and link building with tracking spreadsheets

Return JSON in this exact format:
{
  "concepts": [
    {
      "title": "The [Timeframe] [Outcome] Action Plan - Get [Specific Result] in [X] Days",
      "description": "A step-by-step roadmap with exact tasks, templates, and tools to achieve [specific measurable outcome] within [timeframe] - includes troubleshooting guide",
      "value_proposition": "Skip months of trial and error - follow this proven system to [specific result] with included templates, scripts, and tracking tools",
      "target_audience": "[Target audience] ready to take action but need a proven system with exact steps"
    },
    {
      "title": "The [Timeframe] [Outcome] Action Plan - Get [Specific Result] in [X] Days",
      "description": "A step-by-step roadmap with exact tasks, templates, and tools to achieve [specific measurable outcome] within [timeframe] - includes troubleshooting guide",
      "value_proposition": "Skip months of trial and error - follow this proven system to [specific result] with included templates, scripts, and tracking tools",
      "target_audience": "[Target audience] ready to take action but need a proven system with exact steps"
    },
    {
      "title": "The [Timeframe] [Outcome] Action Plan - Get [Specific Result] in [X] Days",
      "description": "A step-by-step roadmap with exact tasks, templates, and tools to achieve [specific measurable outcome] within [timeframe] - includes troubleshooting guide",
      "value_proposition": "Skip months of trial and error - follow this proven system to [specific result] with included templates, scripts, and tracking tools",
      "target_audience": "[Target audience] ready to take action but need a proven system with exact steps"
    }
  ]
}`;

    case 'benchmark_report':
      return `${baseContext}

Generate 3 Benchmark Report concepts that reveal SPECIFIC performance gaps with competitive intelligence.

Each report MUST:
- Compare against SPECIFIC industry data (not generic averages)
- Identify EXACT gaps and improvement opportunities
- Include competitor analysis and positioning insights
- Provide TACTICAL improvements based on gaps

❌ AVOID: Generic "how you compare" reports
✅ FOCUS ON: Specific competitive intelligence with actionable gap analysis

EXAMPLES OF HIGH-VALUE BENCHMARK CONCEPTS:
- "The E-commerce Conversion Benchmark Report" - Compare your conversion rates against 15 key metrics from 1,000+ stores in your category
- "The SaaS Pricing Intelligence Report" - See exactly how your pricing compares to 50+ competitors with feature-by-feature analysis
- "The Social Media Performance Audit" - Compare your engagement rates against industry leaders with gap analysis and improvement tactics

Return JSON in this exact format:
{
  "concepts": [
    {
      "title": "The [Industry] [Metric] Benchmark Report - See Exactly How You Compare",
      "description": "Compare your [specific metrics] against [number]+ [competitors/industry leaders] and discover the exact gaps costing you [revenue/customers/growth]",
      "value_proposition": "Get insider competitive intelligence usually available only to Fortune 500 companies - see exactly where you're falling behind and how to catch up",
      "target_audience": "[Target audience] who suspect they're underperforming but need specific data to know where and by how much"
    },
    {
      "title": "The [Industry] [Metric] Benchmark Report - See Exactly How You Compare",
      "description": "Compare your [specific metrics] against [number]+ [competitors/industry leaders] and discover the exact gaps costing you [revenue/customers/growth]",
      "value_proposition": "Get insider competitive intelligence usually available only to Fortune 500 companies - see exactly where you're falling behind and how to catch up",
      "target_audience": "[Target audience] who suspect they're underperforming but need specific data to know where and by how much"
    },
    {
      "title": "The [Industry] [Metric] Benchmark Report - See Exactly How You Compare",
      "description": "Compare your [specific metrics] against [number]+ [competitors/industry leaders] and discover the exact gaps costing you [revenue/customers/growth]",
      "value_proposition": "Get insider competitive intelligence usually available only to Fortune 500 companies - see exactly where you're falling behind and how to catch up",
      "target_audience": "[Target audience] who suspect they're underperforming but need specific data to know where and by how much"
    }
  ]
}`;

    case 'opportunity_finder':
      return `${baseContext}

Generate 3 Opportunity Finder concepts that reveal SPECIFIC, untapped revenue sources.

Each finder MUST:
- Identify SPECIFIC opportunities with dollar amounts
- Show missed revenue streams or cost savings
- Include implementation difficulty and potential ROI
- Focus on LOW-EFFORT, HIGH-IMPACT opportunities

❌ AVOID: Generic brainstorming tools
✅ FOCUS ON: Specific revenue opportunities with implementation roadmaps

EXAMPLES OF HIGH-VALUE Opportunity Concepts:
- "The Hidden Revenue Stream Finder" - Analyzes your business model to find 3-5 untapped revenue sources worth $X each
- "The Customer Lifetime Value Optimizer" - Identifies specific tactics to increase customer value by 20-50% with minimal effort
- "The Conversion Rate Goldmine Detector" - Finds overlooked conversion opportunities in your funnel worth $X in additional revenue

Return JSON in this exact format:
{
  "concepts": [
    {
      "title": "The [Type] Opportunity Finder - Discover $[Amount] in Hidden [Revenue/Savings]",
      "description": "Analyze [specific business area] to uncover [X] untapped opportunities worth $[amount] each - includes implementation difficulty scores and ROI projections",
      "value_proposition": "Most [target audience] are sitting on $[amount]+ in missed opportunities - this finder reveals exactly what they are and how to capture them",
      "target_audience": "[Target audience] who have plateaued and need fresh growth strategies they haven't considered"
    },
    {
      "title": "The [Type] Opportunity Finder - Discover $[Amount] in Hidden [Revenue/Savings]",
      "description": "Analyze [specific business area] to uncover [X] untapped opportunities worth $[amount] each - includes implementation difficulty scores and ROI projections",
      "value_proposition": "Most [target audience] are sitting on $[amount]+ in missed opportunities - this finder reveals exactly what they are and how to capture them",
      "target_audience": "[Target audience] who have plateaued and need fresh growth strategies they haven't considered"
    },
    {
      "title": "The [Type] Opportunity Finder - Discover $[Amount] in Hidden [Revenue/Savings]",
      "description": "Analyze [specific business area] to uncover [X] untapped opportunities worth $[amount] each - includes implementation difficulty scores and ROI projections",
      "value_proposition": "Most [target audience] are sitting on $[amount]+ in missed opportunities - this finder reveals exactly what they are and how to capture them",
      "target_audience": "[Target audience] who have plateaued and need fresh growth strategies they haven't considered"
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
    },
    {
      "title": "The Complete [Topic] System - [Specific Outcome] in [Timeframe]",
      "description": "A comprehensive [X]-page guide with step-by-step processes, [number] templates, case studies, and everything needed to [specific result]",
      "value_proposition": "Get the complete system that took [time period] to develop and has generated [specific results] - includes all templates and tools",
      "target_audience": "[Target audience] who want a comprehensive system they can implement immediately without missing any steps"
    },
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
- 7-12 diagnostic questions that reveal ROOT CAUSES
- Questions must build on each other logically
- Each question should eliminate possible causes
- Final diagnosis must include SPECIFIC next steps
- Include success metrics and timelines

❌ AVOID: Surface-level questions, generic results
✅ FOCUS ON: Professional diagnostic methodology with actionable outcomes

Return JSON in this exact format:
{
  "title": "${selected.title}",
  "introduction": "Professional hook explaining the diagnostic process and what insights they'll receive",
  "core_points": [
    "Question 1: [Specific diagnostic question that rules out/confirms X]",
    "Question 2: [Builds on Q1 to narrow down to Y or Z]", 
    "Question 3: [Further diagnostic refinement]",
    "Results Framework: [How answers combine to create diagnosis]",
    "Action Protocol: [Specific next steps based on each diagnosis type]"
  ],
  "cta": "Take the diagnostic quiz to get your personalized action plan",
  "example": "Example: A marketing agency discovered their lead generation wasn't working because they were targeting too broad an audience (Question 3 revelation), not because of poor ad copy (ruled out in Question 1)",
  "template": "Quiz flow: Symptom identification → Root cause analysis → Diagnosis confirmation → Action prescription"
}`;

    case 'roi_calculator':
      return `${baseContext}

Create a FINANCIAL IMPACT content outline that reveals shocking dollar amounts.

REQUIREMENTS:
- Include 5-8 input variables that most people underestimate
- Calculate multiple impact scenarios (conservative, realistic, aggressive)
- Show opportunity cost of inaction
- Include industry benchmarks for comparison
- Provide specific improvement recommendations

❌ AVOID: Simple percentage calculators
✅ FOCUS ON: Multi-variable financial impact with benchmarking

Return JSON in this exact format:
{
  "title": "${selected.title}",
  "introduction": "Hook about the hidden costs most people don't calculate correctly",
  "core_points": [
    "Input Variable 1: [Specific metric with industry context]",
    "Input Variable 2: [Another key metric most underestimate]",
    "Calculation Matrix: [How variables combine for total impact]",
    "Benchmark Comparison: [How user compares to industry averages]",
    "Opportunity Cost Analysis: [What inaction is costing them]",
    "Action Recommendations: [Specific steps to improve each metric]"
  ],
  "cta": "Calculate your exact financial impact and see how you compare",
  "example": "Example: Most e-commerce stores discover they're losing $2,847/month in revenue from a 2.1% cart abandonment rate (vs 1.4% industry average) - a simple email sequence could recover 35% of that",
  "template": "Input Collection → Multi-scenario Calculation → Benchmark Comparison → Gap Analysis → Improvement Roadmap"
}`;

    case 'action_plan':
      return `${baseContext}

Create a STEP-BY-STEP implementation outline with exact tasks and timelines.

REQUIREMENTS:
- Break down into weekly phases with specific tasks
- Include templates, scripts, or tools for each step
- Provide success metrics and checkpoints
- Address common obstacles and solutions
- Give exact timelines and resource requirements

❌ AVOID: High-level advice without specific actions
✅ FOCUS ON: Exact implementation with tools and troubleshooting

Return JSON in this exact format:
{
  "title": "${selected.title}",
  "introduction": "Why most people fail at [topic] and how this system eliminates guesswork",
  "core_points": [
    "Week 1: [Specific setup tasks with templates provided]",
    "Week 2: [Implementation phase with scripts/tools]",
    "Week 3: [Optimization with measurement framework]",
    "Success Metrics: [Exact KPIs to track with target numbers]",
    "Troubleshooting Guide: [Common problems and solutions]",
    "Templates & Tools: [List of provided resources]"
  ],
  "cta": "Get your complete implementation roadmap with templates and tools",
  "example": "Example: Following Week 2's email template and sending schedule, a consultant increased response rates from 8% to 34% and booked 12 calls in one week",
  "template": "Phase-by-phase breakdown with tasks, tools, metrics, and troubleshooting for each stage"
}`;

    case 'benchmark_report':
      return `${baseContext}

Create a COMPETITIVE INTELLIGENCE outline that reveals specific performance gaps.

REQUIREMENTS:
- Compare against 10+ specific industry metrics
- Include competitor analysis and positioning
- Identify exact improvement opportunities with ROI
- Provide tactical recommendations for each gap
- Include industry trend analysis

❌ AVOID: Generic comparison reports
✅ FOCUS ON: Specific competitive intelligence with action plans

Return JSON in this exact format:
{
  "title": "${selected.title}",
  "introduction": "Industry intelligence that reveals exactly where you're falling behind competitors",
  "core_points": [
    "Performance Matrix: [10+ key metrics vs industry leaders]",
    "Competitive Gap Analysis: [Specific areas of underperformance]",
    "Opportunity Scoring: [Which gaps to prioritize by ROI potential]",
    "Tactical Improvements: [Specific actions to close each gap]",
    "Industry Trends: [What's changing and how to get ahead]",
    "Implementation Priority: [Which changes to make first]"
  ],
  "cta": "Get your competitive intelligence report and gap analysis",
  "example": "Example: SaaS companies discovered their onboarding sequence was 40% longer than top performers, causing 23% higher churn - reducing it by 2 steps increased retention by 31%",
  "template": "Metric Collection → Competitive Comparison → Gap Identification → Opportunity Scoring → Action Prioritization"
}`;

    case 'opportunity_finder':
      return `${baseContext}

Create an OPPORTUNITY ANALYSIS outline that reveals untapped revenue sources.

REQUIREMENTS:
- Analyze 5-7 specific business areas for opportunities
- Quantify potential value of each opportunity
- Score opportunities by effort vs impact
- Provide implementation roadmaps for top opportunities
- Include risk assessment and success probability

❌ AVOID: Generic brainstorming exercises
✅ FOCUS ON: Specific revenue opportunities with implementation plans

Return JSON in this exact format:
{
  "title": "${selected.title}",
  "introduction": "The systematic method to find hidden revenue streams worth $X+ in your business",
  "core_points": [
    "Revenue Stream Analysis: [Current vs potential revenue sources]",
    "Opportunity Categories: [5-7 specific areas to analyze]",
    "Value Quantification: [How to calculate potential from each opportunity]",
    "Effort vs Impact Matrix: [Which opportunities to prioritize]",
    "Implementation Roadmaps: [Step-by-step plans for top 3 opportunities]",
    "Risk Assessment: [Success probability and mitigation strategies]"
  ],
  "cta": "Discover your hidden revenue opportunities and implementation roadmap",
  "example": "Example: A coaching business discovered 3 untapped revenue streams worth $8,400/month: group programs (low effort, high impact), affiliate partnerships (medium effort, medium impact), and corporate workshops (high effort, very high impact)",
  "template": "Business Analysis → Opportunity Identification → Value Calculation → Priority Scoring → Implementation Planning"
}`;

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
    "Phase 3 - Optimization: [Improvement strategies with metrics]",
    "Templates & Tools: [List of 10+ included resources]",
    "Case Studies: [3+ specific examples with results]",
    "Troubleshooting: [Common problems and solutions]"
  ],
  "cta": "Download the complete system with all templates and tools",
  "example": "Example: Using the provided email templates and sequence timing, a fitness coach increased course sales from $3,200/month to $12,800/month in 6 weeks",
  "template": "Complete implementation system with processes, tools, templates, case studies, and troubleshooting guides"
}`;

    default:
      throw new Error(`Unknown format: ${format}`);
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
2. **Question Bank**: 10-15 strategic questions that build on each other
3. **Scoring System**: How answers combine to create accurate diagnosis
4. **Result Categories**: 4-6 specific diagnosis types with solutions
5. **Action Protocols**: Exact next steps for each diagnosis type
6. **Success Tracking**: How to measure improvement

CRITICAL REQUIREMENTS:
- Questions must reveal ROOT CAUSES, not just symptoms
- Each result category needs SPECIFIC action steps
- Include success metrics and timelines
- Provide troubleshooting for each diagnosis type

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
  "diagnostic_framework": {
    "methodology": "The scientific approach behind this diagnostic",
    "question_strategy": "How questions are designed to reveal root causes",
    "accuracy_factors": "What makes this diagnostic reliable"
  },
  "question_bank": [
    {
      "question_number": 1,
      "question_text": "Specific diagnostic question",
      "answer_options": ["Option A", "Option B", "Option C"],
      "diagnostic_purpose": "What this question reveals about the problem"
    }
  ],
  "result_categories": [
    {
      "category_name": "Specific Diagnosis Type",
      "description": "What this diagnosis means",
      "symptoms": ["Symptom 1", "Symptom 2", "Symptom 3"],
      "root_causes": ["Cause 1", "Cause 2"],
      "action_protocol": ["Step 1", "Step 2", "Step 3"],
      "success_metrics": "How to measure improvement",
      "timeline": "Expected improvement timeframe"
    }
  ],
  "implementation_guide": {
    "how_to_use": "Step-by-step guide for taking and interpreting the quiz",
    "action_planning": "How to create action plan from results",
    "progress_tracking": "How to monitor improvement over time"
  }
}`;

    case 'roi_calculator':
      return `${baseContext}

${founderIntro}

${valueStandards}

CREATE A FINANCIAL IMPACT CALCULATOR SYSTEM:

This must be a comprehensive tool that reveals shocking financial insights and creates urgency.

REQUIRED STRUCTURE:
1. **Calculation Framework**: The methodology for financial analysis
2. **Input Variables**: 8-12 key metrics with industry context
3. **Calculation Matrix**: How variables combine for total impact
4. **Scenario Analysis**: Conservative, realistic, and aggressive projections
5. **Benchmark Comparison**: How user compares to industry leaders
6. **Improvement Roadmap**: Specific tactics to improve each metric

CRITICAL REQUIREMENTS:
- Show exact dollar amounts, not vague percentages
- Include opportunity cost of inaction
- Provide industry benchmarks for context
- Give specific improvement tactics for each metric

RETURN JSON IN THIS EXACT FORMAT:
{
  "founder_intro": "Personal introduction explaining the financial impact this calculator reveals",
  "title_page": {
    "title": "${outline.title}",
    "subtitle": "Discover the Exact Financial Impact of [Problem/Opportunity]"
  },
  "introduction_page": {
    "title": "The Hidden Costs You're Not Calculating",
    "content": "Explain why this financial analysis is crucial and what they'll discover"
  },
  "calculation_framework": {
    "methodology": "The financial analysis approach used",
    "variable_selection": "Why these specific metrics matter",
    "accuracy_factors": "What makes these calculations reliable"
  },
  "input_variables": [
    {
      "variable_name": "Current Revenue",
      "description": "Monthly or annual revenue figure",
      "industry_context": "How this compares to industry averages",
      "impact_factor": "How this affects the overall calculation"
    }
  ],
  "calculation_scenarios": [
    {
      "scenario_name": "Conservative Impact",
      "description": "Minimum expected financial impact",
      "calculation_method": "How this scenario is calculated",
      "typical_results": "What users typically discover"
    }
  ],
  "benchmark_analysis": {
    "industry_standards": "Key performance benchmarks",
    "gap_identification": "How to spot underperformance",
    "competitive_context": "How users compare to top performers"
  },
  "improvement_roadmap": [
    {
      "metric": "Specific financial metric",
      "current_typical": "What most people currently achieve",
      "improvement_target": "Realistic improvement goal",
      "tactics": ["Tactic 1", "Tactic 2", "Tactic 3"],
      "financial_impact": "Dollar impact of improvement"
    }
  ]
}`;

    case 'action_plan':
      return `${baseContext}

${founderIntro}

${valueStandards}

CREATE A COMPLETE IMPLEMENTATION SYSTEM:

This must be a step-by-step execution plan with everything needed for success.

REQUIRED STRUCTURE:
1. **Implementation Framework**: The systematic approach to execution
2. **Phase Breakdown**: 4-6 phases with specific tasks and timelines
3. **Tool Arsenal**: Templates, scripts, checklists for each phase
4. **Success Metrics**: Exact KPIs to track with target numbers
5. **Troubleshooting Guide**: Common obstacles and solutions
6. **Acceleration Tactics**: How to get faster results

CRITICAL REQUIREMENTS:
- Every task must have exact steps and timelines
- Include templates and tools for execution
- Provide specific success metrics and checkpoints
- Address common problems and solutions

RETURN JSON IN THIS EXACT FORMAT:
{
  "founder_intro": "Personal introduction explaining why this system works and what results users will get",
  "title_page": {
    "title": "${outline.title}",
    "subtitle": "Your Complete Step-by-Step Implementation System"
  },
  "introduction_page": {
    "title": "Why Most People Fail (And How This System Prevents That)",
    "content": "Explain the systematic approach and what makes it effective"
  },
  "implementation_framework": {
    "methodology": "The systematic approach to execution",
    "phase_strategy": "Why the phases are structured this way",
    "success_factors": "What makes this system work"
  },
  "phase_breakdown": [
    {
      "phase_number": 1,
      "phase_name": "Foundation Setup",
      "timeline": "Days 1-7",
      "objectives": ["Objective 1", "Objective 2"],
      "tasks": [
        {
          "task_name": "Specific task",
          "instructions": "Exact steps to complete",
          "tools_needed": "Templates or tools provided",
          "success_criteria": "How to know it's done correctly"
        }
      ],
      "success_metrics": "What to measure and target numbers"
    }
  ],
  "tool_arsenal": [
    {
      "tool_name": "Template Name",
      "purpose": "What this tool accomplishes",
      "usage_instructions": "How to use it effectively",
      "customization_tips": "How to adapt it to specific needs"
    }
  ],
  "troubleshooting_guide": [
    {
      "common_problem": "Specific obstacle users face",
      "symptoms": "How to recognize this problem",
      "root_cause": "Why this happens",
      "solution": "Exact steps to fix it"
    }
  ]
}`;

    case 'benchmark_report':
      return `${baseContext}

${founderIntro}

${valueStandards}

CREATE A COMPETITIVE INTELLIGENCE SYSTEM:

This must provide insider competitive analysis that reveals specific performance gaps and improvement opportunities.

REQUIRED STRUCTURE:
1. **Benchmark Framework**: The methodology for competitive analysis
2. **Performance Matrix**: 15+ key metrics vs industry leaders
3. **Gap Analysis**: Specific areas of underperformance with impact
4. **Competitive Intelligence**: What top performers do differently
5. **Improvement Priorities**: Which gaps to fix first for maximum ROI
6. **Implementation Tactics**: Specific strategies to close each gap

CRITICAL REQUIREMENTS:
- Include specific industry data and competitor insights
- Quantify the impact of each performance gap
- Provide tactical strategies for improvement
- Show ROI potential for each improvement area

RETURN JSON IN THIS EXACT FORMAT:
{
  "founder_intro": "Personal introduction explaining the competitive intelligence and insights users will get",
  "title_page": {
    "title": "${outline.title}",
    "subtitle": "Industry Intelligence That Reveals Where You're Falling Behind"
  },
  "introduction_page": {
    "title": "The Competitive Intelligence You Need",
    "content": "Explain the insider analysis and what competitive advantages they'll discover"
  },
  "benchmark_framework": {
    "methodology": "How this competitive analysis is conducted",
    "data_sources": "Where the benchmark data comes from",
    "reliability_factors": "What makes this analysis accurate"
  },
  "performance_matrix": [
    {
      "metric_name": "Conversion Rate",
      "your_typical": "What most users currently achieve",
      "industry_average": "Industry standard performance",
      "top_performer": "What leaders achieve",
      "gap_impact": "Financial impact of the performance gap",
      "improvement_potential": "Realistic improvement target"
    }
  ],
  "competitive_intelligence": [
    {
      "performance_area": "Specific business area",
      "what_leaders_do": "Specific tactics top performers use",
      "why_it_works": "The strategic reasoning behind it",
      "implementation_complexity": "How difficult it is to implement",
      "impact_timeline": "How quickly you see results"
    }
  ],
  "gap_analysis": {
    "priority_gaps": "Which performance gaps cost the most",
    "quick_wins": "Easy improvements with high impact",
    "strategic_initiatives": "Longer-term competitive advantages"
  },
  "improvement_roadmap": [
    {
      "gap_area": "Specific underperformance area",
      "current_impact": "What the gap is costing you",
      "improvement_tactics": ["Tactic 1", "Tactic 2", "Tactic 3"],
      "implementation_timeline": "How long to see results",
      "expected_roi": "Financial return on improvement"
    }
  ]
}`;

    case 'opportunity_finder':
      return `${baseContext}

${founderIntro}

${valueStandards}

CREATE AN OPPORTUNITY ANALYSIS SYSTEM:

This must systematically reveal untapped revenue streams and growth opportunities with specific implementation plans.

REQUIRED STRUCTURE:
1. **Opportunity Framework**: The methodology for finding hidden opportunities
2. **Analysis Categories**: 7-10 business areas to analyze for opportunities
3. **Value Quantification**: How to calculate potential from each opportunity
4. **Effort vs Impact Matrix**: Priority scoring for opportunity selection
5. **Implementation Roadmaps**: Step-by-step plans for top opportunities
6. **Risk Assessment**: Success probability and mitigation strategies

CRITICAL REQUIREMENTS:
- Quantify potential value for each opportunity type
- Score opportunities by effort vs impact
- Provide detailed implementation plans for top opportunities
- Include risk assessment and success probability

RETURN JSON IN THIS EXACT FORMAT:
{
  "founder_intro": "Personal introduction explaining the opportunity analysis system and potential discoveries",
  "title_page": {
    "title": "${outline.title}",
    "subtitle": "Systematic Analysis to Uncover Hidden Revenue Opportunities"
  },
  "introduction_page": {
    "title": "The Opportunities Hiding in Your Business",
    "content": "Explain the systematic approach and what revenue opportunities they'll discover"
  },
  "opportunity_framework": {
    "methodology": "The systematic approach to opportunity identification",
    "analysis_process": "How to evaluate each potential opportunity",
    "validation_criteria": "How to determine if an opportunity is viable"
  },
  "analysis_categories": [
    {
      "category_name": "Revenue Stream Diversification",
      "description": "New ways to monetize existing assets",
      "analysis_questions": ["Question 1", "Question 2", "Question 3"],
      "opportunity_types": ["Opportunity type 1", "Opportunity type 2"],
      "typical_value_range": "$X,000 - $XX,000 additional monthly revenue"
    }
  ],
  "value_quantification": {
    "calculation_method": "How to estimate opportunity value",
    "variable_factors": "Key factors that affect potential value",
    "validation_process": "How to test opportunity assumptions"
  },
  "priority_matrix": [
    {
      "opportunity_name": "Specific opportunity",
      "effort_score": "Low/Medium/High effort required",
      "impact_score": "Expected revenue/savings impact",
      "risk_level": "Implementation risk assessment",
      "timeline": "Expected time to results",
      "priority_ranking": "Overall priority score"
    }
  ],
  "implementation_roadmaps": [
    {
      "opportunity": "Top priority opportunity",
      "implementation_phases": [
        {
          "phase": "Phase 1: Validation",
          "timeline": "Weeks 1-2",
          "tasks": ["Task 1", "Task 2", "Task 3"],
          "success_criteria": "How to know you're ready for next phase"
        }
      ],
      "resource_requirements": "What you need to implement",
      "success_metrics": "How to measure progress and success"
    }
  ]
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
  "founder_intro": "Personal introduction explaining the complete system and guaranteed results users will get",
  "title_page": {
    "title": "${outline.title}",
    "subtitle": "The Complete System with Templates, Tools, and Case Studies"
  },
  "introduction_page": {
    "title": "Why This System Eliminates All Guesswork",
    "content": "Explain the comprehensive approach and what complete results they'll achieve"
  },
  "system_overview": {
    "methodology": "The complete process from start to finish",
    "phase_structure": "Why the system is organized this way",
    "success_factors": "What makes this system foolproof"
  },
  "implementation_phases": [
    {
      "phase_number": 1,
      "phase_name": "Foundation & Setup",
      "duration": "Days 1-10",
      "objectives": ["Objective 1", "Objective 2", "Objective 3"],
      "step_by_step_process": [
        {
          "step_number": 1,
          "step_title": "Specific action step",
          "detailed_instructions": "Exact instructions with specifics",
          "tools_provided": "Templates or tools included",
          "success_checkpoint": "How to know it's completed correctly",
          "common_mistakes": "What to avoid"
        }
      ],
      "phase_deliverables": "What you'll have completed",
      "success_metrics": "How to measure phase completion"
    }
  ],
  "tool_arsenal": [
    {
      "tool_category": "Templates",
      "tools": [
        {
          "tool_name": "Specific template name",
          "purpose": "What this template accomplishes",
          "usage_instructions": "How to customize and use it",
          "success_tips": "How to get best results"
        }
      ]
    }
  ],
  "case_studies": [
    {
      "case_title": "Specific industry/situation example",
      "background": "Initial situation and challenges",
      "implementation": "How they applied the system",
      "specific_results": "Exact measurable outcomes",
      "timeline": "How long it took to see results",
      "key_lessons": "What made the difference"
    }
  ],
  "troubleshooting_guide": [
    {
      "problem_category": "Common obstacle type",
      "specific_problems": [
        {
          "problem": "Specific issue users face",
          "symptoms": "How to recognize this problem",
          "root_causes": "Why this happens",
          "solution_steps": "Exact steps to fix it",
          "prevention": "How to avoid it in the future"
        }
      ]
    }
  ],
  "optimization_strategies": {
    "performance_tracking": "What metrics to monitor",
    "improvement_tactics": "How to enhance results over time",
    "advanced_techniques": "Next-level strategies for power users"
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

export async function generateContentOutline(input: CampaignInput, selected: LeadMagnetConcept): Promise<ContentOutline> {
  const client = getOpenAIClient();
  
  try {
    const formatSpecificPrompt = getFormatSpecificOutlinePrompt(input.selected_format || 'pdf', input, selected);
    
    const res = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a content strategist. Create detailed content outlines that provide tactical value and clear implementation steps.' },
        { role: 'user', content: formatSpecificPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    if (!res.choices?.[0]?.message?.content) {
      throw new Error('Empty response received from OpenAI API');
    }

    const content = res.choices[0].message.content;
    
    // Clean the content to handle markdown-wrapped JSON
    const cleanedContent = cleanJsonResponse(content);
    console.log('🎯 OpenAI Outline Response (cleaned):', cleanedContent);
    const parsed = JSON.parse(cleanedContent);

    // Validate the response structure
    if (!parsed.title || !parsed.introduction || !Array.isArray(parsed.core_points)) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return {
      title: parsed.title,
      introduction: parsed.introduction,
      core_points: parsed.core_points,
      sections: parsed.sections || [],
      estimated_length: parsed.estimated_length || '5-10 minutes',
      target_audience: parsed.target_audience || input.target_audience,
      main_value_proposition: parsed.main_value_proposition || parsed.value_proposition || ''
    };
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
      throw new Error('Request timed out while generating content outline. Please try again.');
    } else if (err.message.includes('JSON') || err.message.includes('Unexpected token')) {
      console.error('JSON parsing error. Original content:', 'No content available');
      throw new Error('Failed to process the content outline. Please try again.');
    }

    throw new Error(`Failed to generate content outline: ${err.message}`);
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

export async function generateLandingPageCopy(input: CampaignInput, outline: ContentOutline): Promise<LandingPageCopy> {
  const client = getOpenAIClient();
  let content = '';

  try {
    const prompt = `You are a conversion copywriter. Create compelling landing page copy for a lead magnet.

LEAD MAGNET DETAILS:
- Title: ${outline.title}
- Main Benefit: ${outline.introduction}
- Target Audience: ${input.target_audience}
- Brand Name: ${input.brand_name}
- Tone: ${input.tone}

INSTRUCTIONS:
Create high-converting landing page copy that:
1. Grabs attention with a compelling headline
2. Builds desire with benefit-focused subheadline
3. Includes 3-4 specific benefit bullets
4. Has a clear, action-oriented CTA button
5. Matches the brand's tone: ${input.tone}

Return JSON in this exact format:
{
  "headline": "Compelling headline that addresses the main pain point",
  "subheadline": "Benefit-focused subheadline that builds desire",
  "benefit_bullets": [
    "Specific benefit 1 with measurable outcome",
    "Specific benefit 2 with measurable outcome", 
    "Specific benefit 3 with measurable outcome",
    "Specific benefit 4 with measurable outcome"
  ],
  "cta_button_text": "Action-oriented button text"
}`;

    const res = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a conversion copywriter who creates high-converting landing page copy. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const responseContent = res.choices[0].message.content;
    if (!responseContent) {
      throw new Error('No content received from OpenAI');
    }
    
    // Clean the content to handle markdown-wrapped JSON
    const cleanedContent = cleanJsonResponse(responseContent);
    console.log('🎯 OpenAI Landing Page Response (cleaned):', cleanedContent);
    const parsed = JSON.parse(cleanedContent);

    // Validate the response structure
    if (!parsed.headline || !parsed.subheadline || !Array.isArray(parsed.benefit_bullets) || !parsed.cta_button_text) {
      throw new Error('Invalid response format from OpenAI API');
    }

    // Ensure benefit_bullets is a usable array, even if the AI messes up. This is better than crashing.
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
      console.error('JSON parsing error. Original content:', 'No content available');
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
  "linkedin": "Professional LinkedIn post with hashtags",
  "twitter": "Concise Twitter post with hashtags",
  "instagram": "Engaging Instagram post with hashtags and emojis",
  "reddit": "Conversational Reddit post with subreddit suggestions"
}`;

    const res = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a social media manager who creates engaging promotional posts. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseContent = res.choices[0].message.content;
    if (!responseContent) {
      throw new Error('No content received from OpenAI');
    }
    
    // Clean the content to handle markdown-wrapped JSON
    const cleanedContent = cleanJsonResponse(responseContent);
    console.log('🎯 OpenAI Social Posts Response (cleaned):', cleanedContent);
    const parsed = JSON.parse(cleanedContent);

    // Validate the response structure
    if (!parsed.linkedin || !parsed.twitter || !parsed.instagram || !parsed.reddit) {
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
      throw new Error('Request timed out while generating social posts. Please try again.');
    } else if (err.message.includes('JSON') || err.message.includes('Unexpected token')) {
      console.error('JSON parsing error. Original content:', 'No content available');
      throw new Error('Failed to process the social posts content. Please try again.');
    }

    throw new Error(`Failed to generate social posts: ${err.message}`);
  }
}

export async function generateFinalCampaign(input: CampaignInput, outline: ContentOutline, customization?: PDFCustomization): Promise<CampaignOutput> {
  try {
    // Generate the lead magnet content
    const contentInput = {
      selected_format: input.selected_format || 'pdf',
      name: input.name || '',
      brand_name: input.brand_name,
      target_audience: input.target_audience,
      niche: input.niche,
      problem_statement: input.problem_statement,
      desired_outcome: input.desired_outcome,
      tone: input.tone || 'professional',
      position: input.position || '',
      concept: {
        id: 'generated-concept',
        title: outline.title,
        description: outline.introduction,
        value_proposition: outline.main_value_proposition,
        target_audience: input.target_audience,
        format: input.selected_format || 'pdf'
      },
      outline: outline
    };

    const pdfContent = await generateLeadMagnetContent(contentInput);
    
    // Generate landing page copy
    const landingPageCopy = await generateLandingPageCopy(input, outline);
    
    // Generate social posts
    const socialPosts = await generateSocialPosts(input, outline);

    return {
      pdf_content: pdfContent,
      landing_page: landingPageCopy,
      social_posts: socialPosts
    };
  } catch (error) {
    console.error('Error generating final campaign:', error);
    throw new Error('Failed to generate final campaign');
  }
}