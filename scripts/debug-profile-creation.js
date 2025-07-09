#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' })

async function debugProfileCreation() {
  console.log('🔍 Debugging profile creation...\n')
  
  const { createClient } = require('@supabase/supabase-js')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('Environment Variables:')
  console.log('✅ SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing')
  console.log('✅ ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing')
  console.log('✅ SERVICE_KEY:', supabaseServiceKey ? 'Present' : 'Missing')
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables')
    return
  }
  
  // Test with anon key
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  console.log('\n🧪 Testing profile table access...')
  
  try {
    // Test basic table access
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Profile table access failed:', error.message)
      console.log('\n🔧 Possible fixes:')
      console.log('1. Check if your database schema is properly set up')
      console.log('2. Verify RLS policies allow anonymous access')
      console.log('3. Check table permissions')
      
      // Test with service role key if available
      if (supabaseServiceKey) {
        console.log('\n🔄 Testing with service role key...')
        const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)
        
        const { data: adminData, error: adminError } = await adminSupabase
          .from('profiles')
          .select('count')
          .limit(1)
          
        if (adminError) {
          console.error('❌ Service role access also failed:', adminError.message)
        } else {
          console.log('✅ Service role access works')
          console.log('   → The issue is with RLS policies or anonymous access')
        }
      }
    } else {
      console.log('✅ Profile table access works')
      console.log('\n🎯 Try creating a profile now at: http://localhost:3000/onboarding')
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
  }
}

debugProfileCreation() 