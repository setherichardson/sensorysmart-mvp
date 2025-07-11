#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const { v4: uuidv4 } = require('crypto')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testProfileCreation() {
  try {
    console.log('🔍 Testing profile creation...')
    
    // Test data that matches what the frontend sends
    const testProfileData = {
      parent_name: 'Test Parent',
      email: 'test@example.com',
      child_name: 'Test Child',
      child_age: '4-5 years',
    }
    
    // Generate a proper UUID
    const testUserId = uuidv4()
    
    console.log('📋 Test profile data:', testProfileData)
    console.log('👤 Test user ID (UUID):', testUserId)
    
    // Try to insert a test profile
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        ...testProfileData
      })
      .select()
    
    if (error) {
      console.error('❌ Profile creation failed:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Error details:', error.details)
      console.error('Error hint:', error.hint)
    } else {
      console.log('✅ Profile creation successful:', data)
      
      // Clean up test data
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testUserId)
      console.log('🧹 Cleaned up test profile')
    }
    
  } catch (error) {
    console.error('❌ Error in test:', error)
  }
}

testProfileCreation() 