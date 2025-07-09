#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' })

async function checkAuthSettings() {
  console.log('🔍 Checking authentication settings...\n')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  
  if (!supabaseUrl) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL')
    return
  }
  
  console.log('🎯 To disable email confirmation for easier testing:')
  console.log('\n📋 Steps:')
  console.log('1. Go to: https://supabase.com/dashboard')
  console.log('2. Select your project')
  console.log('3. Go to: Authentication → Settings')
  console.log('4. Find "User Signups" section')
  console.log('5. Turn OFF "Enable email confirmations"')
  console.log('6. Save changes')
  console.log('7. Try signup again with: test.sensory@gmail.com')
  
  console.log('\n🔄 Alternative - Use Real Email:')
  console.log('• Use your actual email for testing')
  console.log('• Check your inbox for confirmation email')
  console.log('• Click the confirmation link')
  console.log('• Then complete signup')
  
  console.log('\n📍 Your Supabase Dashboard:')
  console.log(`   ${supabaseUrl.replace('/rest/v1', '').replace('https://', 'https://supabase.com/dashboard/project/')}`)
}

checkAuthSettings() 