require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function findGenericActivities() {
  console.log('🔍 Finding Activities with Generic Steps...\n')

  try {
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .order('title')

    if (error) {
      console.error('❌ Error fetching activities:', error)
      return
    }

    const problematicActivities = []

    activities.forEach(activity => {
      if (!activity.steps || !Array.isArray(activity.steps)) {
        problematicActivities.push({
          title: activity.title,
          issue: 'No steps array',
          severity: 'HIGH'
        })
        return
      }

      // Check for generic step descriptions
      const stepTexts = activity.steps.map(step => 
        (step.description || step.instruction || '').toLowerCase()
      ).join(' ')

      const genericKeywords = [
        'check energy', 'assess energy', 'choose movement', 'select appropriate',
        'perform movement', 'do chosen', 'adjust as needed', 'generic',
        'coming soon', 'instructions coming', 'to be added'
      ]

      const hasGenericSteps = genericKeywords.some(keyword => 
        stepTexts.includes(keyword)
      )

      // Check for very short step descriptions
      const shortSteps = activity.steps.some(step => {
        const desc = step.description || step.instruction || ''
        return desc.length < 20
      })

      // Check for steps that are too vague
      const vagueSteps = activity.steps.some(step => {
        const desc = step.description || step.instruction || ''
        return desc.includes('do') && desc.length < 30
      })

      if (hasGenericSteps || shortSteps || vagueSteps) {
        problematicActivities.push({
          title: activity.title,
          issue: hasGenericSteps ? 'Generic keywords' : shortSteps ? 'Very short steps' : 'Vague descriptions',
          severity: hasGenericSteps ? 'HIGH' : 'MEDIUM',
          steps: activity.steps
        })
      }
    })

    console.log('❌ PROBLEMATIC ACTIVITIES:')
    console.log('==========================')
    
    problematicActivities.forEach(activity => {
      console.log(`\n📝 ${activity.title}`)
      console.log(`   Issue: ${activity.issue}`)
      console.log(`   Severity: ${activity.severity}`)
      if (activity.steps) {
        console.log(`   Steps: ${JSON.stringify(activity.steps, null, 2)}`)
      }
    })

    console.log(`\n📈 SUMMARY:`)
    console.log(`   Total activities: ${activities.length}`)
    console.log(`   Problematic activities: ${problematicActivities.length}`)
    console.log(`   High severity: ${problematicActivities.filter(a => a.severity === 'HIGH').length}`)
    console.log(`   Medium severity: ${problematicActivities.filter(a => a.severity === 'MEDIUM').length}`)

  } catch (err) {
    console.error('❌ Error:', err)
  }
}

findGenericActivities() 