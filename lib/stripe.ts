import Stripe from 'stripe'

// Check if Stripe is configured
const isStripeConfigured = !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

// Detect if we're in test mode based on the secret key
const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') || false

// Debug logging for production troubleshooting
console.log('🔍 Stripe Configuration Debug:', {
  hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
  hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7),
  publishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7),
  isStripeConfigured,
  isTestMode,
  environment: process.env.NODE_ENV
})

// Initialize Stripe (only if configured)
export const stripe = isStripeConfigured 
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-06-30.basil',
      typescript: true,
    })
  : null

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  isTestMode: isTestMode,
  isConfigured: isStripeConfigured,
}

// Product configuration for Sensory Smart
export const PRODUCTS = {
  monthly: {
    name: 'Sensorysmart Monthly',
    price: 999, // $9.99 in cents
    currency: 'usd',
    interval: 'month',
    stripePriceId: 'price_1RlKflJVINsgul2G6sCAmmmw', 
  },
  yearly: {
    name: 'Sensorysmart Yearly',
    price: 9999, // $99.99 in cents (17% savings)
    currency: 'usd',
    interval: 'year',
    stripePriceId: 'price_1RlKfMJVINsgul2GuGiszqjR', 
  },
}

// Helper function to format price
export const formatPrice = (amount: number, currency: string = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
} 