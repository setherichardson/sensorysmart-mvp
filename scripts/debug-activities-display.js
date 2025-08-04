#!/usr/bin/env node

// Debug script to show all activities and help understand the display logic
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugActivitiesDisplay() {
  console.log('🔍 Debugging Activities Display...\n');
  
  try {
    // Get all activities
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .order('title');
    
    if (error) {
      console.error('❌ Error fetching activities:', error);
      return;
    }
    
    console.log(`📊 Total activities in database: ${activities.length}\n`);
    
    // Show universal activities (new ones)
    const universalActivities = activities.filter(a => a.title.includes('-'));
    console.log(`🎯 Universal activities (new): ${universalActivities.length}`);
    console.log('Sample universal activities:');
    universalActivities.slice(0, 10).forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title}`);
      console.log(`   Behavior Types: ${activity.behavior_types?.join(', ') || 'none'}`);
      console.log(`   Sensory Systems: ${activity.sensory_systems?.join(', ') || 'none'}`);
      console.log(`   Difficulty: ${activity.difficulty}`);
      console.log('');
    });
    
    // Show regular activities (old ones)
    const regularActivities = activities.filter(a => !a.title.includes('-'));
    console.log(`📚 Regular activities (old): ${regularActivities.length}`);
    console.log('Sample regular activities:');
    regularActivities.slice(0, 5).forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title}`);
      console.log(`   Behavior Types: ${activity.behavior_types?.join(', ') || 'none'}`);
      console.log(`   Sensory Systems: ${activity.sensory_systems?.join(', ') || 'none'}`);
      console.log(`   Difficulty: ${activity.difficulty}`);
      console.log('');
    });
    
    // Check for activities by behavior type
    console.log('📈 Activities by behavior type:');
    const behaviorTypes = ['seeking', 'avoiding', 'sensitive', 'low-registration', 'mixed', 'bedtime'];
    behaviorTypes.forEach(behavior => {
      const count = activities.filter(a => 
        a.behavior_types && a.behavior_types.includes(behavior)
      ).length;
      console.log(`   ${behavior}: ${count} activities`);
    });
    
    console.log('\n💡 Why you might not see new activities in the app:');
    console.log('1. You need to complete an assessment first');
    console.log('2. Activities are filtered by time of day');
    console.log('3. Only top-scoring activities are shown');
    console.log('4. The app shows max 3 activities at a time');
    
    console.log('\n🔧 To see new activities:');
    console.log('1. Complete the sensory assessment');
    console.log('2. Check different times of day');
    console.log('3. Look for activities matching your child\'s behavior type');
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

debugActivitiesDisplay(); 