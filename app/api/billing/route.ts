import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRODUCTS, STRIPE_CONFIG } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe || !STRIPE_CONFIG.isConfigured) {
      return NextResponse.json(
        { error: 'Billing is not configured' },
        { status: 503 }
      )
    }

    const { priceId, successUrl, cancelUrl } = await request.json()
    
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Stripe checkout session
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

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error('Billing error:', error)
    
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
    // Check if Stripe is configured
    if (!stripe || !STRIPE_CONFIG.isConfigured) {
      return NextResponse.json({ hasSubscription: false, configured: false })
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
      return NextResponse.json({ hasSubscription: false, configured: true })
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
    })
  } catch (error) {
    console.error('Subscription check error:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    )
  }
} 