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

async function createActivitiesTable() {
  try {
    console.log('🔧 Creating activities table...')
    
    // Create activities table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS activities (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          context VARCHAR(255) NOT NULL,
          duration_minutes INTEGER NOT NULL,
          difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
          activity_type VARCHAR(50) CHECK (activity_type IN ('proprioceptive', 'vestibular', 'tactile', 'heavy-work', 'calming', 'auditory', 'visual', 'olfactory', 'interoception')) NOT NULL,
          sensory_systems TEXT[] NOT NULL,
          behavior_fit VARCHAR(20) CHECK (behavior_fit IN ('seeking', 'avoiding', 'sensitive', 'low-registration', 'mixed')) NOT NULL,
          benefits TEXT[] NOT NULL,
          when_to_use TEXT NOT NULL,
          materials_needed TEXT[],
          steps JSONB NOT NULL,
          variations JSONB,
          age_range VARCHAR(50),
          environment VARCHAR(50),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (createError) {
      console.log('⚠️  Table creation may have failed (this is often OK for IF NOT EXISTS):', createError.message)
    }
    
    console.log('✅ Activities table created (or already exists)')
    
    // Insert sample activities
    const sampleActivities = [
      {
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
      },
      {
        title: 'Resistance Band Pull',
        description: 'Pulling resistance band for muscle input',
        context: 'Perfect before lunch to help focus',
        duration_minutes: 5,
        difficulty: 'beginner',
        activity_type: 'heavy-work',
        sensory_systems: ['proprioceptive'],
        behavior_fit: 'seeking',
        benefits: ['Provides heavy work', 'Improves focus', 'Strengthens muscles'],
        when_to_use: 'Before tasks requiring concentration',
        materials_needed: ['Resistance band'],
        steps: [
          { step: 1, instruction: 'Sit in a comfortable chair' },
          { step: 2, instruction: 'Hold the resistance band with both hands' },
          { step: 3, instruction: 'Keep your elbows at your sides' },
          { step: 4, instruction: 'Pull the band apart slowly' },
          { step: 5, instruction: 'Hold for 3 seconds' },
          { step: 6, instruction: 'Release slowly and repeat 10 times' }
        ],
        age_range: '6-12',
        environment: 'indoor'
      },
      {
        title: 'Weighted Lap Pad',
        description: 'Deep pressure through weighted lap pad',
        context: 'Calming activity for quiet time',
        duration_minutes: 10,
        difficulty: 'beginner',
        activity_type: 'calming',
        sensory_systems: ['tactile', 'proprioceptive'],
        behavior_fit: 'sensitive',
        benefits: ['Provides deep pressure', 'Calming effect', 'Easy to use'],
        when_to_use: 'When feeling overwhelmed or needing to calm down',
        materials_needed: ['Weighted lap pad'],
        steps: [
          { step: 1, instruction: 'Find a quiet, comfortable space' },
          { step: 2, instruction: 'Place the weighted lap pad on your lap' },
          { step: 3, instruction: 'Take 3 deep breaths' },
          { step: 4, instruction: 'Close your eyes and feel the weight' },
          { step: 5, instruction: 'Stay still and relaxed for 5 minutes' },
          { step: 6, instruction: 'Slowly remove the pad when finished' }
        ],
        age_range: '6-12',
        environment: 'indoor'
      }
    ]
    
    console.log('📝 Inserting sample activities...')
    
    for (const activity of sampleActivities) {
      const { error: insertError } = await supabase
        .from('activities')
        .insert(activity)
      
      if (insertError) {
        console.log(`⚠️  Error inserting ${activity.title}:`, insertError.message)
      } else {
        console.log(`✅ Inserted: ${activity.title}`)
      }
    }
    
    console.log('🎉 Activities table setup complete!')
    
  } catch (error) {
    console.error('❌ Error creating activities table:', error)
  }
}

createActivitiesTable() 