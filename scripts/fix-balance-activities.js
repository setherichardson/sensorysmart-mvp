require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixBalanceActivities() {
  console.log('🔧 Fixing Balance Activities with No Steps...\n')

  const activitiesToFix = [
    {
      title: 'Balance Activities - Seeking',
      newSteps: [
        {
          "step_number": 1,
          "title": "Set up balance course",
          "description": "Create a challenging balance course using pillows, cushions, and small obstacles. Make it exciting and engaging.",
          "duration_seconds": 120
        },
        {
          "step_number": 2,
          "title": "Dynamic balance walking",
          "description": "Walk on the balance course while carrying objects, changing directions, or adding arm movements.",
          "duration_seconds": 240
        },
        {
          "step_number": 3,
          "title": "One-legged challenges",
          "description": "Stand on one leg while reaching for objects, throwing a ball, or making funny faces.",
          "duration_seconds": 180
        },
        {
          "step_number": 4,
          "title": "Jumping balance",
          "description": "Jump from one balance surface to another, landing and maintaining balance each time.",
          "duration_seconds": 180
        },
        {
          "step_number": 5,
          "title": "Cool down walk",
          "description": "End with a simple walk around the room, focusing on smooth, controlled movements.",
          "duration_seconds": 60
        }
      ]
    },
    {
      title: 'Balance Activities - Avoiding',
      newSteps: [
        {
          "step_number": 1,
          "title": "Create safe space",
          "description": "Set up a very simple, safe balance area with just a few soft cushions on the floor.",
          "duration_seconds": 60
        },
        {
          "step_number": 2,
          "title": "Gentle standing",
          "description": "Stand on the cushions with both feet, feeling the slight movement beneath you.",
          "duration_seconds": 120
        },
        {
          "step_number": 3,
          "title": "Slow weight shifting",
          "description": "Very slowly shift weight from one foot to the other, keeping movements small and controlled.",
          "duration_seconds": 180
        },
        {
          "step_number": 4,
          "title": "Simple stepping",
          "description": "Take small steps from one cushion to another, holding onto furniture if needed.",
          "duration_seconds": 120
        },
        {
          "step_number": 5,
          "title": "Rest and relax",
          "description": "Sit down and take a few deep breaths, noticing how the body feels after the balance work.",
          "duration_seconds": 60
        }
      ]
    },
    {
      title: 'Balance Activities - Sensitive',
      newSteps: [
        {
          "step_number": 1,
          "title": "Prepare quiet space",
          "description": "Find a very quiet, calm area. Place a single soft cushion or folded blanket on the floor.",
          "duration_seconds": 60
        },
        {
          "step_number": 2,
          "title": "Gentle standing",
          "description": "Stand on the cushion with both feet, feeling the soft surface beneath you.",
          "duration_seconds": 90
        },
        {
          "step_number": 3,
          "title": "Minimal movement",
          "description": "Make very small, gentle movements - just slight weight shifts from side to side.",
          "duration_seconds": 120
        },
        {
          "step_number": 4,
          "title": "Slow breathing",
          "description": "Take slow, deep breaths while standing, focusing on feeling stable and calm.",
          "duration_seconds": 90
        },
        {
          "step_number": 5,
          "title": "Gentle finish",
          "description": "Step off the cushion and sit down quietly, taking a moment to rest.",
          "duration_seconds": 30
        }
      ]
    },
    {
      title: 'Balance Activities - Low-Registration',
      newSteps: [
        {
          "step_number": 1,
          "title": "Set up challenging course",
          "description": "Create a complex balance course with multiple surfaces, obstacles, and varying heights.",
          "duration_seconds": 120
        },
        {
          "step_number": 2,
          "title": "Intense balance walking",
          "description": "Walk quickly through the course, changing directions rapidly and adding arm movements.",
          "duration_seconds": 300
        },
        {
          "step_number": 3,
          "title": "Dynamic one-legged activities",
          "description": "Stand on one leg while doing jumping jacks, reaching high and low, or catching objects.",
          "duration_seconds": 240
        },
        {
          "step_number": 4,
          "title": "High-energy balance",
          "description": "Jump, spin, and move quickly between balance surfaces, maintaining control throughout.",
          "duration_seconds": 240
        },
        {
          "step_number": 5,
          "title": "Cool down",
          "description": "Slow down gradually with simple walking and stretching movements.",
          "duration_seconds": 90
        }
      ]
    },
    {
      title: 'Balance Activities - Mixed',
      newSteps: [
        {
          "step_number": 1,
          "title": "Assess comfort level",
          "description": "Observe if child seems interested in balance activities or hesitant. Start with simple standing on a cushion.",
          "duration_seconds": 60
        },
        {
          "step_number": 2,
          "title": "Choose appropriate challenge",
          "description": "If child is comfortable, add more cushions or obstacles. If hesitant, keep it simple with just one cushion.",
          "duration_seconds": 60
        },
        {
          "step_number": 3,
          "title": "Adaptive balance walking",
          "description": "Walk on the balance surfaces, adjusting speed and complexity based on child's response.",
          "duration_seconds": 240
        },
        {
          "step_number": 4,
          "title": "Flexible challenges",
          "description": "Add one-legged standing, reaching, or stepping based on what the child can handle comfortably.",
          "duration_seconds": 180
        },
        {
          "step_number": 5,
          "title": "Gradual finish",
          "description": "Slowly reduce the challenge level and end with simple standing or walking.",
          "duration_seconds": 60
        }
      ]
    },
    {
      title: 'Balance Activities - Bedtime',
      newSteps: [
        {
          "step_number": 1,
          "title": "Create calm space",
          "description": "Set up a quiet area with soft lighting. Place a single, comfortable cushion on the floor.",
          "duration_seconds": 60
        },
        {
          "step_number": 2,
          "title": "Gentle standing",
          "description": "Stand quietly on the cushion, feeling the soft surface and taking slow breaths.",
          "duration_seconds": 120
        },
        {
          "step_number": 3,
          "title": "Slow weight shifting",
          "description": "Very slowly shift weight from one foot to the other, keeping movements gentle and calming.",
          "duration_seconds": 180
        },
        {
          "step_number": 4,
          "title": "Quiet breathing",
          "description": "Stand still and focus on slow, deep breathing while maintaining balance.",
          "duration_seconds": 120
        },
        {
          "step_number": 5,
          "title": "Calm finish",
          "description": "Step off the cushion and sit down quietly, ready for bedtime routine.",
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

  console.log('\n🎉 All Balance Activities updated!')
}

fixBalanceActivities() 