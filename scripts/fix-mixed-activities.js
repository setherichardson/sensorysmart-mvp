require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixMixedActivities() {
  console.log('🔧 Fixing Mixed Activities with Generic Steps...\n')

  const activitiesToFix = [
    {
      title: 'Breathing Exercises - Mixed',
      newSteps: [
        {
          "step_number": 1,
          "title": "Find comfortable position",
          "description": "Sit or lie down in a comfortable position. Make sure the child is relaxed and not slouched.",
          "duration_seconds": 30
        },
        {
          "step_number": 2,
          "title": "Start with belly breathing",
          "description": "Place hands on belly. Breathe in slowly through nose, feel belly rise. Breathe out slowly through mouth, feel belly fall.",
          "duration_seconds": 60
        },
        {
          "step_number": 3,
          "title": "Add counting",
          "description": "Breathe in for 4 counts, hold for 2, breathe out for 4 counts. Repeat 5 times.",
          "duration_seconds": 90
        },
        {
          "step_number": 4,
          "title": "Gentle movement breathing",
          "description": "Add gentle arm movements: raise arms on inhale, lower on exhale. Keep breathing slow and steady.",
          "duration_seconds": 120
        },
        {
          "step_number": 5,
          "title": "Cool down",
          "description": "Return to simple belly breathing for 1-2 minutes. Notice how the body feels more relaxed.",
          "duration_seconds": 90
        }
      ],
      newDescription: "Adaptable breathing exercises that can be adjusted based on your child's current needs and energy level",
      newWhenToUse: "When child needs to calm down or regulate their breathing. Perfect for mixed sensory profiles or when you're unsure of the right breathing intensity."
    },
    {
      title: 'Gentle Rocking - Mixed',
      newSteps: [
        {
          "step_number": 1,
          "title": "Choose rocking surface",
          "description": "Select a comfortable rocking chair, exercise ball, or create a gentle swing with blankets. Ensure it's stable and safe.",
          "duration_seconds": 60
        },
        {
          "step_number": 2,
          "title": "Start very slowly",
          "description": "Begin with very gentle, slow rocking motion. Rock forward and back in a smooth, rhythmic pattern.",
          "duration_seconds": 120
        },
        {
          "step_number": 3,
          "title": "Add gentle music",
          "description": "Play soft, calming music or sing a gentle lullaby to enhance the calming effect of the rocking.",
          "duration_seconds": 180
        },
        {
          "step_number": 4,
          "title": "Adjust intensity",
          "description": "If child seems to need more input, slightly increase the rocking speed. If they seem overwhelmed, slow down further.",
          "duration_seconds": 180
        },
        {
          "step_number": 5,
          "title": "Gradual stop",
          "description": "Slowly reduce the rocking motion until it stops completely. Allow child to sit quietly for a moment.",
          "duration_seconds": 60
        }
      ],
      newDescription: "Flexible rocking activities that can be adapted to your child's vestibular sensitivity and current needs",
      newWhenToUse: "When child needs vestibular input but you're unsure of the right intensity. Perfect for mixed sensory profiles or when sensitivity varies."
    },
    {
      title: 'Heavy Work Stations - Mixed',
      newSteps: [
        {
          "step_number": 1,
          "title": "Set up stations",
          "description": "Create 3-4 different heavy work stations around the room: carrying books, pushing chairs, lifting laundry basket, wall pushes.",
          "duration_seconds": 120
        },
        {
          "step_number": 2,
          "title": "Start with light work",
          "description": "Begin with lighter activities like carrying 2-3 books or pushing a small chair. Observe child's response.",
          "duration_seconds": 180
        },
        {
          "step_number": 3,
          "title": "Rotate through stations",
          "description": "Move between stations every 2-3 minutes. Try wall pushes, carrying heavier items, or pushing larger furniture.",
          "duration_seconds": 300
        },
        {
          "step_number": 4,
          "title": "Adjust intensity",
          "description": "If child seems to need more input, add more weight or resistance. If they seem tired, reduce the intensity.",
          "duration_seconds": 180
        },
        {
          "step_number": 5,
          "title": "Cool down",
          "description": "End with lighter activities like gentle stretching or slow walking around the room.",
          "duration_seconds": 120
        }
      ],
      newDescription: "Adaptable heavy work activities that can be adjusted based on your child's current energy and proprioceptive needs",
      newWhenToUse: "When child needs deep pressure input but you're unsure of the right intensity. Perfect for mixed sensory profiles or varying energy levels."
    },
    {
      title: 'Visual Tracking - Mixed',
      newSteps: [
        {
          "step_number": 1,
          "title": "Choose tracking object",
          "description": "Select a colorful, interesting object like a small toy, flashlight, or bubble wand. Make sure it's easy to see.",
          "duration_seconds": 30
        },
        {
          "step_number": 2,
          "title": "Start with simple tracking",
          "description": "Hold the object 12-18 inches from child's face. Move it slowly left to right, then up and down.",
          "duration_seconds": 120
        },
        {
          "step_number": 3,
          "title": "Add complexity",
          "description": "Move the object in circles, figure-8 patterns, or diagonal lines. Keep movements smooth and predictable.",
          "duration_seconds": 180
        },
        {
          "step_number": 4,
          "title": "Adjust speed and distance",
          "description": "If child is tracking well, move the object faster or further away. If they're struggling, slow down and bring it closer.",
          "duration_seconds": 180
        },
        {
          "step_number": 5,
          "title": "Cool down",
          "description": "End with slow, gentle movements and gradually stop. Allow child's eyes to rest for a moment.",
          "duration_seconds": 60
        }
      ],
      newDescription: "Adaptable visual tracking activities that can be adjusted based on your child's visual processing needs",
      newWhenToUse: "When child needs visual input but you're unsure of the right intensity. Perfect for mixed sensory profiles or varying visual sensitivity."
    }
  ]

  for (const activity of activitiesToFix) {
    try {
      console.log(`🔧 Fixing: ${activity.title}`)
      
      // Update the activity
      const { data: updatedActivity, error: updateError } = await supabase
        .from('activities')
        .update({ 
          steps: activity.newSteps,
          description: activity.newDescription,
          when_to_use: activity.newWhenToUse
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

  console.log('\n🎉 All Mixed activities updated!')
}

fixMixedActivities() 