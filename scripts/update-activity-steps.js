require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const activityLibrary = require('../lib/comprehensive-activity-library.json');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Function to clean activity title for matching
function cleanActivityTitle(title) {
  return title.replace(/\s*\(Variation\s*\d+\)/gi, '').trim();
}

// Function to find matching activity in library
function findMatchingActivity(dbTitle) {
  const cleanedDbTitle = cleanActivityTitle(dbTitle);
  
  // First try exact match
  let match = activityLibrary.find(activity => 
    cleanActivityTitle(activity.title) === cleanedDbTitle
  );
  
  if (match) return match;
  
  // Try partial match
  match = activityLibrary.find(activity => 
    cleanActivityTitle(activity.title).toLowerCase().includes(cleanedDbTitle.toLowerCase()) ||
    cleanedDbTitle.toLowerCase().includes(cleanActivityTitle(activity.title).toLowerCase())
  );
  
  return match;
}

async function updateActivitySteps() {
  try {
    console.log('🔄 Updating activity steps in database...\n');
    
    // Get all activities from database
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*');
    
    if (error) {
      console.error('Error fetching activities:', error);
      return;
    }
    
    console.log(`Found ${activities.length} activities to update\n`);
    
    let updatedCount = 0;
    let notFoundCount = 0;
    
    for (const activity of activities) {
      console.log(`📋 Processing: "${activity.title}"`);
      
      // Find matching activity in library
      const libraryActivity = findMatchingActivity(activity.title);
      
      if (!libraryActivity) {
        console.log(`  ❌ No matching activity found in library`);
        notFoundCount++;
        continue;
      }
      
      if (!libraryActivity.steps || libraryActivity.steps.length === 0) {
        console.log(`  ⚠️  No steps found in library activity`);
        notFoundCount++;
        continue;
      }
      
      console.log(`  ✅ Found matching activity: "${libraryActivity.title}"`);
      console.log(`  📝 Steps: ${libraryActivity.steps.length} steps`);
      
      // Update the activity with steps
      const { error: updateError } = await supabase
        .from('activities')
        .update({ 
          steps: libraryActivity.steps,
          description: libraryActivity.description || activity.description,
          context: libraryActivity.context || activity.context,
          materials_needed: libraryActivity.materials_needed || activity.materials_needed,
          benefits: libraryActivity.benefits || activity.benefits,
          when_to_use: libraryActivity.when_to_use || activity.when_to_use
        })
        .eq('id', activity.id);
      
      if (updateError) {
        console.error(`  ❌ Error updating "${activity.title}":`, updateError);
      } else {
        console.log(`  ✅ Successfully updated with ${libraryActivity.steps.length} steps`);
        updatedCount++;
      }
      
      console.log('');
    }
    
    console.log(`🎉 Update complete!`);
    console.log(`✅ Updated: ${updatedCount} activities`);
    console.log(`❌ Not found: ${notFoundCount} activities`);
    
    // Show sample of updated activities
    console.log('\n📋 Sample updated activities:');
    const { data: sampleActivities } = await supabase
      .from('activities')
      .select('title, steps')
      .not('steps', 'eq', '[]')
      .not('steps', 'is', null)
      .limit(5);
    
    sampleActivities?.forEach(activity => {
      console.log(`• "${activity.title}": ${activity.steps?.length || 0} steps`);
    });
    
  } catch (error) {
    console.error('❌ Error updating activity steps:', error);
  }
}

// Main execution
async function main() {
  console.log('🎯 Activity Steps Update Script\n');
  
  await updateActivitySteps();
  
  console.log('\n🎉 Script complete!');
}

main().catch(console.error); 