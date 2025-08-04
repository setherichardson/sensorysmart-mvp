#!/usr/bin/env node

// Test script to show current time slot and what activities would be shown
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

async function testCurrentTimeSlot() {
  console.log('🕐 Testing current time slot...\n');
  
  const currentTime = new Date();
  const timeSlot = getCurrentTimeSlot();
  
  console.log(`Current time: ${currentTime.toLocaleTimeString()}`);
  console.log(`Current time slot: ${timeSlot}`);
  console.log(`Hour: ${currentTime.getHours()}`);
  
  if (timeSlot === 'bedtime') {
    console.log('\n🌙 You are in BEDTIME time slot (11pm-5am)!');
    console.log('You should see the 3 late-night activities:');
    console.log('   • Gentle Hand Squeezes');
    console.log('   • Calming Belly Breathing');
    console.log('   • Quiet Counting');
  } else {
    console.log('\n☀️ You are NOT in bedtime time slot.');
    console.log('You will see normal personalized activities based on:');
    console.log('   • Your assessment results');
    console.log('   • Current time of day');
    console.log('   • Child\'s behavior type');
    
    console.log('\n💡 To test late-night activities:');
    console.log('   • Wait until 11pm-5am, OR');
    console.log('   • Temporarily modify the time slot logic in your app');
  }
  
  // Show what activities would be prioritized
  try {
    const { data: activities, error } = await supabase
      .from('activities')
      .select('title, behavior_types')
      .limit(10);
    
    if (error) {
      console.error('❌ Error fetching activities:', error);
      return;
    }
    
    console.log('\n📊 Sample activities in database:');
    activities?.slice(0, 5).forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title}`);
    });
    
    const lateNightActivities = activities?.filter(a => 
      ['Gentle Hand Squeezes', 'Calming Belly Breathing', 'Quiet Counting'].includes(a.title)
    );
    
    if (lateNightActivities && lateNightActivities.length > 0) {
      console.log('\n✅ Late-night activities are in the database:');
      lateNightActivities.forEach(activity => {
        console.log(`   • ${activity.title}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

testCurrentTimeSlot(); 