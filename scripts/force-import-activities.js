// Script to force clear and re-import activities
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function forceImportActivities() {
  try {
    console.log('🧹 Force clearing all activities...');
    
    // Force delete all activities
    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .not('id', 'is', null);
    
    if (deleteError) {
      console.error('❌ Error clearing activities:', deleteError);
      return;
    }
    
    console.log('✅ All activities cleared');
    
    // Load activities from JSON
    const activitiesPath = path.join(__dirname, '../exports/100-activities-full-details.json');
    const activitiesRaw = fs.readFileSync(activitiesPath, 'utf-8');
    const activities = JSON.parse(activitiesRaw);
    
    console.log(`📊 Loading ${activities.length} activities from JSON...`);
    
    let created = 0;
    for (const activity of activities) {
      try {
        // Insert activity with correct field mapping for actual schema
        const { data, error } = await supabase.from('activities').insert([
          {
            title: activity.name,
            description: activity.description,
            duration_minutes: activity.durationMinutes || 10,
            difficulty: activity.difficultyLevel || 'beginner',
            sensory_systems: Array.isArray(activity.sensorySystems) ? `{${activity.sensorySystems.join(',')}}` : null,
            behavior_types: Array.isArray(activity.behaviorTypes) ? `{${activity.behaviorTypes.join(',')}}` : null,
            benefits: Array.isArray(activity.benefits) ? `{${activity.benefits.map(b=>b.replace(/,/g,'')).join(',')}}` : null,
            when_to_use: activity.whenToUse || '',
            materials: Array.isArray(activity.materials) ? `{${activity.materials.map(m=>m.replace(/,/g,'')).join(',')}}` : null,
            steps: activity.steps ? JSON.stringify(activity.steps) : null,
            age_range: activity.ageRange || '3-5 years',
            environment: activity.environment || 'indoor',
          },
        ]);
        
        if (error) {
          console.error(`❌ Error inserting activity ${activity.id}:`, error);
          continue;
        }
        
        created++;
        
        if (created % 10 === 0) {
          console.log(`✅ Imported ${created} activities...`);
        }
        
      } catch (err) {
        console.error(`❌ Error processing activity ${activity.id}:`, err);
      }
    }
    
    console.log(`🎉 Successfully imported ${created} activities!`);
    
    // Verify import
    const { data: verifyData, error: verifyError } = await supabase
      .from('activities')
      .select('*')
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Error verifying import:', verifyError);
    } else {
      console.log(`✅ Verification: Found ${verifyData?.length || 0} activities in database`);
      if (verifyData && verifyData.length > 0) {
        console.log('📋 Sample imported activity:');
        const sample = verifyData[0];
        console.log(`   Title: ${sample.title}`);
        console.log(`   Behavior Types: ${sample.behavior_types}`);
        console.log(`   Sensory Systems: ${sample.sensory_systems}`);
        console.log(`   Difficulty: ${sample.difficulty}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

forceImportActivities(); 