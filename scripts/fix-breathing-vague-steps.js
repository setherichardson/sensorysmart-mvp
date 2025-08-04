require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixBreathingVagueSteps() {
  console.log('🔧 Fixing Breathing Exercises with Vague Steps...\n')

  const activitiesToFix = [
    {
      title: 'Breathing Exercises - Low Registration',
      newSteps: [
        {
          "step_number": 1,
          "title": "Set up active space",
          "description": "Clear a large area for movement. Make sure there's plenty of room to move arms and body freely.",
          "duration_seconds": 30
        },
        {
          "step_number": 2,
          "title": "Strong breathing with movement",
          "description": "Take deep, powerful breaths while doing big arm movements - raise arms high on inhale, lower on exhale. Make the breathing loud and noticeable.",
          "duration_seconds": 60
        },
        {
          "step_number": 3,
          "title": "Movement breathing",
          "description": "Walk around the room while breathing deeply. Add jumping or marching movements to make the breathing more intense and noticeable.",
          "duration_seconds": 120
        },
        {
          "step_number": 4,
          "title": "Counted breathing loudly",
          "description": "Count breaths out loud: 'Breathe in 1-2-3-4, hold 1-2, breathe out 1-2-3-4.' Make the counting loud and dramatic.",
          "duration_seconds": 90
        },
        {
          "step_number": 5,
          "title": "Cool down breathing",
          "description": "Slow down gradually, ending with 5-10 normal breaths while standing still.",
          "duration_seconds": 60
        }
      ]
    },
    {
      title: 'Breathing Exercises - Seeking',
      newSteps: [
        {
          "step_number": 1,
          "title": "Find open space",
          "description": "Stand in a large, open area where you can move freely without obstacles. Make sure there's room to swing arms and move around.",
          "duration_seconds": 30
        },
        {
          "step_number": 2,
          "title": "Deep breaths with arm movements",
          "description": "Take deep breaths while moving arms up and down in big, sweeping motions. Inhale as arms go up, exhale as arms go down.",
          "duration_seconds": 60
        },
        {
          "step_number": 3,
          "title": "Counted breathing pattern",
          "description": "Breathe in for 4 counts, hold for 4 counts, breathe out for 4 counts. Repeat this pattern 5-10 times, focusing on the rhythm.",
          "duration_seconds": 60
        },
        {
          "step_number": 4,
          "title": "Movement breathing",
          "description": "Add gentle movements like swaying, gentle jumping, or walking in place while continuing the deep breathing pattern.",
          "duration_seconds": 30
        },
        {
          "step_number": 5,
          "title": "Gradual cool down",
          "description": "Slow down the movements and breathing gradually, ending with 3-5 normal breaths while standing still.",
          "duration_seconds": 30
        }
      ]
    }
  ]

  for (const activity of activitiesToFix) {
    try {
      console.log(`🔧 Fixing: ${activity.title}`)
      
      // Update the activity
      const { data: updatedActivity, error: updateError } = await supabase
        .from('activities')
        .update({ 
          steps: activity.newSteps
        })
        .eq('title', activity.title)
        .select()

      if (updateError) {
        console.error(`❌ Error updating ${activity.title}:`, updateError)
        continue
      }

      console.log(`✅ Successfully updated ${activity.title}!`)
      console.log(`   New steps: ${activity.newSteps.length} steps`)
      
    } catch (err) {
      console.error(`❌ Error with ${activity.title}:`, err)
    }
  }

  console.log('\n🎉 All Breathing Exercises with vague steps updated!')
}

fixBreathingVagueSteps() 