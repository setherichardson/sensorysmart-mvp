// Script to check the actual schema of the activities table
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkActivitiesSchema() {
  try {
    console.log('🔍 Checking activities table schema...');
    
    // Try to get one activity to see what fields exist
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error fetching activities:', error);
      return;
    }
    
    if (activities && activities.length > 0) {
      const activity = activities[0];
      console.log('📋 Available columns in activities table:');
      Object.keys(activity).forEach(key => {
        console.log(`   - ${key}: ${typeof activity[key]} (${activity[key]})`);
      });
    } else {
      console.log('❌ No activities found to check schema');
    }
    
    // Try to get table info
    console.log('\n🔍 Trying to get table information...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'activities' });
    
    if (tableError) {
      console.log('❌ Could not get table info:', tableError.message);
    } else {
      console.log('📋 Table info:', tableInfo);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkActivitiesSchema(); 