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

async function checkActivitiesSchema() {
  try {
    console.log('🔍 Checking activities table schema...')
    
    // Try to get a single row to see what columns exist
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Error accessing activities table:', error)
      return
    }
    
    if (data && data.length > 0) {
      console.log('✅ Activities table exists and has data')
      console.log('📋 Sample row columns:', Object.keys(data[0]))
    } else {
      console.log('✅ Activities table exists but is empty')
      console.log('📋 Table structure (empty): activities')
    }
    
    // Try to insert a minimal test record to see what columns are required
    const testData = {
      title: 'Test Activity',
      description: 'Test description',
      duration_minutes: 5,
      difficulty: 'beginner'
    }
    
    console.log('🧪 Testing insert with minimal data:', testData)
    const { data: insertData, error: insertError } = await supabase
      .from('activities')
      .insert(testData)
      .select()
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError)
    } else {
      console.log('✅ Insert test successful')
      console.log('📋 Inserted data:', insertData)
      
      // Clean up test data
      if (insertData && insertData.length > 0) {
        await supabase
          .from('activities')
          .delete()
          .eq('id', insertData[0].id)
        console.log('🧹 Cleaned up test data')
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error)
  }
}

checkActivitiesSchema() 