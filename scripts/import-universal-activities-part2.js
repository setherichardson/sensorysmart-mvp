const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Import the universal activities part 2
const universalActivities = require('../lib/universal-sensory-activities-part2.json')

async function importUniversalActivitiesPart2() {
  console.log('🚀 Starting import of universal sensory activities part 2...')
  console.log(`📊 Found ${universalActivities.length} activities to import`)

  let successCount = 0
  let errorCount = 0

  for (const activity of universalActivities) {
    try {
      // Map the activity to the actual database schema
      const mappedActivity = {
        title: activity.title,
        description: activity.description,
        duration_minutes: activity.duration_minutes,
        difficulty: activity.difficulty,
        sensory_systems: activity.sensory_systems,
        behavior_types: [activity.behavior_fit], // Convert to array
        benefits: activity.benefits,
        when_to_use: activity.when_to_use,
        materials: activity.materials_needed,
        steps: activity.steps,
        age_range: activity.age_range,
        environment: activity.environment
      }

      const { data, error } = await supabase
        .from('activities')
        .insert([mappedActivity])

      if (error) {
        console.error(`❌ Error importing "${activity.title}":`, error.message)
        errorCount++
      } else {
        console.log(`✅ Successfully imported: ${activity.title}`)
        successCount++
      }
    } catch (err) {
      console.error(`❌ Exception importing "${activity.title}":`, err.message)
      errorCount++
    }
  }

  console.log('\n📈 Import Summary:')
  console.log(`✅ Successfully imported: ${successCount} activities`)
  console.log(`❌ Failed to import: ${errorCount} activities`)
  console.log(`📊 Total processed: ${universalActivities.length} activities`)

  if (errorCount > 0) {
    console.log('\n⚠️  Some activities failed to import. Check the errors above.')
  } else {
    console.log('\n🎉 All activities imported successfully!')
  }
}

// Run the import
importUniversalActivitiesPart2()
  .then(() => {
    console.log('✅ Import process completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Import process failed:', error)
    process.exit(1)
  }) 