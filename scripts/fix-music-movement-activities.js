require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixMusicMovementActivities() {
  console.log('🔧 Fixing Music and Movement Activities with No Steps...\n')

  const activitiesToFix = [
    {
      title: 'Music and Movement - Seeking',
      newSteps: [
        {
          "step_number": 1,
          "title": "Set up energetic music",
          "description": "Choose upbeat, energetic music that your child enjoys. Clear space for movement and dancing.",
          "duration_seconds": 30
        },
        {
          "step_number": 2,
          "title": "Free dance movement",
          "description": "Dance freely to the music, moving arms, legs, and body energetically. Jump, spin, and move around the space.",
          "duration_seconds": 300
        },
        {
          "step_number": 3,
          "title": "High-energy moves",
          "description": "Add jumping jacks, running in place, spinning, and dramatic arm movements to the music.",
          "duration_seconds": 240
        },
        {
          "step_number": 4,
          "title": "Interactive dancing",
          "description": "Dance together, copying each other's moves, or take turns leading the dance moves.",
          "duration_seconds": 180
        },
        {
          "step_number": 5,
          "title": "Cool down dance",
          "description": "Slow down the movements gradually, ending with gentle swaying and stretching.",
          "duration_seconds": 90
        }
      ]
    },
    {
      title: 'Music and Movement - Avoiding',
      newSteps: [
        {
          "step_number": 1,
          "title": "Choose gentle music",
          "description": "Select very soft, calming music with a slow tempo. Keep the volume very low.",
          "duration_seconds": 30
        },
        {
          "step_number": 2,
          "title": "Gentle swaying",
          "description": "Stand or sit and sway very slowly and gently to the music, keeping movements minimal.",
          "duration_seconds": 180
        },
        {
          "step_number": 3,
          "title": "Simple arm movements",
          "description": "Add very simple arm movements like slowly raising and lowering arms or gentle hand waving.",
          "duration_seconds": 120
        },
        {
          "step_number": 4,
          "title": "Quiet breathing",
          "description": "Breathe slowly and rhythmically with the music, focusing on calm, steady breathing.",
          "duration_seconds": 90
        },
        {
          "step_number": 5,
          "title": "Gradual stop",
          "description": "Slowly reduce movements until completely still, then sit quietly for a moment.",
          "duration_seconds": 60
        }
      ]
    },
    {
      title: 'Music and Movement - Sensitive',
      newSteps: [
        {
          "step_number": 1,
          "title": "Prepare quiet environment",
          "description": "Find a very quiet space. Play extremely soft, gentle music or nature sounds at the lowest volume.",
          "duration_seconds": 30
        },
        {
          "step_number": 2,
          "title": "Minimal movement",
          "description": "Make very small, gentle movements - just slight swaying or tiny finger movements to the rhythm.",
          "duration_seconds": 120
        },
        {
          "step_number": 3,
          "title": "Breathing rhythm",
          "description": "Breathe in and out slowly, matching the rhythm of the music if possible.",
          "duration_seconds": 90
        },
        {
          "step_number": 4,
          "title": "Gentle touch",
          "description": "If comfortable, add very gentle hand-holding or soft touch while moving slowly.",
          "duration_seconds": 60
        },
        {
          "step_number": 5,
          "title": "Quiet finish",
          "description": "Stop all movement and sit quietly, listening to the soft music until it ends.",
          "duration_seconds": 30
        }
      ]
    },
    {
      title: 'Music and Movement - Low-Registration',
      newSteps: [
        {
          "step_number": 1,
          "title": "Set up loud music",
          "description": "Choose loud, energetic music with strong beats. Use colorful props like scarves or ribbons.",
          "duration_seconds": 30
        },
        {
          "step_number": 2,
          "title": "Big dramatic movements",
          "description": "Make large, dramatic movements - big arm swings, high jumps, wide steps, and spinning.",
          "duration_seconds": 300
        },
        {
          "step_number": 3,
          "title": "Prop-enhanced movement",
          "description": "Use colorful scarves, ribbons, or streamers to make movements more visible and engaging.",
          "duration_seconds": 240
        },
        {
          "step_number": 4,
          "title": "High-energy interaction",
          "description": "Dance together with lots of energy, cheering, clapping, and celebrating the movement.",
          "duration_seconds": 180
        },
        {
          "step_number": 5,
          "title": "Celebration finish",
          "description": "End with a big celebration dance, then gradually slow down with stretching.",
          "duration_seconds": 90
        }
      ]
    },
    {
      title: 'Music and Movement - Mixed',
      newSteps: [
        {
          "step_number": 1,
          "title": "Choose adaptable music",
          "description": "Start with moderate tempo music that can be adjusted. Have both quiet and energetic options ready.",
          "duration_seconds": 30
        },
        {
          "step_number": 2,
          "title": "Start with simple movement",
          "description": "Begin with gentle swaying or simple arm movements, observing child's comfort level.",
          "duration_seconds": 120
        },
        {
          "step_number": 3,
          "title": "Adjust based on response",
          "description": "If child seems comfortable, gradually increase movement and energy. If overwhelmed, keep it gentle.",
          "duration_seconds": 240
        },
        {
          "step_number": 4,
          "title": "Flexible interaction",
          "description": "Dance together, copying each other's movements, or take turns leading based on comfort level.",
          "duration_seconds": 180
        },
        {
          "step_number": 5,
          "title": "Gradual cool down",
          "description": "Slow down movements gradually, ending with gentle stretching and quiet breathing.",
          "duration_seconds": 90
        }
      ]
    },
    {
      title: 'Music and Movement - Bedtime',
      newSteps: [
        {
          "step_number": 1,
          "title": "Prepare lullaby music",
          "description": "Choose very soft, gentle lullabies or calming instrumental music. Dim the lights.",
          "duration_seconds": 30
        },
        {
          "step_number": 2,
          "title": "Gentle swaying",
          "description": "Sway very slowly and gently to the music, keeping movements minimal and calming.",
          "duration_seconds": 120
        },
        {
          "step_number": 3,
          "title": "Slow breathing",
          "description": "Breathe slowly and deeply with the rhythm of the music, focusing on relaxation.",
          "duration_seconds": 90
        },
        {
          "step_number": 4,
          "title": "Quiet movement",
          "description": "Make very small, gentle movements like slow arm raises or gentle hand-holding.",
          "duration_seconds": 60
        },
        {
          "step_number": 5,
          "title": "Calm finish",
          "description": "Gradually stop all movement and sit quietly, ready for bedtime routine.",
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

  console.log('\n🎉 All Music and Movement Activities updated!')
}

fixMusicMovementActivities() 