#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

// Check for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  // Optional: Stripe configuration (for billing)
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  // Optional: Domain configuration
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_APP_DOMAIN'
]

const optionalEnvVars = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_APP_DOMAIN'
]

const missingRequired = []
const missingOptional = []

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    if (optionalEnvVars.includes(envVar)) {
      missingOptional.push(envVar)
    } else {
      missingRequired.push(envVar)
    }
  }
}

if (missingRequired.length > 0) {
  console.error('❌ Missing required environment variables:')
  missingRequired.forEach(varName => console.error(`   - ${varName}`))
  process.exit(1)
}

if (missingOptional.length > 0) {
  console.log('⚠️  Missing optional environment variables (for enhanced features):')
  missingOptional.forEach(varName => console.log(`   - ${varName}`))
  console.log('\n💡 Optional features:')
  console.log('   - Stripe billing (test mode)')
  console.log('   - Custom domain configuration')
  console.log('   - Enhanced PWA features')
}

console.log('✅ All required environment variables are present') 