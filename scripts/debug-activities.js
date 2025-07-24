// Simple script to debug activities query
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugActivities() {
  console.log('🔍 Debugging activities database...');
  
  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error getting count:', countError);
      return;
    }
    
    console.log(`📊 Total activities in database: ${count}`);
    
    // Get all activities
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('title');
    
    if (error) {
      console.error('❌ Error fetching activities:', error);
      return;
    }
    
    console.log(`✅ Successfully fetched ${data.length} activities`);
    
    // Show first 5 activities with more details
    console.log('\n📋 First 5 activities:');
    data.slice(0, 5).forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title}`);
      console.log(`   Behavior Types: ${JSON.stringify(activity.behavior_types)}`);
      console.log(`   Sensory Systems: ${JSON.stringify(activity.sensory_systems)}`);
      console.log(`   Difficulty: ${activity.difficulty}`);
      console.log(`   ID: ${activity.id}`);
      console.log('');
    });
    
    // Check for any activities with behavior_types
    const activitiesWithBehavior = data.filter(a => a.behavior_types && a.behavior_types.length > 0);
    console.log(`🎯 Activities with behavior_types: ${activitiesWithBehavior.length}`);
    
    // Check for any activities without behavior_types
    const activitiesWithoutBehavior = data.filter(a => !a.behavior_types || a.behavior_types.length === 0);
    console.log(`⚠️  Activities without behavior_types: ${activitiesWithoutBehavior.length}`);
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

debugActivities(); 