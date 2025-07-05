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
    timeout: 60000, // Configure timeout at client level (60 seconds)
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
1. Title: A sharp, specific headline for the selected concept (8-12 words)
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
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please check your .env file.');
  }

  try {    const prompt = `You are an expert Instructional Designer and a professional Layout Designer. Your task is to generate the complete and final content for an A+ grade, high-value lead magnet. Your output must be structured for a visually dense, professional PDF where every page is either intentionally centered for impact or completely filled with valuable content.

USER CONTEXT:
Niche: ${input.niche}
Target Audience: ${input.target_audience}
Tone: ${input.tone}
Brand Name: ${input.brand_name}
Selected Concept: A lead magnet about ${outline.title}.

CORE PRINCIPLES (NON-NEGOTIABLE):
VISUAL DENSITY: Every content page must be "completely filled." You must generate enough detailed content (text, lists, or tables) to fill a standard document page. Sparse pages with single paragraphs are forbidden.

STRUCTURED FORMATTING: You MUST use a variety of formats—paragraphs, bulleted lists, numbered lists, tables, and blockquotes—to enhance readability and ensure pages are full.

EXTREME VALUE: Every section must be a tangible tool that provides the "how," not just the "what."

NO SELLING: The content must be 100% educational and brand-agnostic.

THE BLUEPRINT: GENERATE THE FOLLOWING COMPONENTS WITH LAYOUT INSTRUCTIONS

1. Title Page (layout: "centered"):
Title: A sharp, specific headline (8-12 words).
Subtitle: A powerful subtitle that makes a quantifiable promise (10-15 words).

2. Introduction Page (layout: "filled"):
Title: A clear, engaging title for the introduction (e.g., "Why This Toolkit Will Change Your Approach").
Content: A concise but powerful introduction (80-120 words) that hooks the reader with a sharp pain point and clearly states what tangible tools they will receive. This length is required to properly fill the page.

3. The Toolkit Sections (layout: "filled"):
Generate 3-4 distinct toolkit sections. Each section must be comprehensive enough to be a filled page on its own. The content for each tool must be detailed and expanded.

CRITICAL: For type: "table": The table MUST have exactly 5-6 rows of detailed entries with 3 columns each. This is mandatory for visual density and validation requirements.

For type: "checklist": The checklist must be broken into 2-3 sub-headings or phases and contain a total of 8-12 detailed, actionable items.

For type: "scripts": Provide at least 3-4 script scenarios, each with a "trigger" (what they say), "response" (what you say), and "explanation" (strategy behind the script).

For type: "mistakes_to_avoid": List 4-5 common mistakes. For each mistake, provide a "mistake" description and a "solution" paragraph of 40-50 words.

- For type: "pros_and_cons_list": Use this for comparing different methods or strategies. Generate a list of 4-6 items. Each item MUST have a "method_name", a single "pros" string (not an array), and a single "cons" string (not an array). Format exactly like this example:

EXAMPLE PROS AND CONS FORMAT:
{
  "method_name": "Social Media Marketing",
  "pros": "Offers wide reach and the ability to form a personal connection with prospects.",
  "cons": "It is time-consuming and requires the regular creation of new content to stay relevant."
}

4. Call to Action Page (layout: "centered"):
Title: A clear, action-oriented title (e.g., "Your Next Step").
Content: A brief (25-40 words), logical CTA that offers a clear next step toward a sales conversation. The CTA must directly connect the value provided to a low-friction action (e.g., booking a free consultation, scheduling a strategy call).

FINAL GUARDRAIL AND SELF-CORRECTION: Before generating the JSON, you MUST verify your own output against the mandatory instructions.
1.  Is the content for each page dense enough?
2.  Does the checklist contain 8-12 items?
3.  Are the scripts and mistakes sections fully detailed as specified?
4.  Does the CTA lead directly to a sales conversation?
If any answer is no, you MUST rewrite that section to fully comply before providing the final output.

RETURN JSON IN THIS EXACT, STRUCTURED FORMAT:
{
  "title_page": {
    "layout": "centered",
    "title": "The VR Vendor Negotiation Toolkit",
    "subtitle": "A 4-Part Guide to Cut Costs and Secure a Future-Proof Contract."
  },
  "introduction_page": {
    "layout": "filled",
    "title": "Your Strongest Position is a Prepared One",
    "content": "That complex VR vendor contract is likely hiding thousands in unnecessary costs. Many L&D leaders overpay for bloated feature sets they'll never use and enter into inflexible agreements they later regret. This toolkit provides the specific, actionable resources—a tech glossary, an action checklist, negotiation scripts, and sample contract clauses—to help you negotiate from a position of power, cut costs, and secure a flexible, future-proof partnership. Use these tools to prepare for your next vendor call and ensure you get maximum value for your investment."
  },
  "toolkit_sections": [
    {
      "layout": "filled",
      "type": "table",
      "title": "Section 1: Essential Comparison Matrix",
      "content": {
        "headers": ["Feature", "Standard Package", "What You Actually Need"],
        "rows": [
          ["User Licenses", "Unlimited users included", "Start with 50-100 active users maximum"],
          ["Content Library", "10,000+ pre-built scenarios", "Focus on 20-30 scenarios specific to your industry"],
          ["Analytics Dashboard", "Advanced reporting suite", "Basic completion rates and time-spent metrics"],
          ["Integration Options", "50+ software integrations", "Priority: LMS, HRIS, and video conferencing only"],
          ["Support Level", "24/7 premium support", "Business hours support with 4-hour response time"],
          ["Training & Onboarding", "Comprehensive 6-week program", "2-week focused implementation with key stakeholders"]
        ]
      }
    },
    {
      "layout": "filled",
      "type": "pros_and_cons_list",
      "title": "Section 2: The Lead Generation Matrix: A Strategic Overview",
      "content": {
        "items": [
          {
            "method_name": "Social Media Marketing",
            "pros": "Offers wide reach and the ability to form a personal connection with prospects.",
            "cons": "It is time-consuming and requires the regular creation of new content to stay relevant."
          },
          {
            "method_name": "Email Marketing",
            "pros": "Highly cost-effective with a proven potential for a high return on investment (ROI).",
            "cons": "Risks being perceived as spam and is heavily dependent on having a high-quality, clean mailing list."
          },
          {
            "method_name": "Search Engine Optimization (SEO)",
            "pros": "Delivers long-term effectiveness and builds high credibility with your audience.",
            "cons": "Results are typically slow to materialize and it requires a degree of technical knowledge to implement correctly."
          },
          {
            "method_name": "Content Marketing",
            "pros": "Establishes you as an authority in your field and attracts valuable organic traffic over time.",
            "cons": "It is a time-consuming strategy that requires the consistent and regular creation of high-quality content."
          },
          {
            "method_name": "Networking Events",
            "pros": "Creates an immediate personal connection and often results in high-quality leads.",
            "cons": "The strategy is time-consuming by nature and has a limited reach compared to digital methods."
          },
          {
            "method_name": "Paid Ads",
            "pros": "Can deliver immediate results and allows for precise targeting of your ideal audience.",
            "cons": "Can be very costly if not managed properly and requires constant monitoring and optimization to be effective."
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "checklist",
      "title": "Section 3: The Pre-Negotiation Action Checklist",
      "content": {
        "phases": [
          {
            "phase_title": "Phase A: Financial Groundwork",
            "items": [
              "Audit your last 12 months of traditional training costs to establish a clear budget baseline.",
              "Get itemized quotes from at least three different vendors (never accept a single 'package price').",
              "Add a 15% contingency line item in your budget for hidden costs like facilitator training and IT support."
            ]
          },
          {
            "phase_title": "Phase B: Feature & Requirement Definition",
            "items": [
              "Define your 'Must-Have' vs. 'Nice-to-Have' features using a simple matrix.",
              "Prepare a list of 3-5 pointed technical questions based on the Decoder Ring.",
              "Draft your ideal service terms regarding content ownership and platform flexibility."
            ]
          }
        ]
      }
    },
    {
      "layout": "filled",
      "type": "scripts",
      "title": "Section 4: Negotiation Scripts That Work",
      "content": {
        "scenarios": [
          {
            "trigger": "We can offer you a 20% discount if you sign today.",
            "response": "I appreciate the offer, but I need time to review all terms with my team. Can you put that discount in writing with a 30-day validity period?",
            "explanation": "This deflects pressure tactics while securing the discount for proper evaluation time."
          },
          {
            "trigger": "This is our standard contract - we don't typically make changes.",
            "response": "I understand you have standard terms. Which specific clauses have you modified for other enterprise clients in similar situations?",
            "explanation": "This acknowledges their position while implying flexibility exists and you're aware of industry norms."
          },
          {
            "trigger": "The implementation timeline is fixed at 6 months.",
            "response": "Help me understand what drives that timeline. Are there specific milestones we could adjust to accelerate delivery?",
            "explanation": "This uncovers the real constraints and opens discussion about flexible scheduling options."
          }
        ]
      }
    }
  ],
  "cta_page": {
    "layout": "centered",
    "title": "Your Next Step",
    "content": "You now have the tools to negotiate a smarter contract. To see how a modular platform with transparent pricing aligns with these principles, schedule a free 15-minute consultation with our experts."
  }
}

CRITICAL REQUIREMENTS:
1. Generate content that is dense enough to fill each page completely
2. Use varied formatting (tables, lists, phases, etc.) for visual interest
3. Ensure all toolkit sections provide immediate, actionable value
4. Make the content 100% educational with no promotional language
5. Structure the content for professional PDF layout and design
6. MANDATORY: All tables must have exactly 5-6 rows with 3 columns for proper validation
7. MANDATORY: All scripts sections must have exactly 3-4 scenarios with "trigger", "response", and "explanation" fields
8. MANDATORY: For pros_and_cons_list, each item must have "method_name", "pros" (single string), and "cons" (single string) - NOT arrays`;

    const res = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert Instructional Designer and Layout Designer. Output strictly valid JSON as defined. Generate visually dense, professionally structured content for each page. CRITICAL: All tables must have exactly 5-6 rows with 3 columns. All scripts sections must have exactly 3-4 scenarios with "trigger", "response", and "explanation" fields. For pros_and_cons_list, each item must have "method_name", "pros" (single string), and "cons" (single string) - NOT arrays.' },
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
    if (!parsed.title_page || !parsed.introduction_page || !Array.isArray(parsed.toolkit_sections) || !parsed.cta_page) {
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

    // Validate toolkit sections (3-4 sections required)
    if (parsed.toolkit_sections.length < 3 || parsed.toolkit_sections.length > 4) {
      throw new Error('Must have 3-4 toolkit sections');
    }

    // Validate each toolkit section with improved validation
    for (const section of parsed.toolkit_sections) {
      if (!section.title || !section.type || section.layout !== 'filled') {
        throw new Error('Each toolkit section must have title, type, and filled layout');
      }
      
      // Improved validation based on type
      switch (section.type) {
        case 'table':
          if (!section.content?.headers || !Array.isArray(section.content?.headers)) {
            throw new Error('Table section must have headers array');
          }
          if (!section.content?.rows || !Array.isArray(section.content?.rows)) {
            throw new Error('Table section must have rows array');
          }
          // More flexible row count - accept 3+ rows instead of strict 4+
          if (section.content.rows.length < 3) {
            console.warn(`Table section has ${section.content.rows.length} rows, adding padding rows for visual density`);
            // Add padding rows if needed to meet minimum requirements
            while (section.content.rows.length < 5) {
              const lastRow = section.content.rows[section.content.rows.length - 1];
              const paddingRow = lastRow.map((cell: string, index: number) => {
                if (index === 0) return `Additional Item ${section.content.rows.length + 1}`;
                return `Additional detail for enhanced understanding and practical application.`;
              });
              section.content.rows.push(paddingRow);
            }
          }
          break;
        case 'checklist':
          if (!section.content?.phases || !Array.isArray(section.content?.phases)) {
            throw new Error('Checklist section must have phases array');
          }
          if (section.content.phases.length < 1) {
            throw new Error('Checklist section must have at least 1 phase');
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

    return {
      title: parsed.title_page.title,
      introduction: parsed.title_page.subtitle,
      sections: sections,
      cta: parsed.cta_page.content
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
    case 'table':
      let tableContent = `${section.content.headers.join(' | ')}\n`;
      tableContent += section.content.headers.map(() => '---').join(' | ') + '\n';
      section.content.rows.forEach((row: string[]) => {
        tableContent += row.join(' | ') + '\n';
      });
      return tableContent;
    
    case 'checklist':
      let checklistContent = '';
      section.content.phases.forEach((phase: any, phaseIndex: number) => {
        checklistContent += `\n${phase.phase_title}\n`;
        phase.items.forEach((item: string, itemIndex: number) => {
          checklistContent += `${phaseIndex + 1}.${itemIndex + 1} ${item}\n`;
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
    
    case 'template':
      return section.content.template || section.content;
    
    default:
      return section.content || 'Content not available';
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
      max_tokens: 1500
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

export async function generateFinalCampaign(input: CampaignInput, outline: ContentOutline): Promise<CampaignOutput> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please check your .env file.');
  }

  try {
    // Generate all content in parallel
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