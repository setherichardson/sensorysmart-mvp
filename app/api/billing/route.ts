import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRODUCTS, STRIPE_CONFIG } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting billing POST request...')
    
    // Check if Stripe is configured
    if (!stripe || !STRIPE_CONFIG.isConfigured) {
      console.log('Stripe not configured:', { stripe: !!stripe, configured: STRIPE_CONFIG.isConfigured })
      return NextResponse.json(
        { error: 'Billing is not configured' },
        { status: 503 }
      )
    }

    console.log('Stripe configured, parsing request...')
    const { priceId, successUrl, cancelUrl } = await request.json()
    console.log('Request data:', { priceId, successUrl, cancelUrl })
    
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', user.email)

    // Create Stripe checkout session
    console.log('Creating Stripe checkout session with priceId:', priceId)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${request.nextUrl.origin}/dashboard?success=true`,
      cancel_url: cancelUrl || `${request.nextUrl.origin}/dashboard?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planType: priceId.includes('yearly') ? 'yearly' : 'monthly',
        app: 'sensorysmart',
      },
      // Test mode settings
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    })

    console.log('Session created successfully:', session.id)
    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error('Billing error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode
    })
    
    // Return the actual error message for debugging
    const errorMessage = error.message || 'Failed to create checkout session'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe || !STRIPE_CONFIG.isConfigured) {
      return NextResponse.json(
        { error: 'Billing is not configured' },
        { status: 503 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find or create customer
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    })

    let customer
    if (customers.data.length === 0) {
      // Create new customer
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          app: 'sensorysmart',
        },
      })
    } else {
      customer = customers.data[0]
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${request.nextUrl.origin}/dashboard/profile`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Customer portal error:', error)
    
    // Check if it's a Customer Portal configuration error
    if (error.type === 'StripeInvalidRequestError' && error.message?.includes('customer portal settings')) {
      return NextResponse.json(
        { error: 'Customer Portal not configured. Please contact support to set up billing management.' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Checking Stripe configuration...')
    
    // Check if Stripe is configured
    if (!stripe || !STRIPE_CONFIG.isConfigured) {
      console.log('Stripe not configured:', { 
        stripe: !!stripe, 
        configured: STRIPE_CONFIG.isConfigured,
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7),
        publishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7)
      })
      return NextResponse.json({ 
        hasSubscription: false, 
        configured: false,
        config: {
          hasStripe: !!stripe,
          isConfigured: STRIPE_CONFIG.isConfigured,
          isTestMode: STRIPE_CONFIG.isTestMode,
          hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
          hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        }
      })
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer's subscription status
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    })

    if (customers.data.length === 0) {
      return NextResponse.json({ 
        hasSubscription: false, 
        configured: true,
        config: {
          isTestMode: STRIPE_CONFIG.isTestMode,
          hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
          hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        }
      })
    }

    const customer = customers.data[0]
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
    })

    return NextResponse.json({
      hasSubscription: subscriptions.data.length > 0,
      subscription: subscriptions.data[0] || null,
      configured: true,
      config: {
        isTestMode: STRIPE_CONFIG.isTestMode,
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      }
    })
  } catch (error) {
    console.error('Subscription check error:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    )
  }
} 