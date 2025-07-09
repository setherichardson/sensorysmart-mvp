const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkUserProfile() {
  try {
    console.log('Checking user profile...')
    
    // Test user ID from the console log
    const testUserId = 'd3d599ce-2f11-49f2-8213-11ebce90c5ce'
    
    console.log('Checking if user exists in auth.users...')
    
    // Check if user exists in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single()
    
    if (profileError) {
      console.error('❌ Profile error:', profileError)
      console.error('Error code:', profileError.code)
      console.error('Error message:', profileError.message)
    } else {
      console.log('✅ User profile found:', profileData)
    }
    
    // Test if we can insert into activity_completions with this user
    console.log('Testing activity_completions insert...')
    
    const testInsert = {
      user_id: testUserId,
      activity_name: 'Test Activity',
      activity_type: 'proprioceptive',
      rating: null,
      duration_minutes: 5,
      completed_at: new Date().toISOString()
    }
    
    console.log('Attempting to insert:', testInsert)
    
    const { data: insertData, error: insertError } = await supabase
      .from('activity_completions')
      .insert(testInsert)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Insert error:', insertError)
      console.error('Error code:', insertError.code)
      console.error('Error message:', insertError.message)
      console.error('Error details:', insertError.details)
      console.error('Error hint:', insertError.hint)
    } else {
      console.log('✅ Insert successful:', insertData)
      
      // Clean up the test data
      const { error: deleteError } = await supabase
        .from('activity_completions')
        .delete()
        .eq('id', insertData.id)
      
      if (deleteError) {
        console.error('❌ Cleanup error:', deleteError)
      } else {
        console.log('✅ Test data cleaned up')
      }
    }
    
  } catch (err) {
    console.error('❌ Script failed:', err)
  }
}

checkUserProfile() 