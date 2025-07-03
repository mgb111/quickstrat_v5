import OpenAI from 'openai';
import { CampaignInput, CampaignOutput } from '../types';

// Check if API key is available
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey || apiKey === 'your_openai_api_key') {
  console.warn('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
}

const openai = apiKey && apiKey !== 'your_openai_api_key' ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
}) : null;

export async function generateCampaign(input: CampaignInput): Promise<CampaignOutput> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file with your actual API key.');
  }

const prompt = `
You are a senior direct response copywriter and lead generation strategist.

Your task is to generate a complete lead magnet campaign that turns one customer pain into a high-converting, done-for-you funnel. Match your tone, structure, and content to the user's business and audience.

Use bold, specific, persuasive, and actionable language.

---

Inputs:
- Niche: ${input.niche}
- Customer Pain Point: ${input.pain_point}
- Desired Outcome: ${input.desired_outcome}
- Brand Name: ${input.brand_name}
- Tone: ${input.tone}
- Target Audience: ${input.target_audience}

Use the user's tone and target audience input to shape your copy. Adjust complexity, phrasing, and urgency level based on who they are speaking to.

---

Return the following JSON:

{
"pdf_content": {

"title_page": {
"title": "Create a hyper-specific, quantifiable headline that promises to solve one single, painful problem. It must be a tangible outcome the reader can achieve with the guide alone. Avoid hype and vague transformations. Example: 'The 5-Step Blueprint to Calculate Your VR Training ROI in Under 30 Minutes.' This must feel like a tool, not an advertisement.",
"subtitle": "Write a subtitle that specifies who this is for and what makes it immediately applicable. Answer the question: 'How does this solve my problem right now?' Focus on the practical nature of the guide. Example: 'A plug-and-play spreadsheet model for L&D leaders to prove the value of immersive learning to their CFO.'"
},

"introduction": "Write a concise, 8-10 sentence introduction that diagnoses a specific, costly problem. Use a sharp, relatable statistic or a one-sentence scenario to hook the reader. Directly state that this guide is a hands-on 'workshop-in-a-document.' Promise that by the end, they will have a finished, tangible asset, created from a powerful, expert-reviewed template. Crucially, this guide must provide this value *without* requiring our product. Build trust by teaching, not pitching. End by stating the specific, tangible outcome of the first section.",

"key_solutions": {
"solution1": "Title this section 'The Foundational Method: [Insert Action-Oriented Title Here]'. Generate a practical, step-by-step process that solves the core problem. As part of this process, generate an *illustrative checklist* with 5-7 generic but plausible items relevant to the user's provided industry. **You MUST preface this list with a clear, editable callout for the user that says:** '[EXPERT, REVIEW & EDIT]: The following checklist is a starting point. Please review, delete, and add your own proprietary items to make this list unique and valuable.' This section should feel like an actionable, editable first draft.",
"solution2": "Title this section 'The Implementation Blueprint: [Insert Tool/Template Name Here]'. Generate a second, complementary method as a text-based template or model (e.g., a sample email, a mini project plan). It should be logical but generic. Use a simple, powerful metaphor to explain the concept. **You MUST preface this template with the editable callout:** '[EXPERT, REVIEW & EDIT]: Use this sample as a guide. Modify it to match your specific, proven process.' Do NOT recommend a specific paid platform.",
"solution3": "Title this section 'The Expert Insight: [Insert Contrarian or Advanced Tactic Here]'. Generate a plausible-sounding, industry-relevant contrarian insight. It should start with a contrarian hook (e.g., 'Most teams believe X... but they're wrong because of Y'). **You MUST preface this insight with the editable callout:** '[EXPERT, REVIEW & EDIT]: This is a sample insight. Replace it with your own unique viewpoint to demonstrate your deep expertise and thought leadership.' The goal is to provide a strong example for the user to improve upon."
},

"actionable_takeaways": "Create a section titled 'Your First 7 Days: An Action Plan.' Present a numbered checklist of 6-8 steps designed to move the reader from theory to practice within one week. Start each step with a strong verb. The steps should be concrete actions based on the *sample* content provided in the guide (e.g., '1. Review and customize the checklist in 'The Foundational Method' with your own data.' '2. Adapt the sample project plan to fit your upcoming pilot program.'). This makes the guide's value immediate and undeniable.",

"cta": "Write a direct, respectful, 5-6 sentence final call to action. The goal is to move a qualified reader to a sales conversation, not another content piece. Bridge the value they just received (a powerful, editable first draft) to the value of the call. Start by affirming their new position of power: 'You now have a customized blueprint to build a business case for VR training.' Then, make a logical, low-friction offer: 'While this guide gives you the 'what' and the 'why,' a personalized demo will show you 'how' to implement it in a fraction of the time.' The offer should be for a specific, outcome-oriented meeting. End with a confident, non-pushy line that positions the call as the fastest path to their desired result."

}
  "landing_page": {
    "headline": "Hook with urgency or cost/time pain — be direct and outcome-oriented",
    "subheadline": "Describe the transformation or result the reader will get from reading the guide",
    "benefit_bullets": [
      "Include real benefits like saved time, money, better results — avoid buzzwords",
      "Make each bullet practical, not aspirational",
      "Bonus if you include a tool tip or metric in the copy"
    ],
    "cta_button_text": "Use a direct, low-friction CTA like 'Get the Guide Now' or 'Send It to Me'"
  },
  "social_posts": {
    "linkedin": "Begin with a pain stat or real-world frustration. Transition into your unique solution or insight. End with a strong CTA to get the guide.",
    "twitter": "Punchy one-liner that starts with pain or shock, then offers the guide as the solution. Keep it sharp and CTA-driven.",
    "instagram": [
      "Slide 1: Hook — bold pain question or stat",
      "Slide 2: Expand on the problem with one sentence",
      "Slide 3: Introduce a unique framework or win from the guide",
      "Slide 4: Share a quick stat, result, or tip",
      "Slide 5: CTA — Download your free guide now"
    ]
  }
}

---

Guidelines:
- Avoid fluff, passive voice, or generic advice
- Be specific, bold, and benefit-driven
- Make it worth trading an email for
- Output valid JSON only — no extra formatting, no explanation
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a conversion copywriter and strategist. Output strictly JSON as defined.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3500
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    const parsed = JSON.parse(content);
    return parsed;
  } catch (error: any) {
    console.error('OpenAI error:', error?.message || error);
    throw new Error('Failed to generate campaign content. Please try again.');
  }
}