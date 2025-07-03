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

    const prompt = `You are a lead generation expert and persuasive copywriter.

Your task is to turn a single customer problem into a complete lead magnet campaign. Create the following:

1. PDF Lead Magnet (5 pages max):
    - Title Page (title + subtitle)
    - Introduction
    - 3 Key Solutions or Insights
    - Actionable Takeaways
    - CTA

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

Return JSON in this exact format:
{
  "pdf_content": {
    "title_page": {
      "title": "...",
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
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a lead generation expert. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
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