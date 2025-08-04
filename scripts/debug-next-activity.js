#!/usr/bin/env node

// Debug script to test next activity logic during bedtime
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getCurrentTimeSlot() {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 8) return 'before-breakfast';
  if (hour >= 8 && hour < 10) return 'mid-morning';
  if (hour >= 10 && hour < 12) return 'before-lunch';
  if (hour >= 12 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 16) return 'mid-afternoon';
  if (hour >= 16 && hour < 18) return 'before-dinner';
  if (hour >= 18 && hour < 20) return 'dinner';
  if (hour >= 20 && hour < 22) return 'evening';
  if (hour >= 22 || hour < 6) return 'bedtime';
  
  return 'unknown';
}

async function debugNextActivity() {
  console.log('🔍 Debugging next activity logic...\n');
  
  const timeSlot = getCurrentTimeSlot();
  console.log(`Current time slot: ${timeSlot}`);
  
  if (timeSlot !== 'bedtime') {
    console.log('❌ Not in bedtime hours - this test is for bedtime only');
    return;
  }
  
  // Simulate completing a late-night activity
  const justCompletedActivity = {
    id: 'test-id',
    title: 'Gentle Hand Squeezes',
    activity_type: 'tactile',
    duration_minutes: 2
  };
  
  console.log(`\n📝 Just completed: ${justCompletedActivity.title}`);
  
  // Test the bedtime logic
  console.log('\n🛏️ Testing bedtime activity fetching...');
  
  try {
    const { data: lateNightActivities, error } = await supabase
      .from('activities')
      .select('*')
      .in('title', ['Gentle Hand Squeezes', 'Calming Belly Breathing', 'Quiet Counting'])
      .order('title')
    
    if (error) {
      console.error('❌ Error fetching late-night activities:', error);
      return;
    }
    
    console.log('✅ Late-night activities found:');
    lateNightActivities?.forEach((activity, index) => {
      console.log(`   ${index + 1}. ${activity.title}`);
    });
    
    // Filter out the just completed activity
    const availableActivities = lateNightActivities?.filter(a => 
      a.title !== justCompletedActivity.title
    ) || [];
    
    console.log('\n🎯 Available next activities (excluding completed):');
    availableActivities.forEach((activity, index) => {
      console.log(`   ${index + 1}. ${activity.title}`);
    });
    
    if (availableActivities.length > 0) {
      console.log(`\n✅ Next activity should be: ${availableActivities[0].title}`);
    } else {
      console.log('\n⚠️ No available next activities found');
    }
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

debugNextActivity(); 