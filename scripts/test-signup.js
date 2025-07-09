#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' })

async function testSignupReadiness() {
  console.log('🧪 Testing signup readiness...\n')
  
  // Test environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables')
    return
  }
  
  console.log('✅ Environment variables: OK')
  
  // Test database connection
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/profiles?limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      console.log('✅ Database connection: OK')
      console.log('✅ Profiles table: EXISTS')
      
      console.log('\n🎯 Ready to test! Try these steps:')
      console.log('1. Go to: http://localhost:3000/signup')
      console.log('2. Use these test credentials:')
      console.log('   📧 Email: test.sensory@gmail.com')
      console.log('   🔑 Password: test123456')
      console.log('3. Complete onboarding')
      console.log('4. Then log in with the same credentials!')
      
    } else if (response.status === 404) {
      console.error('❌ Profiles table: NOT FOUND')
      console.log('\n🔧 Please set up your database:')
      console.log('1. Go to: https://supabase.com/dashboard')
      console.log('2. Select your project')
      console.log('3. Go to SQL Editor')
      console.log('4. Copy and run the content from: supabase/schema.sql')
      console.log('5. Then try signup again')
      
    } else {
      console.error(`❌ Database error: ${response.status}`)
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
  }
}

testSignupReadiness() 