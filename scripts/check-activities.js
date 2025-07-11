#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkActivities() {
  try {
    console.log('🔍 Checking activities table...')
    
    // Check if activities table exists
    const { data: tableInfo, error: tableError } = await supabase
      .from('activities')
      .select('count')
      .limit(1)
    
    if (tableError) {
      console.log('❌ Activities table does not exist or is not accessible')
      console.log('Error:', tableError)
      return
    }
    
    console.log('✅ Activities table exists')
    
    // Count activities
    const { count, error: countError } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.log('❌ Error counting activities:', countError)
      return
    }
    
    console.log(`📊 Found ${count} activities in the database`)
    
    if (count === 0) {
      console.log('💡 No activities found. You may need to run the activity library creation script.')
    }
    
  } catch (error) {
    console.error('❌ Error checking activities:', error)
  }
}

checkActivities() 