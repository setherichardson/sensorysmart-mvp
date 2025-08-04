require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixMovementBreaksMixed() {
  console.log('🔧 Fixing Movement Breaks - Mixed activity...\n')

  try {
    // First, let's see the current activity
    const { data: currentActivity, error: fetchError } = await supabase
      .from('activities')
      .select('*')
      .eq('title', 'Movement Breaks - Mixed')
      .single()

    if (fetchError) {
      console.error('❌ Error fetching activity:', fetchError)
      return
    }

    console.log('📝 Current activity:', currentActivity.title)
    console.log('Current steps:', JSON.stringify(currentActivity.steps, null, 2))

    // Create proper detailed steps
    const newSteps = [
      {
        "step_number": 1,
        "title": "Check energy level",
        "description": "Observe if child is hyperactive (bouncing off walls) or sluggish (dragging feet). Look for signs like fidgeting, yawning, or restlessness.",
        "duration_seconds": 30
      },
      {
        "step_number": 2,
        "title": "Choose appropriate movement",
        "description": "For high energy: gentle activities like slow walking or stretching. For low energy: energizing activities like jumping or dancing.",
        "duration_seconds": 30
      },
      {
        "step_number": 3,
        "title": "Start with warm-up",
        "description": "Begin with 5-10 gentle stretches or arm circles to prepare the body for movement.",
        "duration_seconds": 60
      },
      {
        "step_number": 4,
        "title": "Main movement activity",
        "description": "High energy: Slow walking around room, gentle yoga poses, or quiet animal walks. Low energy: Jumping jacks, dancing to music, or obstacle course.",
        "duration_seconds": 300
      },
      {
        "step_number": 5,
        "title": "Cool down",
        "description": "Gradually slow down with 2-3 minutes of gentle stretching or slow breathing exercises.",
        "duration_seconds": 120
      },
      {
        "step_number": 6,
        "title": "Check regulation",
        "description": "Observe if child seems more regulated (calm but alert) or if they need more movement. Adjust next time based on what worked.",
        "duration_seconds": 30
      }
    ]

    // Update the activity
    const { data: updatedActivity, error: updateError } = await supabase
      .from('activities')
      .update({ 
        steps: newSteps,
        description: "Flexible movement breaks that adapt to your child's current energy level and needs",
        when_to_use: "When child needs movement but you're unsure of the right intensity. Perfect for mixed sensory profiles or when energy levels vary throughout the day."
      })
      .eq('title', 'Movement Breaks - Mixed')
      .select()

    if (updateError) {
      console.error('❌ Error updating activity:', updateError)
      return
    }

    console.log('✅ Successfully updated Movement Breaks - Mixed!')
    console.log('New steps:', JSON.stringify(newSteps, null, 2))

  } catch (err) {
    console.error('❌ Error:', err)
  }
}

fixMovementBreaksMixed() 