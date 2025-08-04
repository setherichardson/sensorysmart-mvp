require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkActivitySteps() {
  console.log('🔍 Checking Activity Steps Content...\n')

  try {
    // Get all activities with their steps
    const { data: activities, error } = await supabase
      .from('activities')
      .select('title, steps, behavior_types, activity_type')
      .order('title')

    if (error) {
      console.error('❌ Error fetching activities:', error)
      return
    }

    console.log(`📊 Found ${activities.length} activities\n`)

    // Check for activities with missing or generic steps
    const problematicActivities = []
    const goodActivities = []

    activities.forEach(activity => {
      const steps = activity.steps
      
      if (!steps || !Array.isArray(steps) || steps.length === 0) {
        problematicActivities.push({
          title: activity.title,
          issue: 'No steps array',
          behavior_types: activity.behavior_types,
          activity_type: activity.activity_type
        })
      } else {
        // Check if steps are generic
        const stepTexts = steps.map(step => step.description || step.instruction || '').join(' ').toLowerCase()
        
        if (stepTexts.includes('check energy') || 
            stepTexts.includes('generic') ||
            stepTexts.includes('coming soon') ||
            stepTexts.length < 50) {
          problematicActivities.push({
            title: activity.title,
            issue: 'Generic or insufficient steps',
            steps: steps,
            behavior_types: activity.behavior_types,
            activity_type: activity.activity_type
          })
        } else {
          goodActivities.push({
            title: activity.title,
            steps_count: steps.length,
            behavior_types: activity.behavior_types,
            activity_type: activity.activity_type
          })
        }
      }
    })

    console.log('❌ PROBLEMATIC ACTIVITIES:')
    console.log('========================')
    problematicActivities.forEach(activity => {
          console.log(`\n📝 ${activity.title}`)
    console.log(`   Behavior: ${activity.behavior_types}`)
    console.log(`   Type: ${activity.activity_type}`)
    console.log(`   Issue: ${activity.issue}`)
      if (activity.steps) {
        console.log(`   Steps: ${JSON.stringify(activity.steps, null, 2)}`)
      }
    })

    console.log('\n✅ GOOD ACTIVITIES:')
    console.log('==================')
    goodActivities.forEach(activity => {
          console.log(`\n📝 ${activity.title}`)
    console.log(`   Behavior: ${activity.behavior_types}`)
    console.log(`   Type: ${activity.activity_type}`)
    console.log(`   Steps: ${activity.steps_count}`)
    })

    console.log(`\n📈 SUMMARY:`)
    console.log(`   Total activities: ${activities.length}`)
    console.log(`   Good activities: ${goodActivities.length}`)
    console.log(`   Problematic activities: ${problematicActivities.length}`)

  } catch (err) {
    console.error('❌ Error:', err)
  }
}

checkActivitySteps() 