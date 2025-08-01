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
  PDFCustomization
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

export async function generatePdfContent(input: CampaignInput, outline: ContentOutline, customization?: PDFCustomization): Promise<PDFContent> {
  const client = getOpenAIClient();

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const prompt = `You are an expert Instructional Designer and a professional Layout Designer. Your task is to generate the complete and final content for an A+ grade, high-value lead magnet. Your output must be structured for a visually dense, professional PDF where every page is either intentionally centered for impact or completely filled with valuable content.

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
    },
    {
      "phase_title": "Phase B: Vendor Evaluation", 
      "items": [
        "2.1 Compare various VR training platforms based on features and cost",
        "2.2 Evaluate the scalability and flexibility of each platform",
        "2.3 Consider the support and training provided by the vendor"
      ]
    },
    {
      "phase_title": "Phase C: Implementation and Monitoring",
      "items": [
        "3.1 Implement a pilot project to test the effectiveness of the chosen platform",
        "3.2 Measure the ROI of the VR training program", 
        "3.3 Iterate and adjust the program based on feedback and results"
      ]
    }
  ],
  "case_study": "TechCorp used this checklist to implement VR training for their sales team. They started with a pilot of 20 reps, saw a 35% improvement in sales performance, and then rolled it out company-wide, saving $200K in traditional training costs."
}

For type: "scripts": Provide at least 3-4 script scenarios, each with a "trigger" (what they say), "response" (what you say), "explanation" (strategy behind the script), and a "case_study" field with a detailed real-world example (2-3 sentences) showing the script in action with specific results. Include specific numbers, outcomes, and context to make it relatable. **If you do not provide at least 2 scenarios in the scripts section, you MUST rewrite and return the correct format.**

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
6. Have you included at least one real-life example or micro-case study per strategy or script?
7. Have you included a plug-and-play template or swipe file where possible?
If any answer is no, you MUST rewrite that section to fully comply before providing the final output.

RETURN JSON IN THIS EXACT, STRUCTURED FORMAT:
{
  "founder_intro": "...",
  "title_page": {
    "layout": "centered",
    "title": "The VR Vendor Negotiation Toolkit",
    "subtitle": "A 3-Part Guide to Cut Costs and Secure a Future-Proof Contract."
  },
  "introduction_page": {
    "layout": "filled",
    "title": "Your Strongest Position is a Prepared One",
    "content": "That complex VR vendor contract is likely hiding thousands in unnecessary costs. Many L&D leaders overpay for bloated feature sets they'll never use and enter into inflexible agreements they later regret. This toolkit provides the specific, actionable resources—a tech glossary, an action checklist, negotiation scripts, and sample contract clauses—to help you negotiate from a position of power, cut costs, and secure a flexible, future-proof partnership. Use these tools to prepare for your next vendor call and ensure you get maximum value for your investment."
  },
  "toolkit_sections": [
    {
      "layout": "filled",
      "type": "pros_and_cons_list",
      "title": "Section 1: Social Media Marketing Strategies Overview",
      "content": {
        "items": [
          {
            "method_name": "Paid Advertising",
            "pros": "Quick results, precise targeting, scalable.",
            "cons": "Can be expensive, requires constant monitoring and adjustment.",
            "case_study": "Mike, a B2B consultant, spent $2,000 on LinkedIn ads targeting CFOs. He generated 15 qualified leads in 30 days, with 3 converting to $15K clients. The key was testing 5 different ad copy variations and focusing on pain points rather than features.",
            "template": "A plug-and-play template or swipe file (if applicable)"
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "checklist",
      "title": "Section 2: Cost-Effectiveness Checklist",
      "content": {
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
        "case_study": "TechCorp used this checklist to implement VR training for their sales team. They started with a pilot of 20 reps, saw a 35% improvement in sales performance, and then rolled it out company-wide, saving $200K in traditional training costs.",
        "template": "A plug-and-play template or swipe file (if applicable)"
      }
    },
    {
      "layout": "filled",
      "type": "scripts",
      "title": "Section 3: Negotiation Scripts That Work",
      "content": {
        "scenarios": [
          {
            "trigger": "We can offer you a 20% discount if you sign today.",
            "response": "I appreciate the offer, but I need time to review all terms with my team. Can you put that discount in writing with a 30-day validity period?",
            "explanation": "This deflects pressure tactics while securing the discount for proper evaluation time.",
            "case_study": "Lisa, a procurement manager, used this script when negotiating with a software vendor. She secured a 20% discount that was valid for 45 days, giving her team time to evaluate the solution. The vendor later increased the discount to 25% to close the deal.",
            "template": "A plug-and-play template or swipe file (if applicable)"
          }
        ]
      }
    }
  ],
  "cta_page": {
    "layout": "centered",
    "title": "Your Next Step",
    "content": "A bold, urgent, benefit-driven call-to-action tailored to the brand and lead magnet topic."
  }
}`;

      const res = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert Instructional Designer and Layout Designer. Output strictly valid JSON as defined. Generate visually dense, professionally structured content for each page. CRITICAL: Generate EXACTLY 3 toolkit sections. All scripts sections must have exactly 3-4 scenarios with "trigger", "response", and "explanation" fields. For pros_and_cons_list, each item must have "method_name", "pros" (single string), and "cons" (single string) - NOT arrays. For checklist, use phases with numbered items like "1.1", "2.1", etc. DO NOT create both checklist and step-by-step guide to avoid redundancy. Use the exact CTA text provided.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4500
      });

      if (!res.choices?.[0]?.message?.content) {
        throw new Error('Empty response received from OpenAI API');
      }

      const content = res.choices[0].message.content;
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (err) {
        throw new Error('Failed to parse JSON from OpenAI response');
      }

      // Fallback: If a checklist or scripts section's content is a flat array, wrap it in a simple object
      if (Array.isArray(parsed.toolkit_sections)) {
        parsed.toolkit_sections = parsed.toolkit_sections.map((section: any) => {
          if ((section.type === 'checklist' || section.type === 'scripts') && Array.isArray(section.content)) {
            return {
              ...section,
              content: { items: section.content }
            };
          }
          return section;
        });
      }

      // Require all main fields and at least 2 toolkit sections
      if (!parsed.title_page || !parsed.introduction_page || !Array.isArray(parsed.toolkit_sections) || !parsed.cta_page) {
        throw new Error('Invalid response format from OpenAI API - missing required pages');
      }
      if (parsed.toolkit_sections.length < 2) {
        throw new Error('Must have at least 2 toolkit sections');
      }
      // Require at least 2 items/scenarios in each toolkit section
      let scriptsSectionError = false;
      for (const section of parsed.toolkit_sections) {
        if (section.type === 'checklist' && section.content?.phases && Array.isArray(section.content.phases)) {
          const totalItems = section.content.phases.reduce((sum: number, phase: any) => sum + (Array.isArray(phase.items) ? phase.items.length : 0), 0);
          if (totalItems < 2) throw new Error('Checklist section must have at least 2 items');
        }
        if (section.type === 'scripts' && section.content?.scenarios && Array.isArray(section.content.scenarios)) {
          if (section.content.scenarios.length < 2) scriptsSectionError = true;
        }
        if (section.type === 'pros_and_cons_list' && section.content?.items && Array.isArray(section.content.items)) {
          if (section.content.items.length < 2) throw new Error('Pros and cons section must have at least 2 items');
        }
      }

      // If scripts section error and this is the last attempt, auto-duplicate the scenario
      if (scriptsSectionError && attempt === 3) {
        parsed.toolkit_sections = parsed.toolkit_sections.map((section: any) => {
          if (section.type === 'scripts' && section.content?.scenarios && section.content.scenarios.length === 1) {
            // Duplicate the scenario to make 2
            section.content.scenarios.push({ ...section.content.scenarios[0] });
          }
          return section;
        });
      } else if (scriptsSectionError) {
        // Retry if not last attempt
        throw new Error('Scripts section must have at least 2 scenarios');
      }

      // Return the structured content for better PDF formatting
      return {
        founder_intro: parsed.founder_intro,
        title: parsed.title_page.title,
        introduction: parsed.title_page.subtitle,
        sections: [
          {
            title: parsed.introduction_page.title,
            content: parsed.introduction_page.content
          },
          ...parsed.toolkit_sections.map((section: any) => ({
            title: section.title,
            content: typeof section.content === 'string' ? section.content : JSON.stringify(section.content)
          }))
        ],
        cta: parsed.cta_page.content,
        structured_content: parsed,
        founderName: input.name || '',
        brandName: input.brand_name || '',
        problemStatement: input.problem_statement || '',
        desiredOutcome: input.desired_outcome || '',
        // Add customization fields
        ctaText: customization?.ctaText || parsed.cta_page.content,
        mainAction: customization?.mainAction || 'Book a Free Strategy Call',
        bookingLink: customization?.bookingLink || '',
        website: customization?.website || '',
        supportEmail: customization?.supportEmail || '',
        logo: customization?.logo || '',
        primaryColor: customization?.primaryColor || '#1a365d',
        secondaryColor: customization?.secondaryColor || '#4a90e2',
        font: customization?.font || 'Inter'
      };
    } catch (err: any) {
      const retriable =
        err.message?.includes('timeout') ||
        err.message?.includes('Empty response') ||
        err.message?.includes('JSON') ||
        err.message?.includes('Invalid response format');
      if (attempt < 3 && retriable) {
        console.warn(`PDF generation failed (attempt ${attempt}): ${err.message}. Retrying...`);
        continue;
      }
      throw err;
    }
  }
  throw new Error('Failed to generate PDF content after 3 attempts.');
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

export async function generateFinalCampaign(input: CampaignInput, outline: ContentOutline, customization?: PDFCustomization): Promise<CampaignOutput> {
  const client = getOpenAIClient();

  try {
    // Generate content sequentially instead of in parallel for better error handling
    console.log('Starting PDF content generation...');
    const pdf_content = await generatePdfContent(input, outline, customization).catch(err => {
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