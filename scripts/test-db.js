#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Simple test of database connection
async function testDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }

  console.log('🔍 Testing database connection...')
  
  try {
    // Test basic API endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      console.log('✅ Database connection successful!')
      console.log('\n📋 To create a test account:')
      console.log('1. Go to: http://localhost:3000/signup')
      console.log('2. Use these test credentials:')
      console.log('   📧 Email: test@sensorysmart.app')
      console.log('   🔑 Password: test123456')
      console.log('3. Complete onboarding with:')
      console.log('   👤 Parent Name: Test Parent')
      console.log('   👶 Child Name: Test Child')
      console.log('   📅 Child Age: 4-5 years')
      console.log('4. Complete the 15-question assessment')
      console.log('5. Explore the dashboard!')
      console.log('\n🚀 Your app is ready for testing!')
    } else {
      console.error('❌ Database connection failed:', response.status)
    }
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
  }
}

testDatabase() 