#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

console.log('🔍 Testing Stripe Configuration...\n')

// Check environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

console.log('Environment Variables:')
console.log(`- STRIPE_SECRET_KEY: ${stripeSecretKey ? `${stripeSecretKey.substring(0, 20)}...` : 'NOT SET'}`)
console.log(`- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${stripePublishableKey ? `${stripePublishableKey.substring(0, 20)}...` : 'NOT SET'}`)
console.log(`- STRIPE_WEBHOOK_SECRET: ${stripeWebhookSecret ? `${stripeWebhookSecret.substring(0, 20)}...` : 'NOT SET'}`)

// Check if Stripe is configured
const isStripeConfigured = stripeSecretKey && stripePublishableKey
const isTestMode = stripeSecretKey?.startsWith('sk_test_') || false

console.log('\nConfiguration Status:')
console.log(`- isStripeConfigured: ${isStripeConfigured}`)
console.log(`- isTestMode: ${isTestMode}`)
console.log(`- Mode: ${isTestMode ? 'TEST' : 'LIVE'}`)

// Test Stripe initialization
if (isStripeConfigured) {
  try {
    const Stripe = require('stripe')
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-06-30.basil',
      typescript: true,
    })
    console.log('\n✅ Stripe client initialized successfully')
    
    // Test a simple API call
    console.log('Testing Stripe API connection...')
    stripe.accounts.retrieve().then(account => {
      console.log(`✅ Stripe API working - Account: ${account.id}`)
    }).catch(error => {
      console.log(`❌ Stripe API error: ${error.message}`)
    })
  } catch (error) {
    console.log(`❌ Failed to initialize Stripe: ${error.message}`)
  }
} else {
  console.log('\n❌ Stripe not configured - missing environment variables')
} 