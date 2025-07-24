#!/usr/bin/env node

// Script to check activities in the database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkActivities() {
  try {
    console.log('🔍 Checking activities in database...');
    
    // Check activities table
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('❌ Error fetching activities:', error);
      return;
    }
    
    console.log(`📊 Found ${activities?.length || 0} activities in database`);
    
    if (activities && activities.length > 0) {
      console.log('\n📋 Sample activities:');
      activities.forEach((activity, index) => {
        console.log(`${index + 1}. ${activity.title}`);
        console.log(`   Behavior Fit: ${activity.behavior_fit}`);
        console.log(`   Sensory Systems: ${activity.sensory_systems?.join(', ')}`);
        console.log(`   Difficulty: ${activity.difficulty}`);
        console.log(`   Active: ${activity.is_active}`);
        console.log('');
      });
    } else {
      console.log('❌ No activities found in database');
    }
    
    // Check activity_steps table
    const { data: steps, error: stepsError } = await supabase
      .from('activity_steps')
      .select('*')
      .limit(5);
    
    if (stepsError) {
      console.error('❌ Error fetching activity steps:', error);
    } else {
      console.log(`📊 Found ${steps?.length || 0} activity steps in database`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkActivities(); 