#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' })

async function checkUsers() {
  const { createClient } = require('@supabase/supabase-js')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL')
    return
  }

  // Try with service role key first (if available), then anon key
  const supabase = createClient(
    supabaseUrl, 
    supabaseServiceKey || supabaseAnonKey
  )

  console.log('🔍 Checking for existing users...')
  
  try {
    // Check profiles table (since auth.users requires service role)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('email, parent_name, child_name, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error checking profiles:', error.message)
      return
    }

    if (profiles && profiles.length > 0) {
      console.log(`✅ Found ${profiles.length} existing user(s):`)
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. Email: ${profile.email}`)
        console.log(`   Parent: ${profile.parent_name}`)
        console.log(`   Child: ${profile.child_name}`)
        console.log(`   Created: ${new Date(profile.created_at).toLocaleString()}`)
        console.log('')
      })
      console.log('💡 You can log in with any of these email addresses.')
      console.log('   If you forgot the password, you\'ll need to reset it or create a new account.')
    } else {
      console.log('📋 No existing users found.')
      console.log('\n🎯 To create your first test account:')
      console.log('1. Go to: http://localhost:3000/signup')
      console.log('2. Use these credentials:')
      console.log('   📧 Email: test@sensorysmart.app')
      console.log('   🔑 Password: test123456')
      console.log('3. Complete the onboarding process')
      console.log('4. Then you can log in with those same credentials!')
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

checkUsers() 