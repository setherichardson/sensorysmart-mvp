import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRODUCTS } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
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
      },
      // Test mode settings
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Billing error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json({ hasSubscription: false })
    }

    const customer = customers.data[0]
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
    })

    return NextResponse.json({
      hasSubscription: subscriptions.data.length > 0,
      subscription: subscriptions.data[0] || null,
    })
  } catch (error) {
    console.error('Subscription check error:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    )
  }
} 