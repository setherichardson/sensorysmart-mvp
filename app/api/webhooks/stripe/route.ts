import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  console.log('Webhook event received:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout session completed:', session.id)
  
  if (session.mode === 'subscription' && session.customer) {
    // Update user subscription status in profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ 
        subscription_status: 'active',
        stripe_customer_id: session.customer as string,
        subscription_id: session.subscription as string,
        updated_at: new Date().toISOString()
      })
      .eq('email', session.customer_email)

    if (error) {
      console.error('Error updating user profile:', error)
    } else {
      console.log('Successfully updated subscription status for:', session.customer_email)
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Processing subscription created:', subscription.id)
  
  // Get customer email
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
  const customerEmail = customer.email
  
  if (customerEmail) {
    // Update user subscription status
    const { error } = await supabase
      .from('profiles')
      .update({ 
        subscription_status: subscription.status,
        stripe_customer_id: subscription.customer as string,
        subscription_id: subscription.id,
        updated_at: new Date().toISOString()
      })
      .eq('email', customerEmail)

    if (error) {
      console.error('Error updating user profile:', error)
    } else {
      console.log('Successfully updated subscription status for:', customerEmail)
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription updated:', subscription.id)
  
  // Get customer email
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
  const customerEmail = customer.email
  
  if (customerEmail) {
    // Update user subscription status
    const { error } = await supabase
      .from('profiles')
      .update({ 
        subscription_status: subscription.status,
        stripe_customer_id: subscription.customer as string,
        subscription_id: subscription.id,
        updated_at: new Date().toISOString()
      })
      .eq('email', customerEmail)

    if (error) {
      console.error('Error updating user profile:', error)
    } else {
      console.log('Successfully updated subscription status for:', customerEmail)
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription deleted:', subscription.id)
  
  // Get customer email
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
  const customerEmail = customer.email
  
  if (customerEmail) {
    // Update user subscription status to canceled
    const { error } = await supabase
      .from('profiles')
      .update({ 
        subscription_status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('email', customerEmail)

    if (error) {
      console.error('Error updating user profile:', error)
    } else {
      console.log('Successfully updated subscription status for:', customerEmail)
    }
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing invoice payment succeeded:', invoice.id)
  
  // For now, we'll skip invoice handling since the subscription events handle this
  // The subscription events are more reliable for tracking subscription status
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Processing invoice payment failed:', invoice.id)
  
  // For now, we'll skip invoice handling since the subscription events handle this
  // The subscription events are more reliable for tracking subscription status
} 