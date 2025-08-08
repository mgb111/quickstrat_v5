import { supabase } from './supabase';
import { CampaignInput, LeadMagnetConcept, ContentOutline, CampaignOutput, LeadMagnetFormat } from '../types';

// Lightweight, server-safe AI service.
// - Concepts and outline are generated locally (no API key).
// - Final campaign is generated via Supabase Edge Function (server-side OpenAI).

export async function generateLeadMagnetConcepts(input: CampaignInput): Promise<LeadMagnetConcept[]> {
  const formatLabel = (input.selected_format || 'pdf') === 'pdf' ? 'Guide' : 'Diagnostic Quiz';
  const base = input.niche || 'Your Niche';
  return [0,1,2].map((i) => ({
    id: `concept-${i+1}`,
    title: `${formatLabel}: ${base} - Option ${i+1}`,
    description: `A high-value ${formatLabel.toLowerCase()} tailored for ${input.target_audience}.` ,
    value_proposition: `Specific, actionable value for ${input.target_audience}.` ,
    target_audience: input.target_audience,
    format: (input.selected_format || 'pdf') as LeadMagnetFormat
  }));
}

export async function generateContentOutline(input: CampaignInput, selected: LeadMagnetConcept): Promise<ContentOutline> {
  // Simple deterministic outline; avoids client-side API usage
  return {
    title: selected.title,
    introduction: `This ${selected.format === 'pdf' ? 'guide' : 'diagnostic'} is designed for ${input.target_audience} in ${input.niche}.`,
    core_points: [
      'Core Point 1: Problem framing and key context',
      'Core Point 2: Tactical steps or diagnostic question',
      'Core Point 3: Optimization or refinement',
      selected.format === 'interactive_quiz' ? 'Results Framework: Scoring to diagnosis mapping' : 'Case Study: Specific example with results'
    ],
    cta: `Get instant access to your ${selected.format === 'pdf' ? 'complete guide' : 'diagnosis and action plan'}.`
  };
}

export async function generateFinalCampaign(input: CampaignInput, outline: ContentOutline): Promise<CampaignOutput> {
  // Call the secure Supabase Edge Function which holds OPENAI_API_KEY on server
  const { data, error } = await supabase.functions.invoke('generate', {
    body: {
      input: {
        // Pass through all expected fields for the edge function
        name: (input as any).name || '',
        brand_name: input.brand_name,
        target_audience: input.target_audience,
        niche: input.niche,
        problem_statement: (input as any).problem_statement || (input as any).pain_point || '',
        desired_outcome: input.desired_outcome,
        tone: input.tone || 'professional',
        position: (input as any).position || '',
        selected_format: input.selected_format || 'pdf'
      }
    }
  });

  if (error) {
    throw new Error(error.message || 'Failed to generate campaign');
  }

  return data as CampaignOutput;
}


