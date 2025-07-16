import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasStripePublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    hasStripeWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    stripeSecretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'NOT_SET',
    stripePublishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7) || 'NOT_SET',
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('STRIPE'))
  }

  return NextResponse.json(envVars)
} 