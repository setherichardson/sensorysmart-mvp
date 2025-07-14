const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testActivityCompletion() {
  try {
    console.log('Testing activity completion...')
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log('No user found, trying to sign in...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword'
      })
      
      if (error) {
        console.error('Error signing in:', error)
        return
      }
    }
    
    console.log('User:', user?.email)
    
    // Check if activity_completions table exists and has data
    const { data: completions, error: completionsError } = await supabase
      .from('activity_completions')
      .select('*')
      .order('completed_at', { ascending: false })
      .limit(10)
    
    if (completionsError) {
      console.error('Error fetching completions:', completionsError)
      return
    }
    
    console.log('Recent activity completions:')
    console.log(JSON.stringify(completions, null, 2))
    
    // Try to insert a test completion
    const testCompletion = {
      user_id: user?.id,
      activity_id: 'test-activity',
      completed_at: new Date().toISOString(),
      duration_minutes: 10,
      activity_name: 'Test Activity',
      activity_type: 'proprioceptive',
      rating: 'regulated'
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('activity_completions')
      .insert(testCompletion)
      .select()
    
    if (insertError) {
      console.error('Error inserting test completion:', insertError)
    } else {
      console.log('Successfully inserted test completion:', insertData)
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testActivityCompletion() 