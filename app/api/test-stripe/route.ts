import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    
    console.log('🔍 Testing Stripe in production...')
    console.log('Secret key length:', stripeSecretKey?.length)
    console.log('Secret key prefix:', stripeSecretKey?.substring(0, 20))
    console.log('Secret key suffix:', stripeSecretKey?.substring(stripeSecretKey.length - 4))
    
    if (!stripeSecretKey) {
      return NextResponse.json({ 
        error: 'No secret key found',
        hasSecretKey: false 
      })
    }
    
    // Test the API key by making a simple call
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-06-30.basil',
    })
    
    // Try to get account info (this will validate the key)
    const account = await stripe.accounts.retrieve()
    
    return NextResponse.json({
      success: true,
      accountId: account.id,
      secretKeyLength: stripeSecretKey.length,
      secretKeyPrefix: stripeSecretKey.substring(0, 20),
      secretKeySuffix: stripeSecretKey.substring(stripeSecretKey.length - 4),
      hasPublishableKey: !!stripePublishableKey,
      environment: process.env.NODE_ENV
    })
    
  } catch (error: any) {
    console.error('❌ Stripe test failed:', error.message)
    
    return NextResponse.json({
      error: error.message,
      errorType: error.type,
      statusCode: error.statusCode,
      secretKeyLength: process.env.STRIPE_SECRET_KEY?.length,
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 20),
      secretKeySuffix: process.env.STRIPE_SECRET_KEY?.substring(process.env.STRIPE_SECRET_KEY.length - 4),
      environment: process.env.NODE_ENV
    })
  }
} 