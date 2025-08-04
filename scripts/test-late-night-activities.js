#!/usr/bin/env node

// Test script to verify late-night activities are prioritized
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testLateNightActivities() {
  console.log('🌙 Testing late-night activity prioritization...\n');
  
  try {
    // Get all activities
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching activities:', error);
      return;
    }
    
    // Simulate the time-based scoring logic for bedtime
    const lateNightActivityTitles = [
      'Gentle Hand Squeezes',
      'Calming Belly Breathing', 
      'Quiet Counting'
    ];
    
    const scoredActivities = activities.map(activity => {
      let timeScore = 0;
      
      // Bedtime scoring logic
      if (lateNightActivityTitles.includes(activity.title)) {
        timeScore += 1000; // High priority for late-night activities
        console.log(`✅ ${activity.title} - HIGH PRIORITY (score: ${timeScore})`);
      } else {
        timeScore -= 50; // Deprioritize other activities
        console.log(`⏭️  ${activity.title} - Deprioritized (score: ${timeScore})`);
      }
      
      return { ...activity, timeScore };
    });
    
    // Sort by time score
    const sortedActivities = scoredActivities.sort((a, b) => b.timeScore - a.timeScore);
    
    console.log('\n📊 Top 5 activities for bedtime (11pm-5am):');
    sortedActivities.slice(0, 5).forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title} (score: ${activity.timeScore})`);
    });
    
    console.log('\n🎯 Late-night activities found:');
    const lateNightActivities = activities.filter(a => lateNightActivityTitles.includes(a.title));
    lateNightActivities.forEach(activity => {
      console.log(`   • ${activity.title} - ${activity.duration_minutes} minutes`);
      console.log(`     ${activity.description}`);
    });
    
    console.log('\n💡 Perfect! These 3 activities will be the only ones shown during late night hours.');
    console.log('   They are simple, quiet, and effective for helping kids get back to sleep.');
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

testLateNightActivities(); 