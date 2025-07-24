require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Function to clean activity titles
function cleanActivityTitle(title) {
  // Remove variations like "(Variation 2)", "(Variation 3)", etc.
  let cleanedTitle = title.replace(/\s*\(Variation\s*\d+\)/gi, '');
  
  // Make titles more descriptive based on the base activity
  const titleMappings = {
    'Texture Exploration': 'Texture Touch & Feel',
    'Finger Painting': 'Creative Finger Art',
    'Play Dough Creation': 'Play Dough Sculpting',
    'Wall Push-ups': 'Wall Strength Training',
    'Heavy Work Carrying': 'Heavy Object Transport',
    'Jumping Jacks': 'Energetic Jumping',
    'Swinging': 'Playground Swinging',
    'Spinning': 'Controlled Spinning',
    'Balance Beam': 'Balance Walking',
    'Calming Music': 'Relaxing Music Time',
    'Sound Scavenger Hunt': 'Sound Discovery Game',
    'Visual Tracking': 'Eye Movement Practice',
    'I Spy': 'Visual Search Game',
    'Scent Exploration': 'Smell Discovery',
    'Body Scan': 'Body Awareness Check',
    'Deep Breathing': 'Calming Breath Work'
  };
  
  // Apply mapping if it exists
  for (const [original, replacement] of Object.entries(titleMappings)) {
    if (cleanedTitle === original) {
      cleanedTitle = replacement;
      break;
    }
  }
  
  return cleanedTitle;
}

async function cleanActivityTitles() {
  try {
    console.log('🧹 Cleaning activity titles...\n');
    
    // Get all activities from database
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*');
    
    if (error) {
      console.error('Error fetching activities:', error);
      return;
    }
    
    console.log(`Found ${activities.length} activities to clean\n`);
    
    let updatedCount = 0;
    const duplicates = new Set();
    
    for (const activity of activities) {
      const originalTitle = activity.title;
      const cleanedTitle = cleanActivityTitle(originalTitle);
      
      // Check for duplicates
      if (duplicates.has(cleanedTitle)) {
        console.log(`⚠️  Duplicate found: "${cleanedTitle}" (original: "${originalTitle}")`);
        continue;
      }
      
      if (cleanedTitle !== originalTitle) {
        console.log(`🔄 "${originalTitle}" → "${cleanedTitle}"`);
        
        // Update the activity title
        const { error: updateError } = await supabase
          .from('activities')
          .update({ title: cleanedTitle })
          .eq('id', activity.id);
        
        if (updateError) {
          console.error(`❌ Error updating "${originalTitle}":`, updateError);
        } else {
          updatedCount++;
          duplicates.add(cleanedTitle);
        }
      } else {
        duplicates.add(cleanedTitle);
      }
    }
    
    console.log(`\n✅ Successfully cleaned ${updatedCount} activity titles`);
    console.log(`📊 Total unique activities: ${duplicates.size}`);
    
  } catch (error) {
    console.error('❌ Error cleaning activity titles:', error);
  }
}

// Function to remove duplicate activities
async function removeDuplicateActivities() {
  try {
    console.log('\n🗑️  Removing duplicate activities...\n');
    
    // Get all activities
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*');
    
    if (error) {
      console.error('Error fetching activities:', error);
      return;
    }
    
    const titleGroups = {};
    const toDelete = [];
    
    // Group activities by cleaned title
    activities.forEach(activity => {
      const cleanedTitle = cleanActivityTitle(activity.title);
      if (!titleGroups[cleanedTitle]) {
        titleGroups[cleanedTitle] = [];
      }
      titleGroups[cleanedTitle].push(activity);
    });
    
    // Find duplicates (keep the first one, delete the rest)
    Object.entries(titleGroups).forEach(([cleanedTitle, group]) => {
      if (group.length > 1) {
        console.log(`📋 "${cleanedTitle}" has ${group.length} variations:`);
        group.forEach((activity, index) => {
          if (index === 0) {
            console.log(`  ✅ Keeping: "${activity.title}" (ID: ${activity.id})`);
          } else {
            console.log(`  🗑️  Deleting: "${activity.title}" (ID: ${activity.id})`);
            toDelete.push(activity.id);
          }
        });
        console.log('');
      }
    });
    
    if (toDelete.length === 0) {
      console.log('✅ No duplicate activities found');
      return;
    }
    
    console.log(`🗑️  Deleting ${toDelete.length} duplicate activities...`);
    
    // Delete duplicates
    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .in('id', toDelete);
    
    if (deleteError) {
      console.error('❌ Error deleting duplicates:', deleteError);
    } else {
      console.log(`✅ Successfully deleted ${toDelete.length} duplicate activities`);
    }
    
  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
  }
}

// Main execution
async function main() {
  console.log('🎯 Activity Title Cleanup Script\n');
  
  await cleanActivityTitles();
  await removeDuplicateActivities();
  
  console.log('\n🎉 Cleanup complete!');
}

main().catch(console.error); 