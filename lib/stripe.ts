import Stripe from 'stripe'

// Initialize Stripe with test mode
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
})

// Test mode configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  isTestMode: true, // Always use test mode for now
}

// Product configuration for Sensory Smart
export const PRODUCTS = {
  monthly: {
    name: 'Sensory Smart Monthly',
    price: 1999, // $19.99 in cents
    currency: 'usd',
    interval: 'month',
    stripePriceId: 'price_monthly_test', // You'll get this from Stripe dashboard
  },
  yearly: {
    name: 'Sensory Smart Yearly',
    price: 19999, // $199.99 in cents (2 months free)
    currency: 'usd',
    interval: 'year',
    stripePriceId: 'price_yearly_test', // You'll get this from Stripe dashboard
  },
}

// Helper function to format price
export const formatPrice = (amount: number, currency: string = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
} 