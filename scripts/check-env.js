#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

// Check for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'OPENAI_API_KEY'
]

let missingVars = []

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName)
  }
})

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:')
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`)
  })
  console.error('\nPlease check your .env.local file')
  process.exit(1)
}

console.log('✅ All required environment variables are present') 