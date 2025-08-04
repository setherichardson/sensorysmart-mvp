require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixScavengerHuntActivities() {
  console.log('🔧 Fixing Sensory Scavenger Hunt Activities with No Steps...\n')

  const activitiesToFix = [
    {
      title: 'Sensory Scavenger Hunt - Seeking',
      newSteps: [
        {
          "step_number": 1,
          "title": "Create exciting hunt list",
          "description": "Make a list of 8-10 exciting items to find: something that makes noise, something bumpy, something soft, something shiny, something that smells good, something heavy, something colorful, something smooth.",
          "duration_seconds": 120
        },
        {
          "step_number": 2,
          "title": "Set up hunt area",
          "description": "Choose a large area (room or yard) and hide items around it. Make some easy to find, some more challenging.",
          "duration_seconds": 180
        },
        {
          "step_number": 3,
          "title": "Start the hunt",
          "description": "Give child the list and let them run around finding items. Encourage them to touch, smell, and explore each item.",
          "duration_seconds": 600
        },
        {
          "step_number": 4,
          "title": "Celebrate findings",
          "description": "When they find items, celebrate and discuss the sensory properties: 'This is so soft!' 'Listen to that sound!'",
          "duration_seconds": 180
        },
        {
          "step_number": 5,
          "title": "Review and explore",
          "description": "Go through all found items together, exploring their different textures, sounds, and properties.",
          "duration_seconds": 120
        }
      ]
    },
    {
      title: 'Sensory Scavenger Hunt - Avoiding',
      newSteps: [
        {
          "step_number": 1,
          "title": "Create gentle hunt list",
          "description": "Make a simple list of 4-5 familiar items: something soft, something smooth, something quiet, something familiar.",
          "duration_seconds": 60
        },
        {
          "step_number": 2,
          "title": "Set up safe area",
          "description": "Choose a small, familiar area. Place items in plain sight, not hidden, so child can see them easily.",
          "duration_seconds": 120
        },
        {
          "step_number": 3,
          "title": "Gentle exploration",
          "description": "Walk slowly with child, pointing out items. Let them choose when to touch or explore.",
          "duration_seconds": 300
        },
        {
          "step_number": 4,
          "title": "Quiet discussion",
          "description": "Talk quietly about each item found, focusing on familiar, comfortable properties.",
          "duration_seconds": 120
        },
        {
          "step_number": 5,
          "title": "Calm finish",
          "description": "Sit quietly with found items, just looking at them without pressure to touch.",
          "duration_seconds": 60
        }
      ]
    },
    {
      title: 'Sensory Scavenger Hunt - Sensitive',
      newSteps: [
        {
          "step_number": 1,
          "title": "Create minimal hunt list",
          "description": "Make a very simple list of 2-3 very familiar items: something soft, something quiet.",
          "duration_seconds": 30
        },
        {
          "step_number": 2,
          "title": "Set up quiet space",
          "description": "Choose a very quiet, small area. Place items in plain sight, no hiding required.",
          "duration_seconds": 60
        },
        {
          "step_number": 3,
          "title": "Very gentle exploration",
          "description": "Walk very slowly with child. Let them point to items without touching if they prefer.",
          "duration_seconds": 180
        },
        {
          "step_number": 4,
          "title": "Whisper discussion",
          "description": "Talk very quietly about items, focusing on visual properties rather than touch.",
          "duration_seconds": 90
        },
        {
          "step_number": 5,
          "title": "Quiet observation",
          "description": "Sit quietly and just look at the items together, no pressure to interact.",
          "duration_seconds": 60
        }
      ]
    },
    {
      title: 'Sensory Scavenger Hunt - Low-Registration',
      newSteps: [
        {
          "step_number": 1,
          "title": "Create exciting hunt list",
          "description": "Make a list of 10-12 very obvious items: something very loud, something very bright, something very big, something very smelly, something very rough.",
          "duration_seconds": 120
        },
        {
          "step_number": 2,
          "title": "Set up obvious hunt area",
          "description": "Choose a large area and place items very obviously - bright colors, loud sounds, strong smells.",
          "duration_seconds": 180
        },
        {
          "step_number": 3,
          "title": "High-energy hunt",
          "description": "Run around with child, making lots of noise and excitement about finding each item.",
          "duration_seconds": 600
        },
        {
          "step_number": 4,
          "title": "Dramatic celebration",
          "description": "Celebrate each find with lots of excitement, noise, and dramatic reactions.",
          "duration_seconds": 240
        },
        {
          "step_number": 5,
          "title": "Active review",
          "description": "Go through items with lots of movement, sound, and excitement about their properties.",
          "duration_seconds": 180
        }
      ]
    },
    {
      title: 'Sensory Scavenger Hunt - Mixed',
      newSteps: [
        {
          "step_number": 1,
          "title": "Create flexible hunt list",
          "description": "Make a list of 6-8 items with varying intensity: some obvious, some subtle. Include items for different sensory preferences.",
          "duration_seconds": 90
        },
        {
          "step_number": 2,
          "title": "Set up adaptable area",
          "description": "Choose a medium-sized area. Place some items obviously, some subtly, so child can choose their comfort level.",
          "duration_seconds": 120
        },
        {
          "step_number": 3,
          "title": "Adaptive exploration",
          "description": "Let child lead the pace. If they want to run and explore, follow their energy. If they want to go slowly, match their pace.",
          "duration_seconds": 420
        },
        {
          "step_number": 4,
          "title": "Flexible interaction",
          "description": "Discuss items based on child's comfort level - some might want to touch everything, others might prefer to just look.",
          "duration_seconds": 180
        },
        {
          "step_number": 5,
          "title": "Gradual finish",
          "description": "Slow down gradually, reviewing items at child's preferred pace and comfort level.",
          "duration_seconds": 90
        }
      ]
    },
    {
      title: 'Sensory Scavenger Hunt - Bedtime',
      newSteps: [
        {
          "step_number": 1,
          "title": "Create calm hunt list",
          "description": "Make a very simple list of 3-4 quiet, soft items: something soft, something quiet, something smooth, something gentle.",
          "duration_seconds": 60
        },
        {
          "step_number": 2,
          "title": "Set up quiet area",
          "description": "Choose a small, quiet area with soft lighting. Place items gently, no hiding required.",
          "duration_seconds": 90
        },
        {
          "step_number": 3,
          "title": "Gentle exploration",
          "description": "Walk very slowly and quietly with child, speaking in whispers about what they find.",
          "duration_seconds": 240
        },
        {
          "step_number": 4,
          "title": "Quiet discussion",
          "description": "Talk very softly about each item, focusing on calming properties like softness and smoothness.",
          "duration_seconds": 120
        },
        {
          "step_number": 5,
          "title": "Calm finish",
          "description": "Sit quietly with found items, just looking at them gently before bedtime.",
          "duration_seconds": 60
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

  console.log('\n🎉 All Sensory Scavenger Hunt Activities updated!')
}

fixScavengerHuntActivities() 