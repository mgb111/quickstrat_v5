import OpenAI from 'openai';
import {
  CampaignInput,
  LeadMagnetConcept,
  ContentOutline,
  LandingPage,
  SocialPosts,
  CampaignOutput,
  PDFContent,
  LandingPageCopy
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
    const prompt = `You are a lead generation expert. Based on the user's inputs, generate 6 unique lead magnet concepts.
User Context:
- Niche: ${input.niche}
- Customer Problem Statement: ${input.problem_statement}
- Desired Outcome: ${input.desired_outcome}
- Target Audience: ${input.target_audience}

Each concept must be framed as a practical TOOL (checklist, template, cheat sheet, guide, action plan, etc.).

Requirements:
- Each concept should solve ONE specific problem related to their pain point.
- Frame as actionable tools, not general guides.
- Make them specific to their niche and audience.
- Ensure each is distinct and valuable.
- For each concept, provide a concrete, step-by-step example or micro-case study showing how it would be used in practice (1-2 sentences).
- If possible, include a plug-and-play template or swipe file for the user to use immediately.
- Use sharp, actionable language—avoid generic advice.

Return JSON in this exact format:
{
  "concepts": [
    {
      "id": "concept-1",
      "title": "A [Tool Type] for [Specific Problem]",
      "description": "Brief description of what this tool accomplishes (15-25 words)",
      "example": "A real-life example or micro-case study (1-2 sentences)",
      "template": "A plug-and-play template or swipe file (if applicable)"
    }
  ]
}`;

    const res = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a content strategist. Output strictly valid JSON as defined.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
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
  const client = getOpenAIClient();

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
1. Title: A sharp, specific headline for the selected concept (8-12 words)
2. Introduction: A concise hook that states the problem this tool solves (40-60 words)
3. Core Points: 4-6 bullet points outlining key steps/points (10-15 words each)
4. CTA: A brief call-to-action offering next steps (25-40 words)
5. Example: Provide at least one real-life example or micro-case study for the main strategy (2-3 sentences)
6. Template: If possible, include a plug-and-play template or swipe file for the user to use immediately.

Use sharp, actionable language—avoid generic advice.

Return JSON in this exact format:
{
  "title": "The [Tool Name]: [Specific Benefit]",
  "introduction": "...",
  "core_points": ["..."],
  "cta": "...",
  "example": "A real-life example or micro-case study (2-3 sentences)",
  "template": "A plug-and-play template or swipe file (if applicable)"
}`;

    const res = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a content strategist. Output strictly valid JSON as defined.' },
        { role: 'user', content: prompt }
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

export async function generatePdfContent(input: CampaignInput, outline: ContentOutline): Promise<PDFContent> {
  const client = getOpenAIClient();

  try {    const prompt = `You are an expert Instructional Designer and Layout Designer. Your task is to generate the complete and final content for an A+ grade, high-value lead magnet. Your output must be structured for a visually dense, professional PDF where every page is either intentionally centered for impact or completely filled with valuable content.

USER CONTEXT:
Niche: ${input.niche}
Target Audience: ${input.target_audience}
Tone: ${input.tone}
Brand Name: ${input.brand_name}
Position/Title: ${input.position || ''}
Selected Concept: A lead magnet about ${outline.title}.

---

PERSONALIZED FOUNDER INTRODUCTION:
Before the toolkit, write a short, authentic introduction in the founder’s voice. Use these details:
- Name: ${input.name}
- Position/Title: ${input.position || ''}
- Brand/company: ${input.brand_name}
- Customer problem: ${input.problem_statement}
- Desired outcome: ${input.desired_outcome}
If position/title is provided, use it in the intro (e.g., "I'm [Name], [Position] at [Brand]"). The intro should sound like the founder is speaking directly to the reader, sharing why they built this and what the reader will achieve. Make it authentic, concise, and motivating. Return this as a field called founder_intro in the JSON.

---

**MANDATORY CASE STUDY REQUIREMENTS (CRITICAL):**
- EVERY pros_and_cons_list item MUST have a "case_study" field (2-3 sentences, specific numbers, real-world context)
- The checklist section MUST have a "case_study" field (2-3 sentences, specific numbers, real-world context)
- EVERY script scenario MUST have a "case_study" field (2-3 sentences, specific numbers, real-world context)
- If you miss ANY case study, your output will be REJECTED.

**EXAMPLES:**
- pros_and_cons_list item:
  "case_study": "Sarah, a fitness coach, tested Instagram vs. Facebook ads for her online program. Instagram brought in 40% more qualified leads at half the cost, but required daily content creation. She now focuses 80% of her efforts on Instagram while using Facebook for retargeting."
- checklist section:
  "case_study": "TechCorp used this checklist to implement VR training for their sales team. They started with a pilot of 20 reps, saw a 35% improvement in sales performance, and then rolled it out company-wide, saving $200K in traditional training costs."
- script scenario:
  "case_study": "Lisa, a procurement manager, used this script when negotiating with a software vendor. She secured a 20% discount that was valid for 45 days, giving her team time to evaluate the solution. The vendor later increased the discount to 25% to close the deal."

If you do not include a case study for EVERY required field, your output will be rejected.

---

CORE PRINCIPLES (NON-NEGOTIABLE):
VISUAL DENSITY: Every content page must be "completely filled." You must generate enough detailed content (text, lists, or structured content) to fill a standard document page. Sparse pages with single paragraphs are forbidden.

STRUCTURED FORMATTING: You MUST use a variety of formats—paragraphs, bulleted lists, numbered lists, and structured content—to enhance readability and ensure pages are full.

EXTREME VALUE: Every section must be a tangible tool that provides the "how," not just the "what."

NO SELLING: The content must be 100% educational and brand-agnostic.

CRITICAL REDUNDANCY RULE: If you include a checklist section, DO NOT create a separate "step-by-step guide" section. The checklist is the superior implementation tool and should be the sole guide. Avoid redundancy at all costs.

THE BLUEPRINT: GENERATE THE FOLLOWING COMPONENTS WITH LAYOUT INSTRUCTIONS

1. Title Page (layout: "centered"):
Title: A sharp, specific headline (8-12 words).
Subtitle: A powerful subtitle that makes a quantifiable promise (10-15 words).

2. Introduction Page (layout: "filled"):
Title: A clear, engaging title for the introduction (e.g., "Why This Toolkit Will Change Your Approach").
Content: A concise but powerful introduction (80-120 words) that hooks the reader with a sharp pain point and clearly states what tangible tools they will receive. This length is required to properly fill the page.

3. The Toolkit Sections (layout: "filled"):
Generate EXACTLY 3 distinct toolkit sections. Each section must be comprehensive enough to be a filled page on its own. The content for each tool must be detailed and expanded.

SECTION TYPES TO USE (NO TABLES, NO REDUNDANT STEP-BY-STEP GUIDES):

- For type: "pros_and_cons_list": Use this for comparing different methods or strategies. Generate a list of AT LEAST 3-6 items. Each item MUST have a "method_name", a single "pros" string (not an array), a single "cons" string (not an array), and a "case_study" field with a brief real-world example (2-3 sentences). Format exactly like this example:

EXAMPLE PROS AND CONS FORMAT:
{
  "method_name": "Social Media Marketing",
  "pros": "Offers wide reach and the ability to form a personal connection with prospects.",
  "cons": "It is time-consuming and requires the regular creation of new content to stay relevant.",
  "case_study": "Sarah, a fitness coach, tested Instagram vs. Facebook ads for her online program. Instagram brought in 40% more qualified leads at half the cost, but required daily content creation. She now focuses 80% of her efforts on Instagram while using Facebook for retargeting."
}

For type: "checklist": The checklist must be broken into 2-3 sub-headings or phases and contain a total of 8-12 detailed, actionable items. Include a "case_study" field with a brief real-world example showing how this checklist was used successfully (2-3 sentences). Format exactly like this example:

EXAMPLE CHECKLIST FORMAT:
{
  "phases": [
    {
      "phase_title": "Phase A: Initial Assessment",
      "items": [
        "1.1 Identify the training needs that can be addressed using VR",
        "1.2 Estimate the number of users who will need access to VR training",
        "1.3 Calculate the budget available for VR training implementation"
      ]
    }
  ],
  "case_study": "TechCorp used this checklist to implement VR training for their sales team. They started with a pilot of 20 reps, saw a 35% improvement in sales performance, and then rolled it out company-wide, saving $200K in traditional training costs."
}

For type: "scripts": Provide at least 3-4 script scenarios, each with a "trigger" (what they say), "response" (what you say), "explanation" (strategy behind the script), and a "case_study" field with a detailed real-world example (2-3 sentences) showing the script in action with specific results. Include specific numbers, outcomes, and context to make it relatable.

For type: "mistakes_to_avoid": List 4-5 common mistakes. For each mistake, provide a "mistake" description and a "solution" paragraph of 40-50 words. Include a real-life example or case study for at least one mistake.

IMPORTANT: DO NOT USE "step_by_by_step_guide" type if you already have a checklist. The checklist serves as the implementation guide and creating both would be redundant.

4. Call to Action Page (layout: "centered"):
Title: A clear, action-oriented title (e.g., "Your Next Step").
Content: Write a custom, relevant call-to-action for this campaign. The CTA should reference the brand name (${input.brand_name}) and the lead magnet topic (${outline.title}), and encourage the reader to take a next step relevant to their business (such as booking a call, downloading more resources, or contacting support). Make it actionable, specific, bold, urgent, and benefit-driven. Do NOT use a generic or unrelated CTA.

5. For each toolkit section, if possible, include a plug-and-play template or swipe file for the user to use immediately.

6. Use sharp, actionable language—avoid generic advice. Add at least one real-life example or micro-case study per strategy or script.

FINAL GUARDRAIL AND SELF-CORRECTION: Before generating the JSON, you MUST verify your own output against the mandatory instructions.
1. Is the content for each page dense enough?
2. Does the checklist contain 8-12 items across 2-3 phases?
3. Are there exactly 3 toolkit sections with no redundancy?
4. Is the CTA custom, relevant, and tailored to the brand and lead magnet topic?
5. Have you avoided creating both a checklist AND a step-by-step guide?
6. **CRITICAL: Have you included case_study fields for EVERY strategy item, checklist section, and script scenario?**
7. **CRITICAL: Are all case studies specific, with real numbers, outcomes, and context?**
8. Have you included a plug-and-play template or swipe file where possible?
If any answer is no, you MUST rewrite that section to fully comply before providing the final output.
`

    const res = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert Instructional Designer and Layout Designer. Output strictly valid JSON as defined. Generate visually dense, professionally structured content for each page. CRITICAL: Generate EXACTLY 3 toolkit sections. All scripts sections must have exactly 3-4 scenarios with "trigger", "response", "explanation", and "case_study" fields. For pros_and_cons_list, each item must have "method_name", "pros" (single string), "cons" (single string), and "case_study" fields. For checklist, use phases with numbered items like "1.1", "2.1", etc. and include a "case_study" field. DO NOT create both checklist and step-by-step guide to avoid redundancy. MANDATORY: Every section MUST include case studies with specific numbers and outcomes.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4500
    });

    if (!res.choices?.[0]?.message?.content) {
      throw new Error('Empty response received from OpenAI API');
    }

    const content = res.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Validate the response structure
    if (!parsed.founder_intro || !parsed.title_page || !parsed.introduction_page || !Array.isArray(parsed.toolkit_sections) || !parsed.cta_page) {
      throw new Error('Invalid response format from OpenAI API - missing required pages');
    }

    // Validate title page
    if (!parsed.title_page.title || !parsed.title_page.subtitle || parsed.title_page.layout !== 'centered') {
      throw new Error('Invalid title page format');
    }

    // Validate introduction page
    if (!parsed.introduction_page.title || !parsed.introduction_page.content || parsed.introduction_page.layout !== 'filled') {
      throw new Error('Invalid introduction page format');
    }

    // Validate toolkit sections (EXACTLY 3 sections required for A+ document)
    if (parsed.toolkit_sections.length !== 3) {
      throw new Error('Must have exactly 3 toolkit sections for A+ document quality');
    }

    // Additional validation: pros_and_cons_list must have at least 3 items
    const prosConsSection = parsed.toolkit_sections.find((section: any) => section.type === 'pros_and_cons_list');
    if (prosConsSection && prosConsSection.content && Array.isArray(prosConsSection.content.items)) {
      if (prosConsSection.content.items.length < 3) {
        throw new Error('Pros and cons section must have at least 3 items');
      }
    }

    // Check for redundancy - ensure no step-by-step guide if checklist exists
    const hasChecklist = parsed.toolkit_sections.some((section: any) => section.type === 'checklist');
    const hasStepByStep = parsed.toolkit_sections.some((section: any) => section.type === 'step_by_step_guide');
    
    if (hasChecklist && hasStepByStep) {
      throw new Error('Document contains redundant sections: both checklist and step-by-step guide. Remove redundancy for A+ quality.');
    }

    // Validate each toolkit section with improved validation
    for (const section of parsed.toolkit_sections) {
      if (!section.title || !section.type || section.layout !== 'filled') {
        throw new Error('Each toolkit section must have title, type, and filled layout');
      }
      
      // Improved validation based on type - NO TABLE VALIDATION
      switch (section.type) {
        case 'checklist':
          if (!section.content?.phases || !Array.isArray(section.content?.phases)) {
            throw new Error('Checklist section must have phases array');
          }
          if (section.content.phases.length < 1) {
            throw new Error('Checklist section must have at least 1 phase');
          }
          // ENFORCE CASE STUDIES
          if (!section.content.case_study || typeof section.content.case_study !== 'string') {
            throw new Error('Checklist section MUST include a case_study field with a real-world example (2-3 sentences)');
          }
          break;
        case 'scripts':
          // Handle both old and new format for scripts
          if (section.content?.scenarios && Array.isArray(section.content.scenarios)) {
            // New format with scenarios array
            if (section.content.scenarios.length < 2) {
              throw new Error('Scripts section must have at least 2 scenarios');
            }
            // Validate each scenario has required fields
            for (const scenario of section.content.scenarios) {
              if (!scenario.trigger || !scenario.response || !scenario.explanation) {
                throw new Error('Each script scenario must have trigger, response, and explanation fields');
              }
              // ENFORCE CASE STUDIES
              if (!scenario.case_study || typeof scenario.case_study !== 'string') {
                throw new Error('Each script scenario MUST include a case_study field with a real-world example (2-3 sentences)');
              }
            }
          } else if (Array.isArray(section.content)) {
            // Old format - convert to new format
            console.warn('Converting old scripts format to new format');
            section.content = {
              scenarios: section.content.map((script: any, index: number) => ({
                trigger: script.trigger || `Scenario ${index + 1} trigger`,
                response: script.response || `Scenario ${index + 1} response`,
                explanation: script.explanation || `Strategy for scenario ${index + 1}`
              }))
            };
          } else {
            throw new Error('Scripts section must have scenarios array');
          }
          break;
        case 'mistakes_to_avoid':
          if (!section.content?.mistakes || !Array.isArray(section.content?.mistakes)) {
            throw new Error('Mistakes section must have mistakes array');
          }
          if (section.content.mistakes.length < 3) {
            throw new Error('Mistakes section must have at least 3 mistakes');
          }
          break;
        case 'pros_and_cons_list':
          if (!section.content?.items || !Array.isArray(section.content?.items)) {
            throw new Error('Pros and cons section must have items array');
          }
          if (section.content.items.length < 3) {
            throw new Error('Pros and cons section must have at least 3 items');
          }
          // Validate each item has required structure with single strings (not arrays)
          for (const item of section.content.items) {
            if (!item.method_name || typeof item.pros !== 'string' || typeof item.cons !== 'string') {
              throw new Error('Each pros and cons item must have method_name, pros (single string), and cons (single string)');
            }
            // ENFORCE CASE STUDIES
            if (!item.case_study || typeof item.case_study !== 'string') {
              throw new Error('Each pros and cons item MUST include a case_study field with a real-world example (2-3 sentences)');
            }
          }
          break;
        case 'step_by_step_guide':
          if (!section.content?.steps || !Array.isArray(section.content?.steps)) {
            throw new Error('Step by step guide section must have steps array');
          }
          if (section.content.steps.length < 3) {
            throw new Error('Step by step guide section must have at least 3 steps');
          }
          break;
      }
    }

    // Validate CTA page
    if (!parsed.cta_page.title || !parsed.cta_page.content || parsed.cta_page.layout !== 'centered') {
      throw new Error('Invalid CTA page format');
    }

    // Convert the new layout-focused format to the existing PDFContent format
    const sections = [
      {
        title: parsed.introduction_page.title,
        content: parsed.introduction_page.content
      },
      ...parsed.toolkit_sections.map((section: any) => ({
        title: section.title,
        content: formatLayoutSectionContent(section)
      }))
    ];

    // Return the structured content for better PDF formatting
    return {
      founder_intro: parsed.founder_intro,
      title: parsed.title_page.title,
      introduction: parsed.title_page.subtitle,
      sections: sections,
      cta: parsed.cta_page.content,
      // Add the full structured content for advanced PDF rendering
      structured_content: parsed
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
      throw new Error('Request timed out. The content generation is taking longer than expected. Please try again.');
    } else if (err.message.includes('JSON')) {
      throw new Error('Failed to process the PDF content. Please try again.');
    }

    throw new Error(`Failed to generate PDF content: ${err.message}`);
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
      model: 'gpt-4',
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
      model: 'gpt-4',
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

export async function generateFinalCampaign(input: CampaignInput, outline: ContentOutline): Promise<CampaignOutput> {
  const client = getOpenAIClient();

  try {
    // Generate content sequentially instead of in parallel for better error handling
    console.log('Starting PDF content generation...');
    const pdf_content = await generatePdfContent(input, outline).catch(err => {
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

// Function to regenerate case studies for existing campaigns
export async function regenerateCaseStudiesForCampaign(campaign: any): Promise<any> {
  const client = getOpenAIClient();

  try {
    // Handle different campaign content formats
    let existingContent = campaign.lead_magnet_content?.structured_content;
    
    // If no structured_content, try to create it from the old format
    if (!existingContent) {
      console.log('No structured_content found, attempting to convert from old format...');
      
      // Check if we have the old format content
      if (campaign.lead_magnet_content) {
        // Create a basic structured content from the old format
        existingContent = {
          title_page: {
            layout: "centered",
            title: campaign.lead_magnet_title || "Lead Magnet Guide",
            subtitle: "A comprehensive guide to help you achieve your goals"
          },
          introduction_page: {
            layout: "filled",
            title: "Why This Guide Will Help You Succeed",
            content: typeof campaign.lead_magnet_content === 'string' 
              ? campaign.lead_magnet_content 
              : JSON.stringify(campaign.lead_magnet_content)
          },
          toolkit_sections: [
            {
              layout: "filled",
              type: "pros_and_cons_list",
              title: "Strategy Analysis",
              content: {
                items: [
                  {
                    method_name: "Primary Strategy",
                    pros: "Effective and proven approach",
                    cons: "Requires consistent effort",
                    case_study: "This will be generated by AI"
                  }
                ]
              }
            },
            {
              layout: "filled", 
              type: "checklist",
              title: "Implementation Checklist",
              content: {
                phases: [
                  {
                    phase_title: "Phase 1: Preparation",
                    items: ["1.1 Review the strategy", "1.2 Gather resources", "1.3 Set timeline"]
                  }
                ],
                case_study: "This will be generated by AI"
              }
            },
            {
              layout: "filled",
              type: "scripts", 
              title: "Communication Scripts",
              content: {
                scenarios: [
                  {
                    trigger: "Common objection or question",
                    response: "Professional response",
                    explanation: "Why this works",
                    case_study: "This will be generated by AI"
                  }
                ]
              }
            }
          ],
          cta_page: {
            layout: "centered",
            title: "Your Next Step",
            content: "Take action now to implement these strategies"
          }
        };
      } else {
        throw new Error('No campaign content found to work with');
      }
    }

    if (!existingContent.toolkit_sections) {
      throw new Error('No toolkit sections found in campaign content');
    }

    const prompt = `You are an expert content strategist. Your task is to add case studies to existing lead magnet content.

EXISTING CONTENT:
${JSON.stringify(existingContent, null, 2)}

INSTRUCTIONS:
1. Keep ALL existing content exactly as is
2. Add case_study fields to the following sections:
   - Each item in pros_and_cons_list sections
   - Each checklist section
   - Each scenario in scripts sections

3. Case study requirements:
   - 2-3 sentences each
   - Include specific numbers and outcomes
   - Real-world context with measurable results
   - Show the strategy/script in action

4. Return the EXACT same JSON structure with case studies added

EXAMPLE CASE STUDY FORMAT:
"case_study": "Sarah, a fitness coach, tested Instagram vs. Facebook ads for her online program. Instagram brought in 40% more qualified leads at half the cost, but required daily content creation. She now focuses 80% of her efforts on Instagram while using Facebook for retargeting."

Return the complete JSON with case studies added to all sections.`;

    const res = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert content strategist. Add case studies to existing content while preserving all original content exactly. Output strictly valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    if (!res.choices?.[0]?.message?.content) {
      throw new Error('Empty response received from OpenAI API');
    }

    const content = res.choices[0].message.content;
    const updatedContent = JSON.parse(content);

    // Validate that case studies were added
    let caseStudiesAdded = 0;
    for (const section of updatedContent.toolkit_sections) {
      switch (section.type) {
        case 'pros_and_cons_list':
          for (const item of section.content.items) {
            if (item.case_study) caseStudiesAdded++;
          }
          break;
        case 'checklist':
          if (section.content.case_study) caseStudiesAdded++;
          break;
        case 'scripts':
          for (const scenario of section.content.scenarios) {
            if (scenario.case_study) caseStudiesAdded++;
          }
          break;
      }
    }

    console.log(`Added ${caseStudiesAdded} case studies to campaign ${campaign.id}`);

    return {
      ...campaign,
      lead_magnet_content: {
        ...campaign.lead_magnet_content,
        structured_content: updatedContent
      }
    };

  } catch (err: any) {
    console.error('Error regenerating case studies:', err);
    throw new Error(`Failed to regenerate case studies: ${err.message}`);
  }
}