#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createActivities() {
  try {
    console.log('🔧 Creating activities...')
    
    // Try to insert a simple activity to see if table exists
    const testActivity = {
      title: 'Wall Push-ups',
      description: 'Deep pressure input through pushing against a wall',
      context: 'Great for morning regulation',
      duration_minutes: 3,
      difficulty: 'beginner',
      activity_type: 'proprioceptive',
      sensory_systems: ['proprioceptive'],
      behavior_fit: 'seeking',
      benefits: ['Provides deep pressure input', 'Helps with regulation', 'Easy to do anywhere'],
      when_to_use: 'When seeking proprioceptive input or needing to calm down',
      materials_needed: ['Wall'],
      steps: [
        { step: 1, instruction: 'Stand facing a wall' },
        { step: 2, instruction: 'Place your hands on the wall at shoulder height' },
        { step: 3, instruction: 'Step back so your arms are straight' },
        { step: 4, instruction: 'Bend your elbows and lean toward the wall' },
        { step: 5, instruction: 'Push back to the starting position' },
        { step: 6, instruction: 'Repeat 5 times' }
      ],
      age_range: '6-12',
      environment: 'indoor'
    }
    
    const { data, error } = await supabase
      .from('activities')
      .insert(testActivity)
      .select()
    
    if (error) {
      console.log('❌ Error inserting activity:', error)
      console.log('💡 You may need to create the activities table in your Supabase dashboard')
      console.log('💡 Go to your Supabase project > SQL Editor and run the schema.sql file')
    } else {
      console.log('✅ Successfully created activity:', data)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createActivities() 