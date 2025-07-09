const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function createUserProfile() {
  try {
    console.log('Creating user profile...')
    
    // Test user ID from the console log
    const testUserId = 'd3d599ce-2f11-49f2-8213-11ebce90c5ce'
    
    // First, let's create a profile for this user
    const profileData = {
      id: testUserId,
      parent_name: 'Test Parent',
      email: 'test@example.com',
      child_name: 'Test Child',
      child_age: '5-7 years'
    }
    
    console.log('Creating profile:', profileData)
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()
    
    if (profileError) {
      console.error('❌ Profile creation error:', profileError)
      console.error('Error code:', profileError.code)
      console.error('Error message:', profileError.message)
      
      // If it's a duplicate key error, the profile might already exist
      if (profileError.code === '23505') {
        console.log('Profile already exists, trying to get it...')
        
        const { data: existingProfile, error: getError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', testUserId)
          .single()
        
        if (getError) {
          console.error('❌ Error getting existing profile:', getError)
        } else {
          console.log('✅ Existing profile found:', existingProfile)
        }
      }
    } else {
      console.log('✅ Profile created successfully:', profile)
    }
    
    // Now test the activity completion insert again
    console.log('Testing activity_completions insert after profile creation...')
    
    const testInsert = {
      user_id: testUserId,
      activity_name: 'Test Activity',
      activity_type: 'proprioceptive',
      rating: null,
      duration_minutes: 5,
      completed_at: new Date().toISOString()
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('activity_completions')
      .insert(testInsert)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Insert error:', insertError)
      console.error('Error code:', insertError.code)
      console.error('Error message:', insertError.message)
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

createUserProfile() 