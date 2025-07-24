#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  // Load activities from JSON
  const activitiesPath = path.join(__dirname, '../exports/100-activities-full-details.json')
  const activitiesRaw = fs.readFileSync(activitiesPath, 'utf-8')
  const activities = JSON.parse(activitiesRaw)

  // Clear existing activities
  console.log('✅ Clearing existing activities...')
  await supabase.from('activities').delete().neq('id', '')
  await supabase.from('activity_steps').delete().neq('id', '')

  let created = 0
  for (const activity of activities) {
    // Insert activity with correct field mapping
    const { data, error } = await supabase.from('activities').insert([
      {
        title: activity.name,
        description: activity.description,
        duration_minutes: activity.durationMinutes || 10,
        difficulty: activity.difficultyLevel || 'beginner',
        sensory_systems: Array.isArray(activity.sensorySystems) ? `{${activity.sensorySystems.join(',')}}` : null,
        behavior_types: Array.isArray(activity.behaviorTypes) ? `{${activity.behaviorTypes.join(',')}}` : null,
        benefits: Array.isArray(activity.benefits) ? `{${activity.benefits.map(b=>b.replace(/,/g,'')).join(',')}}` : null,
        when_to_use: activity.whenToUse || '',
        materials: Array.isArray(activity.materials) ? `{${activity.materials.map(m=>m.replace(/,/g,'')).join(',')}}` : null,
        steps: activity.steps ? JSON.stringify(activity.steps) : null,
        age_range: activity.ageRange || '3-5 years',
        environment: activity.environment || 'indoor',
      },
    ])
    if (error) {
      console.error(`❌ Error inserting activity ${activity.id}:`, error)
      continue
    }
    created++
    
    // Insert steps if present
    if (activity.steps && activity.steps.length > 0) {
      for (const step of activity.steps) {
        await supabase.from('activity_steps').insert([
          {
            activity_id: activity.id,
            step_number: step.step_number || 1,
            title: step.title || '',
            description: step.description || '',
            duration_seconds: step.duration_seconds || 30,
          },
        ])
      }
    }
  }
  console.log(`🎉 Successfully imported ${created} activities!`)
}

main() 