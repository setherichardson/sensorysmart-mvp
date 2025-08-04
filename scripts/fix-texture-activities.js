require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixTextureActivities() {
  console.log('🔧 Fixing Texture Exploration Activities with No Steps...\n')

  const activitiesToFix = [
    {
      title: 'Texture Exploration - Seeking',
      newSteps: [
        {
          "step_number": 1,
          "title": "Gather diverse textures",
          "description": "Collect 8-10 different textured items: sandpaper, cotton balls, silk fabric, rough stones, smooth glass, bumpy rubber, soft fur, rough bark, smooth metal, fuzzy fabric.",
          "duration_seconds": 120
        },
        {
          "step_number": 2,
          "title": "Set up exploration station",
          "description": "Arrange all textures on a table or floor. Make sure they're easily accessible and clearly visible.",
          "duration_seconds": 60
        },
        {
          "step_number": 3,
          "title": "Active exploration",
          "description": "Let child touch, rub, and explore each texture. Encourage them to describe what they feel: rough, smooth, bumpy, soft, etc.",
          "duration_seconds": 480
        },
        {
          "step_number": 4,
          "title": "Texture games",
          "description": "Play games like 'find the roughest texture' or 'which one feels the most different?'",
          "duration_seconds": 240
        },
        {
          "step_number": 5,
          "title": "Creative exploration",
          "description": "Let child arrange textures by how they feel, or create patterns with different textures.",
          "duration_seconds": 180
        }
      ]
    },
    {
      title: 'Texture Exploration - Avoiding',
      newSteps: [
        {
          "step_number": 1,
          "title": "Choose familiar textures",
          "description": "Select 3-4 very familiar, comfortable textures: soft blanket, smooth paper, familiar toy, comfortable fabric.",
          "duration_seconds": 60
        },
        {
          "step_number": 2,
          "title": "Set up safe space",
          "description": "Place textures in a quiet, familiar area. Let child see them from a distance first.",
          "duration_seconds": 60
        },
        {
          "step_number": 3,
          "title": "Gentle introduction",
          "description": "Start by just looking at the textures. Let child choose when and how to touch them.",
          "duration_seconds": 180
        },
        {
          "step_number": 4,
          "title": "Optional touching",
          "description": "If child is comfortable, let them touch textures with their fingertips or through fabric.",
          "duration_seconds": 120
        },
        {
          "step_number": 5,
          "title": "Quiet finish",
          "description": "End by just looking at the textures, no pressure to touch if not comfortable.",
          "duration_seconds": 60
        }
      ]
    },
    {
      title: 'Texture Exploration - Sensitive',
      newSteps: [
        {
          "step_number": 1,
          "title": "Select minimal textures",
          "description": "Choose 2-3 very soft, familiar textures: favorite blanket, soft stuffed animal, smooth paper.",
          "duration_seconds": 30
        },
        {
          "step_number": 2,
          "title": "Prepare quiet area",
          "description": "Set up in a very quiet, calm space. Place textures where child can see them without touching.",
          "duration_seconds": 60
        },
        {
          "step_number": 3,
          "title": "Visual exploration",
          "description": "Start by just looking at the textures. Talk quietly about their colors and shapes.",
          "duration_seconds": 120
        },
        {
          "step_number": 4,
          "title": "Very gentle touch",
          "description": "If child wants to, let them touch textures very gently with one finger or through their clothing.",
          "duration_seconds": 90
        },
        {
          "step_number": 5,
          "title": "Quiet observation",
          "description": "End by just sitting quietly and looking at the textures together.",
          "duration_seconds": 60
        }
      ]
    },
    {
      title: 'Texture Exploration - Low-Registration',
      newSteps: [
        {
          "step_number": 1,
          "title": "Gather intense textures",
          "description": "Collect 8-10 very obvious, intense textures: very rough sandpaper, very soft fur, very bumpy rocks, very smooth ice, very sticky tape, very hot/cold items, very prickly objects.",
          "duration_seconds": 120
        },
        {
          "step_number": 2,
          "title": "Set up dramatic station",
          "description": "Arrange textures with lots of visual contrast. Use bright colors and dramatic arrangements.",
          "duration_seconds": 90
        },
        {
          "step_number": 3,
          "title": "Intense exploration",
          "description": "Encourage child to touch textures with lots of energy and excitement. Use dramatic language: 'This is SUPER rough!'",
          "duration_seconds": 480
        },
        {
          "step_number": 4,
          "title": "Texture challenges",
          "description": "Play games like 'find the most extreme texture' or 'which one makes the biggest difference?'",
          "duration_seconds": 300
        },
        {
          "step_number": 5,
          "title": "Celebration finish",
          "description": "Celebrate all the different textures found and explored with lots of excitement.",
          "duration_seconds": 120
        }
      ]
    },
    {
      title: 'Texture Exploration - Mixed',
      newSteps: [
        {
          "step_number": 1,
          "title": "Gather varied textures",
          "description": "Collect 6-8 textures with different intensities: some very obvious, some subtle, some familiar, some new.",
          "duration_seconds": 90
        },
        {
          "step_number": 2,
          "title": "Set up flexible station",
          "description": "Arrange textures so child can choose their comfort level - some easily accessible, some at a distance.",
          "duration_seconds": 60
        },
        {
          "step_number": 3,
          "title": "Adaptive exploration",
          "description": "Let child lead the exploration. If they want to touch everything, encourage it. If they want to just look, that's fine too.",
          "duration_seconds": 360
        },
        {
          "step_number": 4,
          "title": "Flexible interaction",
          "description": "Discuss textures based on child's comfort level. Some might want to describe feelings, others might prefer to just explore.",
          "duration_seconds": 180
        },
        {
          "step_number": 5,
          "title": "Gradual finish",
          "description": "Slow down gradually, letting child choose how to end the exploration.",
          "duration_seconds": 90
        }
      ]
    },
    {
      title: 'Texture Exploration - Bedtime',
      newSteps: [
        {
          "step_number": 1,
          "title": "Choose calming textures",
          "description": "Select 3-4 very soft, calming textures: favorite blanket, soft pillow, smooth fabric, gentle stuffed animal.",
          "duration_seconds": 60
        },
        {
          "step_number": 2,
          "title": "Set up quiet space",
          "description": "Arrange textures in a quiet, dimly lit area. Make sure they're easily accessible.",
          "duration_seconds": 60
        },
        {
          "step_number": 3,
          "title": "Gentle exploration",
          "description": "Let child touch textures very slowly and gently, focusing on the calming, soft feelings.",
          "duration_seconds": 240
        },
        {
          "step_number": 4,
          "title": "Quiet discussion",
          "description": "Talk very softly about how the textures feel, focusing on words like 'soft,' 'gentle,' 'calming.'",
          "duration_seconds": 120
        },
        {
          "step_number": 5,
          "title": "Calm finish",
          "description": "End by holding their favorite soft texture, ready for bedtime.",
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

  console.log('\n🎉 All Texture Exploration Activities updated!')
}

fixTextureActivities() 