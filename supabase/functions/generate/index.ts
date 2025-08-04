import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

    const prompt = `

Generate a complete lead magnet campaign with the following components:

1. PDF Content:
    - Title page with compelling headline
    - Introduction that hooks the reader
    - 3 key solutions or strategies
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

Return JSON in this exact format:
{
  "pdf_content": {
    "title_page": {
      "title": "... (${input.selected_format || 'PDF'})",
      "subtitle": "..."
    },
    "introduction": "...",
    "key_solutions": {
      "solution1": "...",
      "solution2": "...",
      "solution3": "..."
    },
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
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
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

    const campaignOutput = JSON.parse(content);

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