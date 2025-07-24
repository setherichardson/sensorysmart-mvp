// Simple script to debug activities query
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugActivities() {
  try {
    console.log('🔍 Debugging activities query...');
    
    // Simple query without any filters
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching activities:', error);
      return;
    }
    
    console.log(`📊 Found ${activities?.length || 0} activities`);
    
    if (activities && activities.length > 0) {
      console.log('📋 First 3 activities:');
      activities.slice(0, 3).forEach((activity, index) => {
        console.log(`${index + 1}. ${activity.title}`);
        console.log(`   ID: ${activity.id}`);
        console.log(`   Behavior Types: ${activity.behavior_types}`);
        console.log(`   Sensory Systems: ${activity.sensory_systems}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugActivities(); 