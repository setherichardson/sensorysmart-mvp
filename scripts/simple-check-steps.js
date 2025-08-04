require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSteps() {
  console.log('🔍 Checking Activity Steps...\n')

  try {
    // Get all activities
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .order('title')

    if (error) {
      console.error('❌ Error fetching activities:', error)
      return
    }

    console.log(`📊 Found ${activities.length} activities\n`)

    // Look for movement breaks specifically
    const movementBreaks = activities.filter(a => a.title.includes('Movement'))
    
    console.log('🏃 MOVEMENT BREAKS:')
    console.log('==================')
    movementBreaks.forEach(activity => {
      console.log(`\n📝 ${activity.title}`)
      console.log(`   Steps: ${JSON.stringify(activity.steps, null, 2)}`)
    })

    // Check for activities with generic steps
    const genericActivities = activities.filter(activity => {
      if (!activity.steps || !Array.isArray(activity.steps)) return false
      
      const stepText = JSON.stringify(activity.steps).toLowerCase()
      return stepText.includes('check energy') || 
             stepText.includes('generic') ||
             stepText.includes('coming soon') ||
             stepText.length < 100
    })

    console.log('\n❌ GENERIC/INSUFFICIENT ACTIVITIES:')
    console.log('==================================')
    genericActivities.forEach(activity => {
      console.log(`\n📝 ${activity.title}`)
      console.log(`   Steps: ${JSON.stringify(activity.steps, null, 2)}`)
    })

  } catch (err) {
    console.error('❌ Error:', err)
  }
}

checkSteps() 