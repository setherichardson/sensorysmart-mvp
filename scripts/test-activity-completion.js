const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testActivityCompletion() {
  try {
    console.log('Testing activity completion...')
    
    // First, let's check if we can connect to the database
    const { data: testData, error: testError } = await supabase
      .from('activity_completions')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('Database connection error:', testError)
      return
    }
    
    console.log('✅ Database connection successful')
    
    // Test inserting a sample activity completion
    const testActivity = {
      user_id: 'test-user-id', // This will fail due to foreign key constraint, but we can see the error
      activity_name: 'Test Activity',
      activity_type: 'proprioceptive',
      rating: null,
      duration_minutes: 5,
      completed_at: new Date().toISOString()
    }
    
    console.log('Attempting to insert test activity:', testActivity)
    
    const { data, error } = await supabase
      .from('activity_completions')
      .insert(testActivity)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Insert error:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Error details:', error.details)
    } else {
      console.log('✅ Insert successful:', data)
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err)
  }
}

testActivityCompletion() 