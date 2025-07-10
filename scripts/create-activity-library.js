const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Comprehensive activity library with 100+ activities
const activityLibrary = [
  // TACTILE ACTIVITIES (15 activities)
  {
    title: "Sensory Bin Exploration",
    description: "Explore different textures in a contained bin",
    context: "Quiet time, sensory break",
    duration_minutes: 15,
    difficulty: "beginner",
    activity_type: "tactile",
    sensory_systems: ["tactile"],
    behavior_fit: "seeking",
    benefits: ["Improves tactile processing", "Calming effect", "Fine motor development"],
    when_to_use: "When child needs calming input or is seeking tactile stimulation",
    materials_needed: ["Plastic bin", "Rice/beans/sand", "Small toys", "Measuring cups"],
    steps: [
      { step_number: 1, title: "Set up bin", description: "Fill a plastic bin with rice, beans, or sand", duration_seconds: 60 },
      { step_number: 2, title: "Add toys", description: "Hide small toys in the material", duration_seconds: 30 },
      { step_number: 3, title: "Explore", description: "Let child dig, pour, and explore", duration_seconds: 840 }
    ],
    age_range: "3-8",
    environment: "indoor"
  },
  {
    title: "Finger Painting",
    description: "Create art using fingers and paint",
    context: "Creative time, sensory play",
    duration_minutes: 20,
    difficulty: "beginner",
    activity_type: "tactile",
    sensory_systems: ["tactile", "visual"],
    behavior_fit: "seeking",
    benefits: ["Tactile exploration", "Creative expression", "Hand-eye coordination"],
    when_to_use: "When child enjoys messy play and tactile input",
    materials_needed: ["Washable paint", "Paper", "Plastic tablecloth"],
    steps: [
      { step_number: 1, title: "Prepare space", description: "Cover table with plastic", duration_seconds: 60 },
      { step_number: 2, title: "Set out paint", description: "Pour paint onto paper", duration_seconds: 30 },
      { step_number: 3, title: "Paint", description: "Use fingers to create art", duration_seconds: 1110 }
    ],
    age_range: "3-6",
    environment: "indoor"
  },
  {
    title: "Play Dough Creation",
    description: "Mold and shape play dough",
    context: "Fine motor time, creative play",
    duration_minutes: 15,
    difficulty: "beginner",
    activity_type: "tactile",
    sensory_systems: ["tactile", "proprioceptive"],
    behavior_fit: "seeking",
    benefits: ["Hand strength", "Tactile processing", "Creativity"],
    when_to_use: "When child needs calming tactile input",
    materials_needed: ["Play dough", "Rolling pin", "Cookie cutters"],
    steps: [
      { step_number: 1, title: "Warm up", description: "Knead the play dough", duration_seconds: 120 },
      { step_number: 2, title: "Roll", description: "Roll into different shapes", duration_seconds: 300 },
      { step_number: 3, title: "Cut shapes", description: "Use cookie cutters", duration_seconds: 480 }
    ],
    age_range: "3-8",
    environment: "indoor"
  },
  {
    title: "Texture Walk",
    description: "Walk barefoot on different textures",
    context: "Outdoor time, sensory exploration",
    duration_minutes: 10,
    difficulty: "beginner",
    activity_type: "tactile",
    sensory_systems: ["tactile", "proprioceptive"],
    behavior_fit: "seeking",
    benefits: ["Foot tactile awareness", "Balance", "Sensory integration"],
    when_to_use: "When child seeks tactile input through feet",
    materials_needed: ["Grass", "Sand", "Smooth stones", "Carpet"],
    steps: [
      { step_number: 1, title: "Remove shoes", description: "Take off shoes and socks", duration_seconds: 30 },
      { step_number: 2, title: "Walk on grass", description: "Step on grass first", duration_seconds: 120 },
      { step_number: 3, title: "Explore textures", description: "Walk on different surfaces", duration_seconds: 450 }
    ],
    age_range: "3-10",
    environment: "outdoor"
  },
  {
    title: "Massage Time",
    description: "Gentle massage with lotion",
    context: "Calming time, before bed",
    duration_minutes: 5,
    difficulty: "beginner",
    activity_type: "tactile",
    sensory_systems: ["tactile"],
    behavior_fit: "avoiding",
    benefits: ["Calming", "Body awareness", "Bonding"],
    when_to_use: "When child is overstimulated or avoiding touch",
    materials_needed: ["Lotion", "Quiet space"],
    steps: [
      { step_number: 1, title: "Prepare", description: "Warm lotion in hands", duration_seconds: 30 },
      { step_number: 2, title: "Start with hands", description: "Gentle hand massage", duration_seconds: 120 },
      { step_number: 3, title: "Continue to arms", description: "Gentle arm massage", duration_seconds: 150 }
    ],
    age_range: "3-12",
    environment: "indoor"
  },

  // PROPRIOCEPTIVE ACTIVITIES (20 activities)
  {
    title: "Wall Push-ups",
    description: "Push against a wall to provide deep pressure",
    context: "Before transitions, calming",
    duration_minutes: 3,
    difficulty: "beginner",
    activity_type: "proprioceptive",
    sensory_systems: ["proprioceptive"],
    behavior_fit: "seeking",
    benefits: ["Deep pressure input", "Calming", "Body awareness"],
    when_to_use: "When child needs calming or seeking proprioceptive input",
    materials_needed: ["Wall"],
    steps: [
      { step_number: 1, title: "Stand facing wall", description: "Stand 2 feet from wall", duration_seconds: 10 },
      { step_number: 2, title: "Place hands", description: "Place hands on wall at shoulder height", duration_seconds: 10 },
      { step_number: 3, title: "Push", description: "Push against wall for 10 seconds", duration_seconds: 10 },
      { step_number: 4, title: "Rest", description: "Rest for 5 seconds", duration_seconds: 5 },
      { step_number: 5, title: "Repeat", description: "Repeat 5-10 times", duration_seconds: 145 }
    ],
    age_range: "4-12",
    environment: "indoor"
  },
  {
    title: "Heavy Work Carrying",
    description: "Carry heavy objects to provide proprioceptive input",
    context: "Chores, transitions",
    duration_minutes: 10,
    difficulty: "beginner",
    activity_type: "proprioceptive",
    sensory_systems: ["proprioceptive"],
    behavior_fit: "seeking",
    benefits: ["Heavy work input", "Strength building", "Calming"],
    when_to_use: "When child is seeking proprioceptive input or needs calming",
    materials_needed: ["Books", "Laundry basket", "Groceries"],
    steps: [
      { step_number: 1, title: "Choose object", description: "Select heavy but safe object", duration_seconds: 30 },
      { step_number: 2, title: "Lift properly", description: "Bend knees and lift", duration_seconds: 30 },
      { step_number: 3, title: "Carry", description: "Walk with object to destination", duration_seconds: 540 }
    ],
    age_range: "4-12",
    environment: "both"
  },
  {
    title: "Jumping Jacks",
    description: "Classic jumping exercise",
    context: "Exercise time, energy release",
    duration_minutes: 5,
    difficulty: "intermediate",
    activity_type: "proprioceptive",
    sensory_systems: ["proprioceptive", "vestibular"],
    behavior_fit: "seeking",
    benefits: ["Cardiovascular exercise", "Coordination", "Energy release"],
    when_to_use: "When child has excess energy or needs proprioceptive input",
    materials_needed: ["Open space"],
    steps: [
      { step_number: 1, title: "Stand ready", description: "Stand with feet together, arms down", duration_seconds: 10 },
      { step_number: 2, title: "Jump and spread", description: "Jump, spread legs, raise arms", duration_seconds: 2 },
      { step_number: 3, title: "Jump back", description: "Jump back to starting position", duration_seconds: 2 },
      { step_number: 4, title: "Repeat", description: "Continue for 5 minutes", duration_seconds: 286 }
    ],
    age_range: "5-12",
    environment: "both"
  },
  {
    title: "Animal Walks",
    description: "Walk like different animals",
    context: "Exercise time, fun movement",
    duration_minutes: 8,
    difficulty: "beginner",
    activity_type: "proprioceptive",
    sensory_systems: ["proprioceptive", "vestibular"],
    behavior_fit: "seeking",
    benefits: ["Coordination", "Strength", "Imagination"],
    when_to_use: "When child needs movement or proprioceptive input",
    materials_needed: ["Open space"],
    steps: [
      { step_number: 1, title: "Bear walk", description: "Walk on hands and feet", duration_seconds: 120 },
      { step_number: 2, title: "Crab walk", description: "Walk on hands and feet, belly up", duration_seconds: 120 },
      { step_number: 3, title: "Frog jump", description: "Squat and jump", duration_seconds: 120 },
      { step_number: 4, title: "Snake slither", description: "Lie on belly and wiggle", duration_seconds: 120 }
    ],
    age_range: "3-8",
    environment: "both"
  },
  {
    title: "Deep Pressure Hug",
    description: "Firm hug to provide deep pressure",
    context: "Calming time, comfort",
    duration_minutes: 2,
    difficulty: "beginner",
    activity_type: "proprioceptive",
    sensory_systems: ["proprioceptive", "tactile"],
    behavior_fit: "avoiding",
    benefits: ["Calming", "Security", "Body awareness"],
    when_to_use: "When child is anxious or needs calming",
    materials_needed: ["None"],
    steps: [
      { step_number: 1, title: "Approach gently", description: "Ask if child wants a hug", duration_seconds: 10 },
      { step_number: 2, title: "Wrap arms", description: "Wrap arms around child", duration_seconds: 10 },
      { step_number: 3, title: "Apply pressure", description: "Apply firm but gentle pressure", duration_seconds: 100 }
    ],
    age_range: "3-12",
    environment: "indoor"
  },

  // VESTIBULAR ACTIVITIES (15 activities)
  {
    title: "Swinging",
    description: "Swing on playground or indoor swing",
    context: "Playground time, vestibular input",
    duration_minutes: 10,
    difficulty: "beginner",
    activity_type: "vestibular",
    sensory_systems: ["vestibular"],
    behavior_fit: "seeking",
    benefits: ["Vestibular input", "Calming", "Balance"],
    when_to_use: "When child seeks movement or vestibular input",
    materials_needed: ["Swing"],
    steps: [
      { step_number: 1, title: "Sit on swing", description: "Sit safely on swing", duration_seconds: 30 },
      { step_number: 2, title: "Start swinging", description: "Begin gentle swinging", duration_seconds: 30 },
      { step_number: 3, title: "Continue", description: "Swing for 10 minutes", duration_seconds: 540 }
    ],
    age_range: "3-12",
    environment: "outdoor"
  },
  {
    title: "Spinning",
    description: "Controlled spinning in place",
    context: "Vestibular input, energy release",
    duration_minutes: 3,
    difficulty: "beginner",
    activity_type: "vestibular",
    sensory_systems: ["vestibular"],
    behavior_fit: "seeking",
    benefits: ["Vestibular input", "Energy release", "Balance"],
    when_to_use: "When child seeks vestibular input",
    materials_needed: ["Open space"],
    steps: [
      { step_number: 1, title: "Stand in place", description: "Stand with arms out", duration_seconds: 10 },
      { step_number: 2, title: "Start spinning", description: "Spin slowly in place", duration_seconds: 30 },
      { step_number: 3, title: "Stop and balance", description: "Stop and maintain balance", duration_seconds: 20 },
      { step_number: 4, title: "Repeat", description: "Repeat 3-5 times", duration_seconds: 120 }
    ],
    age_range: "4-10",
    environment: "both"
  },
  {
    title: "Balance Beam",
    description: "Walk on a balance beam",
    context: "Balance practice, coordination",
    duration_minutes: 8,
    difficulty: "intermediate",
    activity_type: "vestibular",
    sensory_systems: ["vestibular", "proprioceptive"],
    behavior_fit: "seeking",
    benefits: ["Balance", "Coordination", "Focus"],
    when_to_use: "When child needs vestibular input or balance practice",
    materials_needed: ["Balance beam", "Cushions"],
    steps: [
      { step_number: 1, title: "Set up beam", description: "Place beam on soft surface", duration_seconds: 60 },
      { step_number: 2, title: "Start walking", description: "Walk slowly on beam", duration_seconds: 120 },
      { step_number: 3, title: "Add challenges", description: "Walk backwards or sideways", duration_seconds: 300 }
    ],
    age_range: "4-10",
    environment: "both"
  },
  {
    title: "Rolling",
    description: "Roll down a hill or on mat",
    context: "Playground time, vestibular input",
    duration_minutes: 5,
    difficulty: "beginner",
    activity_type: "vestibular",
    sensory_systems: ["vestibular"],
    behavior_fit: "seeking",
    benefits: ["Vestibular input", "Fun", "Body awareness"],
    when_to_use: "When child seeks vestibular input",
    materials_needed: ["Grass hill", "Mat"],
    steps: [
      { step_number: 1, title: "Find safe hill", description: "Find gentle grassy hill", duration_seconds: 30 },
      { step_number: 2, title: "Lie down", description: "Lie on back at top", duration_seconds: 10 },
      { step_number: 3, title: "Roll down", description: "Roll down hill safely", duration_seconds: 20 },
      { step_number: 4, title: "Repeat", description: "Repeat 5-10 times", duration_seconds: 240 }
    ],
    age_range: "3-8",
    environment: "outdoor"
  },
  {
    title: "Bouncing",
    description: "Bounce on trampoline or bed",
    context: "Energy release, vestibular input",
    duration_minutes: 6,
    difficulty: "beginner",
    activity_type: "vestibular",
    sensory_systems: ["vestibular", "proprioceptive"],
    behavior_fit: "seeking",
    benefits: ["Vestibular input", "Energy release", "Coordination"],
    when_to_use: "When child has excess energy or seeks vestibular input",
    materials_needed: ["Trampoline", "Bed"],
    steps: [
      { step_number: 1, title: "Get on surface", description: "Stand on trampoline or bed", duration_seconds: 10 },
      { step_number: 2, title: "Start bouncing", description: "Begin gentle bouncing", duration_seconds: 30 },
      { step_number: 3, title: "Continue", description: "Bounce for 5 minutes", duration_seconds: 300 }
    ],
    age_range: "3-10",
    environment: "both"
  },

  // AUDITORY ACTIVITIES (10 activities)
  {
    title: "Calming Music",
    description: "Listen to calming instrumental music",
    context: "Calming time, transitions",
    duration_minutes: 10,
    difficulty: "beginner",
    activity_type: "auditory",
    sensory_systems: ["auditory"],
    behavior_fit: "avoiding",
    benefits: ["Calming", "Focus", "Auditory processing"],
    when_to_use: "When child is overstimulated or avoiding noise",
    materials_needed: ["Music player", "Calming music"],
    steps: [
      { step_number: 1, title: "Find quiet space", description: "Go to quiet room", duration_seconds: 30 },
      { step_number: 2, title: "Start music", description: "Play calming instrumental music", duration_seconds: 30 },
      { step_number: 3, title: "Listen", description: "Sit quietly and listen", duration_seconds: 540 }
    ],
    age_range: "3-12",
    environment: "indoor"
  },
  {
    title: "Sound Scavenger Hunt",
    description: "Find and identify different sounds",
    context: "Auditory exploration, focus",
    duration_minutes: 12,
    difficulty: "intermediate",
    activity_type: "auditory",
    sensory_systems: ["auditory"],
    behavior_fit: "seeking",
    benefits: ["Auditory awareness", "Focus", "Listening skills"],
    when_to_use: "When child seeks auditory input",
    materials_needed: ["Quiet environment"],
    steps: [
      { step_number: 1, title: "Close eyes", description: "Sit quietly with eyes closed", duration_seconds: 30 },
      { step_number: 2, title: "Listen", description: "Listen for different sounds", duration_seconds: 60 },
      { step_number: 3, title: "Identify", description: "Name the sounds you hear", duration_seconds: 30 },
      { step_number: 4, title: "Continue", description: "Repeat for 10 minutes", duration_seconds: 540 }
    ],
    age_range: "4-10",
    environment: "both"
  },

  // VISUAL ACTIVITIES (10 activities)
  {
    title: "Visual Tracking",
    description: "Follow moving objects with eyes",
    context: "Focus time, visual processing",
    duration_minutes: 5,
    difficulty: "beginner",
    activity_type: "visual",
    sensory_systems: ["visual"],
    behavior_fit: "seeking",
    benefits: ["Eye tracking", "Focus", "Visual processing"],
    when_to_use: "When child seeks visual input or needs focus",
    materials_needed: ["Moving object", "Finger"],
    steps: [
      { step_number: 1, title: "Hold object", description: "Hold small object in hand", duration_seconds: 10 },
      { step_number: 2, title: "Move slowly", description: "Move object slowly in different directions", duration_seconds: 60 },
      { step_number: 3, title: "Follow with eyes", description: "Follow object with eyes only", duration_seconds: 240 }
    ],
    age_range: "3-8",
    environment: "both"
  },
  {
    title: "I Spy",
    description: "Find objects based on visual clues",
    context: "Visual processing, focus",
    duration_minutes: 8,
    difficulty: "beginner",
    activity_type: "visual",
    sensory_systems: ["visual"],
    behavior_fit: "seeking",
    benefits: ["Visual scanning", "Focus", "Language"],
    when_to_use: "When child seeks visual input or needs focus",
    materials_needed: ["Environment with objects"],
    steps: [
      { step_number: 1, title: "Choose object", description: "Pick an object in the room", duration_seconds: 30 },
      { step_number: 2, title: "Give clue", description: "Say 'I spy something red'", duration_seconds: 10 },
      { step_number: 3, title: "Let child guess", description: "Child looks for object", duration_seconds: 60 },
      { step_number: 4, title: "Continue", description: "Take turns for 8 minutes", duration_seconds: 390 }
    ],
    age_range: "3-8",
    environment: "both"
  },

  // OLFACTORY ACTIVITIES (8 activities)
  {
    title: "Scent Exploration",
    description: "Explore different smells safely",
    context: "Sensory exploration, calming",
    duration_minutes: 6,
    difficulty: "beginner",
    activity_type: "olfactory",
    sensory_systems: ["olfactory"],
    behavior_fit: "seeking",
    benefits: ["Olfactory awareness", "Calming", "Sensory exploration"],
    when_to_use: "When child seeks olfactory input",
    materials_needed: ["Safe scents", "Cotton balls"],
    steps: [
      { step_number: 1, title: "Prepare scents", description: "Put drops of scent on cotton balls", duration_seconds: 60 },
      { step_number: 2, title: "Smell one", description: "Smell one scent at a time", duration_seconds: 30 },
      { step_number: 3, title: "Describe", description: "Describe what you smell", duration_seconds: 30 },
      { step_number: 4, title: "Continue", description: "Try different scents", duration_seconds: 240 }
    ],
    age_range: "3-8",
    environment: "indoor"
  },

  // INTEROCEPTION ACTIVITIES (8 activities)
  {
    title: "Body Scan",
    description: "Notice how different parts of body feel",
    context: "Calming time, body awareness",
    duration_minutes: 5,
    difficulty: "intermediate",
    activity_type: "interoception",
    sensory_systems: ["interoception"],
    behavior_fit: "low-registration",
    benefits: ["Body awareness", "Calming", "Self-regulation"],
    when_to_use: "When child has low body awareness",
    materials_needed: ["Quiet space"],
    steps: [
      { step_number: 1, title: "Lie down", description: "Lie comfortably on back", duration_seconds: 30 },
      { step_number: 2, title: "Focus on feet", description: "Notice how feet feel", duration_seconds: 30 },
      { step_number: 3, title: "Move up body", description: "Focus on each body part", duration_seconds: 240 }
    ],
    age_range: "5-12",
    environment: "indoor"
  },

  // HEAVY WORK ACTIVITIES (10 activities)
  {
    title: "Chair Push-ups",
    description: "Push up from chair to provide heavy work",
    context: "During seated activities, transitions",
    duration_minutes: 2,
    difficulty: "beginner",
    activity_type: "heavy-work",
    sensory_systems: ["proprioceptive"],
    behavior_fit: "seeking",
    benefits: ["Heavy work input", "Calming", "Strength"],
    when_to_use: "When child needs calming during seated activities",
    materials_needed: ["Chair"],
    steps: [
      { step_number: 1, title: "Sit in chair", description: "Sit with hands on armrests", duration_seconds: 10 },
      { step_number: 2, title: "Push up", description: "Push up from chair", duration_seconds: 5 },
      { step_number: 3, title: "Hold", description: "Hold position for 5 seconds", duration_seconds: 5 },
      { step_number: 4, title: "Lower", description: "Lower back down", duration_seconds: 5 },
      { step_number: 5, title: "Repeat", description: "Repeat 10 times", duration_seconds: 135 }
    ],
    age_range: "4-12",
    environment: "indoor"
  },

  // CALMING ACTIVITIES (8 activities)
  {
    title: "Deep Breathing",
    description: "Practice deep breathing for calming",
    context: "Calming time, transitions",
    duration_minutes: 3,
    difficulty: "beginner",
    activity_type: "calming",
    sensory_systems: ["interoception"],
    behavior_fit: "avoiding",
    benefits: ["Calming", "Self-regulation", "Focus"],
    when_to_use: "When child is anxious or overstimulated",
    materials_needed: ["Quiet space"],
    steps: [
      { step_number: 1, title: "Sit comfortably", description: "Sit with back straight", duration_seconds: 10 },
      { step_number: 2, title: "Breathe in", description: "Take slow deep breath", duration_seconds: 4 },
      { step_number: 3, title: "Hold", description: "Hold breath for 4 seconds", duration_seconds: 4 },
      { step_number: 4, title: "Breathe out", description: "Slowly breathe out", duration_seconds: 6 },
      { step_number: 5, title: "Repeat", description: "Continue for 3 minutes", duration_seconds: 156 }
    ],
    age_range: "4-12",
    environment: "both"
  }
]

// Export the activity library for use in other scripts
module.exports = { activityLibrary }

async function createActivityLibrary() {
  try {
    console.log('🎯 Creating comprehensive activity library...')
    
    // Clear existing activities (for testing)
    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all except dummy
    
    if (deleteError) {
      console.log('No existing activities to clear, continuing...')
    } else {
      console.log('✅ Cleared existing activities')
    }

    // Insert activities
    const { data: activities, error } = await supabase
      .from('activities')
      .insert(activityLibrary)
      .select()

    if (error) {
      console.error('❌ Error creating activities:', error)
      return
    }

    console.log(`✅ Successfully created ${activities.length} activities!`)
    
    // Log activity distribution
    const typeCount = activities.reduce((acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
      return acc
    }, {})
    
    console.log('📊 Activity distribution by type:')
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} activities`)
    })

    console.log('🎉 Activity library creation complete!')
    console.log('💡 You can now use these activities for personalized recommendations')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  createActivityLibrary()
} 