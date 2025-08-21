import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Extract the first valid JSON object/array from an LLM response that may be wrapped in
// markdown code fences or contain extra prose.
function extractJson(content: string): string {
  if (!content) return '{}';
  let text = content.trim();
  // Remove fenced code blocks like ```json ... ``` or ``` ... ```
  text = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, '$1').trim();
  // Remove stray single backticks
  text = text.replace(/`+/g, '').trim();
  // If starts with { or [, try as-is
  if (text.startsWith('{') || text.startsWith('[')) return text;
  // Else extract first JSON object/array
  const obj = text.match(/\{[\s\S]*\}/);
  const arr = text.match(/\[[\s\S]*\]/);
  return (obj?.[0] || arr?.[0] || '{}').trim();
}

interface CampaignInput {
  niche: string;
  pain_point: string;
  desired_outcome: string;
  brand_name: string;
  tone: string;
  target_audience: string;
  selected_format?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input }: { input: CampaignInput } = await req.json();
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const isQuiz = (input.selected_format || 'pdf') === 'interactive_quiz';
    const prompt = `

Generate a complete lead magnet campaign with the following components:

1. PDF Content:
    - Title page with compelling headline
    - Introduction that hooks the reader
    - ${isQuiz ? 'Include a structured_content.quiz_content payload (see format below) with EXACTLY 10 questions and scoring' : '3 key solutions or strategies'}
    - Actionable takeaways
    - Strong call-to-action

2. Landing Page Copy:
    - Headline
    - Subheadline
    - 3 benefit bullets
    - CTA button text

3. 3 Social Media Posts:
    - LinkedIn: problem → solution → CTA
    - X (Twitter): short, hook-heavy
    - Instagram (carousel-style): problem → tension → benefit → CTA

User inputs:
- Niche: ${input.niche}
- Customer pain: ${input.pain_point}
- Desired outcome: ${input.desired_outcome}
- Brand name: ${input.brand_name}
- Tone: ${input.tone}
- Target audience: ${input.target_audience}
- Format: ${input.selected_format || 'PDF'}

STRICTLY return JSON as described. For interactive_quiz, you MUST include quiz_content exactly as specified.

Return JSON in this exact format:
{
  "pdf_content": {
    "title_page": {
      "title": "... (${input.selected_format || 'PDF'})",
      "subtitle": "..."
    },
    "introduction": "...",
    ${isQuiz ? `"structured_content": {
      "title_page": { "title": "...", "subtitle": "10-Question Diagnostic to Identify Your Core Challenges" },
      "quiz_content": {
        "title": "Your Diagnostic Checklist",
        "description": "Answer each question honestly to get your personalized diagnosis and action plan.",
        "questions": [
          ${Array.from({ length: 10 }).map((_, i) => `{
            "id": ${i + 1},
            "question": "[SPECIFIC QUESTION ${i + 1} tailored to ${input.niche}/${input.pain_point}]",
            "options": [
              { "id": "A", "text": "Option A", "score": { "awareness": 1, "implementation": 0, "optimization": 0, "strategy": 0 } },
              { "id": "B", "text": "Option B", "score": { "awareness": 1, "implementation": 1, "optimization": 0, "strategy": 0 } },
              { "id": "C", "text": "Option C", "score": { "awareness": 1, "implementation": 1, "optimization": 1, "strategy": 0 } },
              { "id": "D", "text": "Option D", "score": { "awareness": 1, "implementation": 1, "optimization": 1, "strategy": 1 } }
            ],
            "explanation": "Why this question matters"
          }`).join(',')}
        ],
        "results": [
          {
            "category": "Foundation Builder",
            "description": "You're at the foundation stage.",
            "score_range": { "min": 0, "max": 15 },
            "symptoms": ["Limited understanding"],
            "action_steps": ["Start fundamentals"],
            "timeline": "4 weeks",
            "success_metrics": ["Basics implemented"],
            "recommendations": ["Use simple templates"]
          },
          {
            "category": "Implementation Specialist",
            "description": "You need consistent implementation.",
            "score_range": { "min": 16, "max": 25 },
            "symptoms": ["Inconsistent execution"],
            "action_steps": ["Systematize execution"],
            "timeline": "3-4 weeks",
            "success_metrics": ["Consistency achieved"],
            "recommendations": ["Frameworks and checklists"]
          },
          {
            "category": "Optimization Expert",
            "description": "You are ready to optimize.",
            "score_range": { "min": 26, "max": 35 },
            "symptoms": ["Ready to refine"],
            "action_steps": ["Apply optimization"],
            "timeline": "2-3 weeks",
            "success_metrics": ["Improved metrics"],
            "recommendations": ["Advanced techniques"]
          },
          {
            "category": "Strategic Master",
            "description": "You are at strategic mastery.",
            "score_range": { "min": 36, "max": 40 },
            "symptoms": ["Advanced skills"],
            "action_steps": ["Lead strategically"],
            "timeline": "2-3 weeks",
            "success_metrics": ["Leadership position"],
            "recommendations": ["Innovate and mentor"]
          }
        ]
      }
    },` : `"key_solutions": { "solution1": "...", "solution2": "...", "solution3": "..." },`}
    "actionable_takeaways": "...",
    "cta": "..."
  },
  "landing_page": {
    "headline": "...",
    "subheadline": "...",
    "benefit_bullets": ["...", "...", "..."],
    "cta_button_text": "..."
  },
  "social_posts": {
    "linkedin": "...",
    "twitter": "...",
    "instagram": "..."
  }
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content creator who creates high-quality, actionable lead magnet content. Always return valid JSON.'
          },
          {
            role: 'user',
            content: `Generate a lead magnet based on the following input:
                
                Campaign Input:
                - Name: ${input.name}
                - Brand Name: ${input.brand_name}
                - Target Audience: ${input.target_audience}
                - Niche: ${input.niche}
                - Problem Statement: ${input.problem_statement}
                - Desired Outcome: ${input.desired_outcome}
                - Tone: ${input.tone}
                - Position: ${input.position}
                - Format: ${input.selected_format || 'PDF'}
                
                Return JSON in this exact format:
                {
                  "pdf_content": {
                    "title_page": {
                      "title": "${input.selected_format === 'pdf' ? '... (PDF)' : '...'}",
                      "subtitle": "..."
                    },
                    "founder_intro": {
                      "name": "${input.name}",
                      "title": "${input.position}",
                      "company": "${input.brand_name}",
                      "intro_text": "..."
                    },
                    "introduction": "...",
                    "sections": [
                      {
                        "title": "Section Title",
                        "content": "Section content"
                      }
                    ],
                    "cta": {
                      "title": "Call to Action",
                      "description": "CTA description",
                      "button_text": "Action Button"
                    },
                    "structured_content": {
                      "toolkit_sections": [
                        {
                          "title": "Toolkit Section",
                          "description": "Section description",
                          "items": [
                            {
                              "title": "Item Title",
                              "description": "Item description",
                              "type": "template"
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
                  }
                }`
              }
            ],
            temperature: 0.7,
            max_tokens: 4000
          })
        });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const cleaned = extractJson(content);
    const campaignOutput = JSON.parse(cleaned);

    return new Response(JSON.stringify(campaignOutput), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});