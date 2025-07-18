// Migration script to add case studies to existing campaigns
import { createClient } from '@supabase/supabase-js';
import { regenerateCaseStudiesForCampaign } from './src/lib/openai.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateExistingCampaigns() {
  try {
    console.log('🚀 Starting case study migration for existing campaigns...');

    // Get all campaigns
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch campaigns: ${error.message}`);
    }

    console.log(`📊 Found ${campaigns.length} campaigns to migrate`);

    let successCount = 0;
    let errorCount = 0;

    for (const campaign of campaigns) {
      try {
        console.log(`\n🔄 Processing campaign: ${campaign.name} (ID: ${campaign.id})`);

        // Check if campaign already has case studies
        const hasCaseStudies = checkIfHasCaseStudies(campaign);
        
        if (hasCaseStudies) {
          console.log(`✅ Campaign ${campaign.id} already has case studies, skipping...`);
          continue;
        }

        // Regenerate case studies
        const updatedCampaign = await regenerateCaseStudiesForCampaign(campaign);

        // Update the campaign in the database
        const { error: updateError } = await supabase
          .from('campaigns')
          .update({
            lead_magnet_content: updatedCampaign.lead_magnet_content
          })
          .eq('id', campaign.id);

        if (updateError) {
          throw new Error(`Failed to update campaign: ${updateError.message}`);
        }

        console.log(`✅ Successfully updated campaign ${campaign.id} with case studies`);
        successCount++;

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (err) {
        console.error(`❌ Error processing campaign ${campaign.id}:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Successfully updated: ${successCount} campaigns`);
    console.log(`❌ Errors: ${errorCount} campaigns`);
    console.log(`📊 Total processed: ${campaigns.length} campaigns`);

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

function checkIfHasCaseStudies(campaign) {
  try {
    const structuredContent = campaign.lead_magnet_content?.structured_content;
    if (!structuredContent?.toolkit_sections) {
      return false; // No structured content means no case studies
    }

    for (const section of structuredContent.toolkit_sections) {
      switch (section.type) {
        case 'pros_and_cons_list':
          for (const item of section.content?.items || []) {
            if (item.case_study) return true;
          }
          break;
        case 'checklist':
          if (section.content?.case_study) return true;
          break;
        case 'scripts':
          for (const scenario of section.content?.scenarios || []) {
            if (scenario.case_study) return true;
          }
          break;
      }
    }
    return false;
  } catch (err) {
    return false;
  }
}

// Run the migration
migrateExistingCampaigns(); 