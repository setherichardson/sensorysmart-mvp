const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addSampleActivities() {
  try {
    // First, get a user to add activities for
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (userError || !users || users.length === 0) {
      console.error('No users found. Please create a user first.')
      return
    }

    const userId = users[0].id
    console.log(`Adding sample activities for user: ${userId}`)

    // Sample activities with different dates
    const sampleActivities = [
      {
        user_id: userId,
        activity_name: 'Sensory Bin Play',
        activity_type: 'tactile',
        rating: 'worked',
        duration_minutes: 15,
        completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
      },
      {
        user_id: userId,
        activity_name: 'Jumping Jacks',
        activity_type: 'proprioceptive',
        rating: 'didnt_work',
        duration_minutes: 3,
        completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        user_id: userId,
        activity_name: 'Calming Music',
        activity_type: 'calming',
        rating: 'worked',
        duration_minutes: 10,
        completed_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
      },
      {
        user_id: userId,
        activity_name: 'Fidget Toy Time',
        activity_type: 'tactile',
        rating: 'neutral',
        duration_minutes: 8,
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        user_id: userId,
        activity_name: 'Wall Push-ups',
        activity_type: 'heavy-work',
        rating: 'worked',
        duration_minutes: 5,
        completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      },
      {
        user_id: userId,
        activity_name: 'Swinging',
        activity_type: 'vestibular',
        rating: 'worked',
        duration_minutes: 12,
        completed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
      },
      {
        user_id: userId,
        activity_name: 'Visual Tracking',
        activity_type: 'tactile',
        rating: 'neutral',
        duration_minutes: 6,
        completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
      },
      {
        user_id: userId,
        activity_name: 'Deep Pressure Hug',
        activity_type: 'proprioceptive',
        rating: 'worked',
        duration_minutes: 2,
        completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days ago
      },
      {
        user_id: userId,
        activity_name: 'Loud Noises',
        activity_type: 'calming',
        rating: 'didnt_work',
        duration_minutes: 1,
        completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
      },
      {
        user_id: userId,
        activity_name: 'Weighted Blanket',
        activity_type: 'calming',
        rating: 'worked',
        duration_minutes: 20,
        completed_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 days ago
      }
    ]

    // Insert the sample activities
    const { data, error } = await supabase
      .from('activity_completions')
      .insert(sampleActivities)

    if (error) {
      console.error('Error inserting sample activities:', error)
      return
    }

    console.log(`✅ Successfully added ${sampleActivities.length} sample activities!`)
    console.log('Sample activities include:')
    sampleActivities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.activity_name} (${activity.activity_type}) - ${activity.rating}`)
    })

  } catch (error) {
    console.error('Error:', error)
  }
}

addSampleActivities() 