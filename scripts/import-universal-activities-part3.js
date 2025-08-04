#!/usr/bin/env node

// Import script for universal sensory activities part 3
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importUniversalActivities() {
  try {
    console.log('🚀 Starting import of universal sensory activities part 3...\n');
    
    // Read the JSON file
    const filePath = path.join(__dirname, '../lib/universal-sensory-activities-part3.json');
    const activitiesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    console.log(`📊 Found ${activitiesData.length} activities to import\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const activity of activitiesData) {
      try {
        // Map the activity data to match the database schema
        const mappedActivity = {
          title: activity.title,
          description: activity.description,
          duration_minutes: activity.duration_minutes,
          difficulty: activity.difficulty,
          sensory_systems: Array.isArray(activity.sensory_systems) ? `{${activity.sensory_systems.join(',')}}` : null,
          behavior_types: `{${activity.behavior_fit}}`,
          benefits: Array.isArray(activity.benefits) ? `{${activity.benefits.map(b=>b.replace(/,/g,'')).join(',')}}` : null,
          when_to_use: activity.when_to_use,
          materials: Array.isArray(activity.materials_needed) ? `{${activity.materials_needed.map(m=>m.replace(/,/g,'')).join(',')}}` : null,
          steps: JSON.stringify(activity.steps),
          age_range: activity.age_range,
          environment: activity.environment
        };
        
        const { data, error } = await supabase
          .from('activities')
          .insert([mappedActivity]);
        
        if (error) {
          console.error(`❌ Error importing "${activity.title}":`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Successfully imported: ${activity.title}`);
          successCount++;
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.error(`❌ Error processing "${activity.title}":`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n📈 Import Summary:');
    console.log(`✅ Successfully imported: ${successCount} activities`);
    console.log(`❌ Errors: ${errorCount} activities`);
    console.log(`📊 Total processed: ${activitiesData.length} activities`);
    
    if (errorCount === 0) {
      console.log('\n🎉 All activities imported successfully!');
    } else {
      console.log('\n⚠️ Some activities failed to import. Check the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Fatal error during import:', error);
  }
}

importUniversalActivities(); 