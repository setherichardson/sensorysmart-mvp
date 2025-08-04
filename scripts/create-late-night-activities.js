#!/usr/bin/env node

// Script to create hard-coded late-night activities for 11pm-5am
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const lateNightActivities = [
  {
    title: "Gentle Hand Squeezes",
    description: "Calming deep pressure through gentle hand squeezes",
    duration_minutes: 2,
    difficulty: "beginner",
    sensory_systems: ["tactile", "proprioceptive"],
    behavior_types: ["mixed"],
    benefits: [
      "Provides calming deep pressure",
      "Helps regulate nervous system",
      "Simple and quiet",
      "Works for most children"
    ],
    when_to_use: "When child is awake and needs help calming down to sleep",
    materials: [],
    steps: [
      {
        step_number: 1,
        title: "Sit quietly with child",
        description: "Sit on the edge of their bed in a calm, quiet manner",
        duration_seconds: 30
      },
      {
        step_number: 2,
        title: "Gentle hand squeezes",
        description: "Gently squeeze their hands, starting with light pressure and gradually increasing to firm but comfortable pressure",
        duration_seconds: 60
      },
      {
        step_number: 3,
        title: "Rhythmic pattern",
        description: "Continue with a slow, rhythmic pattern - squeeze for 3 seconds, release for 2 seconds",
        duration_seconds: 30
      }
    ],
    age_range: "3-8",
    environment: "indoor"
  },
  {
    title: "Calming Belly Breathing",
    description: "Simple breathing exercise to help calm and relax",
    duration_minutes: 3,
    difficulty: "beginner",
    sensory_systems: ["interoception"],
    behavior_types: ["mixed"],
    benefits: [
      "Calms the nervous system",
      "Reduces anxiety and stress",
      "Helps with sleep regulation",
      "No materials needed"
    ],
    when_to_use: "When child is restless or anxious and needs help relaxing",
    materials: [],
    steps: [
      {
        step_number: 1,
        title: "Lie down comfortably",
        description: "Have child lie on their back in bed, hands on belly",
        duration_seconds: 30
      },
      {
        step_number: 2,
        title: "Breathe in slowly",
        description: "Take a slow breath in through the nose, feeling belly rise",
        duration_seconds: 60
      },
      {
        step_number: 3,
        title: "Breathe out slowly",
        description: "Slowly breathe out through the mouth, feeling belly fall",
        duration_seconds: 60
      },
      {
        step_number: 4,
        title: "Repeat pattern",
        description: "Continue slow, steady breathing pattern",
        duration_seconds: 30
      }
    ],
    age_range: "3-8",
    environment: "indoor"
  },
  {
    title: "Quiet Counting",
    description: "Simple counting activity to help calm and focus the mind",
    duration_minutes: 2,
    difficulty: "beginner",
    sensory_systems: ["interoception"],
    behavior_types: ["mixed"],
    benefits: [
      "Helps focus the mind",
      "Reduces racing thoughts",
      "Promotes relaxation",
      "Simple and quiet"
    ],
    when_to_use: "When child's mind is racing and they need help focusing to sleep",
    materials: [],
    steps: [
      {
        step_number: 1,
        title: "Lie down in bed",
        description: "Have child lie comfortably in their bed",
        duration_seconds: 30
      },
      {
        step_number: 2,
        title: "Start counting",
        description: "Count slowly from 1 to 10, taking a breath between each number",
        duration_seconds: 60
      },
      {
        step_number: 3,
        title: "Count backwards",
        description: "Count backwards from 10 to 1, staying focused on the numbers",
        duration_seconds: 30
      }
    ],
    age_range: "3-8",
    environment: "indoor"
  }
];

async function createLateNightActivities() {
  console.log('🌙 Creating late-night activities for 11pm-5am...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const activity of lateNightActivities) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([activity]);

      if (error) {
        console.error(`❌ Error creating "${activity.title}":`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Successfully created: ${activity.title}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Exception creating "${activity.title}":`, err.message);
      errorCount++;
    }
  }

  console.log('\n📈 Summary:');
  console.log(`✅ Successfully created: ${successCount} activities`);
  console.log(`❌ Failed to create: ${errorCount} activities`);
  
  if (errorCount === 0) {
    console.log('\n🎉 All late-night activities created successfully!');
    console.log('\n💡 These activities will be perfect for:');
    console.log('   • 11pm-5am time slot');
    console.log('   • Kids who wake up and need help getting back to sleep');
    console.log('   • Simple, quiet, effective calming techniques');
  }
}

createLateNightActivities()
  .then(() => {
    console.log('✅ Process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Process failed:', error);
    process.exit(1);
  }); 