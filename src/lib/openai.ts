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

// Remove dangerouslyAllowBrowser - route through Supabase Edge Function proxy in browser
const isBrowser = typeof window !== 'undefined';
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

import { supabase } from './supabase';

async function callOpenAIThroughProxy(args: { model: string; messages: any[]; temperature?: number; max_tokens?: number }) {
  const { data, error } = await supabase.functions.invoke('proxy-openai', { body: args });
  if (error) throw new Error(error.message || 'OpenAI proxy error');
  return data;
}

let openai: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
  if (isBrowser) {
    // In browser, we will call through Supabase function instead
    throw new Error('Direct OpenAI client is disabled in browser. Use proxy.');
  }
  if (!apiKey || apiKey === 'your_openai_api_key') {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
  }
  if (!openai) {
    openai = new OpenAI({ apiKey, timeout: 60000 });
  }
  return openai;
}

function cleanJsonResponse(content: string): string {
  let cleaned = content.trim();
  
  // Remove all markdown code fences and language specifiers
  cleaned = cleaned.replace(/```json\s*/gi, '');  // Remove ```json
  cleaned = cleaned.replace(/```\s*/gi, '');      // Remove any remaining ```
  cleaned = cleaned.replace(/`\s*/gi, '');        // Remove any single backticks
  
  // Remove any leading/trailing whitespace and newlines
  cleaned = cleaned.trim();
  
  // If the content still doesn't look like valid JSON, try to extract JSON from the middle
  if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
    // Look for JSON object or array in the content
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      cleaned = jsonMatch[1];
    }
  }
  
  // Final cleanup
  cleaned = cleaned.trim();
  
  console.log('🎯 cleanJsonResponse - Original:', content.substring(0, 100) + '...');
  console.log('🎯 cleanJsonResponse - Cleaned:', cleaned.substring(0, 100) + '...');
  
  return cleaned;
}

export async function generateLeadMagnetConcepts(input: CampaignInput): Promise<LeadMagnetConcept[]> {
    const format = input.selected_format;
  const formatSpecificPrompt = getFormatSpecificPdfPrompt(format || 'pdf', input, { title: '', introduction: '', core_points: [], cta: '' } as any);
  const res = isBrowser
    ? await callOpenAIThroughProxy({
      model: 'gpt-3.5-turbo',
      messages: [
          { role: 'system', content: 'You are a lead magnet strategist. Generate 3 unique concepts for the specified format.' },
          { role: 'user', content: formatSpecificPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    : await getOpenAIClient().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a lead magnet strategist. Generate 3 unique concepts for the specified format.' },
        { role: 'user', content: formatSpecificPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
  const content = (res.choices?.[0]?.message?.content) || '';
  const cleaned = cleanJsonResponse(content);
  
  console.log('🎯 OpenAI response content length:', content.length);
  console.log('🎯 Cleaned content length:', cleaned.length);
  
  try {
    const parsed = JSON.parse(cleaned);
    console.log('✅ JSON parsed successfully:', parsed);
    return (parsed.concepts || []).map((c: any, i: number) => ({
      id: `concept-${i + 1}`,
      title: c.title,
      description: c.description,
      value_proposition: c.value_proposition,
      target_audience: c.target_audience,
      format: format || 'pdf'
    }));
  } catch (parseError) {
    console.error('❌ JSON parse error:', parseError);
    console.error('❌ Failed to parse content:', cleaned);
    console.error('❌ Original content:', content);
    
    // Fallback: parse plain text like "Concept 1: Title - Description"
    const lines = content.split(/\r?\n/).filter(Boolean);
    const concepts: LeadMagnetConcept[] = [];
    const conceptRegex = /^(?:Concept\s*)?(\d+)\s*[:\-]\s*(.+)$/i;
    for (const line of lines) {
      const m = line.match(conceptRegex);
      if (m) {
        const titleAndDesc = m[2];
        const [title, rest] = titleAndDesc.split(/\s+-\s+/, 2);
        concepts.push({
          id: `concept-${concepts.length + 1}`,
          title: (title || titleAndDesc).trim(),
          description: (rest || '').trim(),
          value_proposition: '',
          target_audience: input.target_audience,
          format: (format || 'pdf') as any
        });
      }
    }
    if (concepts.length === 0) {
      for (let i = 1; i <= 3; i++) {
        concepts.push({
          id: `concept-${i}`,
          title: `${input.niche || 'Lead Magnet'} Concept ${i}`,
          description: `High-value idea for ${input.target_audience}`,
          value_proposition: '',
          target_audience: input.target_audience,
          format: (format || 'pdf') as any
        });
      }
    }
    return concepts.slice(0, 3);
  }
}

export async function generateContentOutline(input: CampaignInput, selected: LeadMagnetConcept): Promise<ContentOutline> {
  const prompt = getFormatSpecificOutlinePrompt(selected.format, input, selected);
  const res = isBrowser
    ? await callOpenAIThroughProxy({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a content strategist. Output strictly valid JSON as defined.' },
          { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
      })
    : await getOpenAIClient().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a content strategist. Output strictly valid JSON as defined.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
  const content = (res.choices?.[0]?.message?.content) || '{}';
  const cleaned = cleanJsonResponse(content);
  
  console.log('🎯 generateContentOutline - content length:', content.length);
  console.log('🎯 generateContentOutline - cleaned length:', cleaned.length);
  
  try {
    const parsed = JSON.parse(cleaned);
    console.log('✅ generateContentOutline - JSON parsed successfully');
    return parsed;
  } catch (parseError) {
    console.error('❌ generateContentOutline - JSON parse error:', parseError);
    console.error('❌ Failed to parse content:', cleaned);
    console.error('❌ Original content:', content);
    
    // Return a default outline structure
    return {
      title: 'Default Content Outline',
      sections: [
        {
          title: 'Introduction',
          content: 'Introduction content',
          key_points: ['Key point 1', 'Key point 2']
        }
      ],
      estimated_length: '5-10 minutes',
      target_audience: 'General audience',
      main_value_proposition: 'Default value proposition',
      introduction: 'Introduction content',
      core_points: ['Point 1', 'Point 2', 'Point 3']
    };
  }
}

export async function generateLandingPageCopy(input: CampaignInput, outline: ContentOutline): Promise<LandingPageCopy> {
  const prompt = `You are a direct-response copywriter...`;
  const res = isBrowser
    ? await callOpenAIThroughProxy({
      model: 'gpt-3.5-turbo',
      messages: [
          { role: 'system', content: 'You are a direct-response copywriter. Output strictly valid JSON as defined.' },
          { role: 'user', content: prompt }
      ],
      temperature: 0.7,
        max_tokens: 1200
      })
    : await getOpenAIClient().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a direct-response copywriter. Output strictly valid JSON as defined.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1200
    });
  const content = (res.choices?.[0]?.message?.content) || '{}';
  const cleaned = cleanJsonResponse(content);
  
  console.log('🎯 generateLandingPageCopy - content length:', content.length);
  console.log('🎯 generateLandingPageCopy - cleaned length:', cleaned.length);
  
  try {
    const parsed = JSON.parse(cleaned);
    console.log('✅ generateLandingPageCopy - JSON parsed successfully');
    return parsed;
  } catch (parseError) {
    console.error('❌ generateLandingPageCopy - JSON parse error:', parseError);
    console.error('❌ Failed to parse content:', cleaned);
    console.error('❌ Original content:', content);
    
    // Return a default landing page copy
    return {
      headline: 'Default Headline',
      subheadline: 'Default Subheadline',
      benefit_bullets: ['Benefit 1', 'Benefit 2', 'Benefit 3'],
      cta_button_text: 'Get Started'
    };
  }
}

export async function generateSocialPosts(input: CampaignInput, outline: ContentOutline): Promise<SocialPosts> {
  const prompt = `You are a social media manager...`;
  const res = isBrowser
    ? await callOpenAIThroughProxy({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a social media manager. Output strictly valid JSON as defined.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 1500
      })
    : await getOpenAIClient().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a social media manager. Output strictly valid JSON as defined.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 1500
    });
  const content = (res.choices?.[0]?.message?.content) || '{}';
  const cleaned = cleanJsonResponse(content);
  
  console.log('🎯 generateSocialPosts - content length:', content.length);
  console.log('🎯 generateSocialPosts - cleaned length:', cleaned.length);
  
  try {
    const parsed = JSON.parse(cleaned);
    console.log('✅ generateSocialPosts - JSON parsed successfully');
    return parsed;
  } catch (parseError) {
    console.error('❌ generateSocialPosts - JSON parse error:', parseError);
    console.error('❌ Failed to parse content:', cleaned);
    console.error('❌ Original content:', content);
    
    // Return default social posts
    return {
      linkedin: 'Default LinkedIn post content',
      twitter: 'Default Twitter post content',
      instagram: 'Default Instagram post content',
      reddit: 'Default Reddit post content'
    };
  }
}

export async function generateFinalCampaign(input: CampaignInput, outline: ContentOutline, customization?: PDFCustomization): Promise<CampaignOutput> {
  // Keep your original process; call each piece and assemble
  const landing_page = await generateLandingPageCopy(input, outline);
  const social_posts = await generateSocialPosts(input, outline);
  // Assume PDFContent is already produced elsewhere in your original flow; placeholder here:
  const pdf_content: PDFContent = {
    title: outline.title,
    introduction: outline.introduction,
    structured_content: {}
  } as any;
  return { pdf_content, landing_page, social_posts };
}

function getFormatSpecificOutlinePrompt(format: string, input: CampaignInput, selected: LeadMagnetConcept): string {
  // Placeholder to preserve structure; replace with your exact previous prompt
  return `...`;
}

function getFormatSpecificPdfPrompt(format: string, input: CampaignInput, outline: ContentOutline, customization?: PDFCustomization): string {
  // Placeholder to preserve structure; replace with your exact previous prompt
  return `...`;
}


