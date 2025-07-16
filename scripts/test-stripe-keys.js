#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const Stripe = require('stripe')

console.log('🔍 Testing Stripe API Keys...\n')

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

console.log('Keys found:')
console.log(`- Secret Key: ${stripeSecretKey ? `${stripeSecretKey.substring(0, 20)}...` : 'NOT SET'}`)
console.log(`- Publishable Key: ${stripePublishableKey ? `${stripePublishableKey.substring(0, 20)}...` : 'NOT SET'}`)

if (!stripeSecretKey) {
  console.log('\n❌ No secret key found')
  process.exit(1)
}

// Test the API key
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-06-30.basil',
})

console.log('\n🧪 Testing Stripe API connection...')

stripe.accounts.retrieve()
  .then(account => {
    console.log('✅ Stripe API key is VALID!')
    console.log(`   Account ID: ${account.id}`)
    console.log(`   Account Name: ${account.business_profile?.name || 'N/A'}`)
    console.log(`   Country: ${account.country}`)
    console.log(`   Charges Enabled: ${account.charges_enabled}`)
    console.log(`   Payouts Enabled: ${account.payouts_enabled}`)
  })
  .catch(error => {
    console.log('❌ Stripe API key is INVALID!')
    console.log(`   Error: ${error.message}`)
    console.log(`   Type: ${error.type}`)
    console.log(`   Code: ${error.code}`)
    
    if (error.message.includes('Invalid API Key')) {
      console.log('\n💡 Solution: Get fresh API keys from your Stripe Dashboard')
      console.log('   https://dashboard.stripe.com/apikeys')
    }
  }) 