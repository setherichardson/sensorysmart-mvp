'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Assessment } from '@/lib/supabase/client'
import { PRODUCTS } from '@/lib/stripe'
import { loadStripe } from '@stripe/stripe-js'
import { analytics } from '@/lib/analytics'

export default function ResultsPayment() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [pageLoadTime] = useState(Date.now())

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError || !profileData) {
          router.push('/onboarding')
          return
        }

        // Get latest assessment
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single()

        if (assessmentError || !assessmentData) {
          router.push('/onboarding/assessment')
          return
        }

        setUser(user)
        setProfile(profileData)
        setAssessment(assessmentData)
        
        // Track page view and funnel step
        analytics.pageView('results-payment');
        analytics.funnelStep('billing_page', 4);
        
        // Track time from assessment completion to billing page
        const assessmentCompletedAt = new Date(assessmentData.completed_at).getTime()
        const timeToBilling = Math.round((Date.now() - assessmentCompletedAt) / 1000)
        analytics.funnelStepTime('assessment_completed', 'billing_page', timeToBilling)
      } catch (err) {
        console.error('Error loading user data:', err)
        setError('Failed to load your results. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
      analytics.pageScrolled('results-payment', scrollPercent)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Time on page tracking
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - pageLoadTime) / 1000)
      analytics.timeOnPage('results-payment', timeOnPage)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [pageLoadTime])

  // Exit intent tracking
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        analytics.exitIntent('results-payment')
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [])

  const plan = {
    price: 9.99,
    period: 'month',
    stripePriceId: PRODUCTS.monthly.stripePriceId
  }

  const getSensoryCategory = (profile: string) => {
    switch (profile) {
      case 'Sensory Seeking':
        return 'sensory seeking'
      case 'Sensory Avoiding':
        return 'sensory avoiding'
      case 'Sensory Sensitive':
        return 'sensory sensitive'
      case 'Low Registration':
        return 'low registration'
      case 'Mixed Profile':
        return 'mixed sensory profile'
      default:
        return 'sensory seeking'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError('')
    
    try {
      // Use real Stripe payment
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          successUrl: `${window.location.origin}/dashboard/today?success=true&t=${Date.now()}`,
          cancelUrl: `${window.location.origin}/onboarding/results-payment?canceled=true`,
        }),
      })

      const { sessionId, error: apiError } = await response.json()

      if (apiError) {
        console.error('API Error:', apiError)
        throw new Error(apiError)
      }

      if (!sessionId) {
        throw new Error('No session ID returned from billing API')
      }

      // Track trial start
      analytics.trialStarted('monthly');
      
      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          throw new Error(error.message)
        }
      } else {
        throw new Error('Failed to load Stripe')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError('Failed to process payment. Please try again.')
      setIsProcessing(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard/today')}
            className="bg-black text-white px-6 py-2 rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // No data state
  if (!user || !profile || !assessment) {
    return null // Will redirect
  }

  const sensoryCategory = getSensoryCategory(assessment.results.profile)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F6F6', fontFamily: 'Mona Sans, sans-serif' }}>
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8" style={{ marginTop: '20px' }}>
          {/* Assessment Complete Chip */}
          <div className="inline-block mb-4 px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#E8F5E8', color: '#2D5A2D', fontFamily: 'Mona Sans, sans-serif' }}>
            Assessment Complete
          </div>
          
          {/* Title */}
          <h1 className="mb-2" style={{ fontFamily: 'Mona Sans, sans-serif', fontSize: '22px', fontWeight: '600', color: '#252225' }}>
            Unlock {profile.child_name}'s sensory schedule
          </h1>
          
          {/* Description */}
          <p className="mb-4" style={{ fontFamily: 'Mona Sans, sans-serif', fontSize: '16px', fontWeight: '500', color: '#6C6C6C', lineHeight: '1.3' }}>
            Subscribe to unlock your full assessment and a personalized daily sensory diet.
          </p>
        </div>



        {/* Features Card */}
        <div className="p-6 shadow-xl border border-gray-100 mb-6" style={{ backgroundColor: '#fff', borderRadius: '16px', fontFamily: 'Mona Sans, sans-serif' }}>
          <h2 className="mb-4" style={{ fontFamily: 'Mona Sans, sans-serif', fontSize: '18px', fontWeight: '600', color: '#252225' }}>
            Your subscriptions includes
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <img src="/Icons/Note.svg" alt="Document" className="w-5 h-5 mr-3" />
              <span className="text-gray-700" style={{ fontFamily: 'Mona Sans, sans-serif' }}>Detailed sensory assessment</span>
            </div>
            <div className="flex items-center">
              <img src="/Icons/Calendar.svg" alt="Calendar" className="w-5 h-5 mr-3" />
              <span className="text-gray-700" style={{ fontFamily: 'Mona Sans, sans-serif' }}>Sensory diet for every part of the day</span>
            </div>
            <div className="flex items-center">
              <img src="/Icons/Journal.svg" alt="Journal" className="w-5 h-5 mr-3" />
              <span className="text-gray-700" style={{ fontFamily: 'Mona Sans, sans-serif' }}>Activity tracking journal</span>
            </div>
            <div className="flex items-center">
              <img src="/Icons/Chat.svg" alt="Chat" className="w-5 h-5 mr-3" />
              <span className="text-gray-700" style={{ fontFamily: 'Mona Sans, sans-serif' }}>Sensory Coach chat for questions</span>
            </div>
            <div className="flex items-center">
              <img src="/Icons/target.svg" alt="Support" className="w-5 h-5 mr-3" />
              <span className="text-gray-700" style={{ fontFamily: 'Mona Sans, sans-serif' }}>In the moment behavior support</span>
            </div>
            <div className="flex items-center">
              <img src="/Icons/star.svg" alt="OT" className="w-5 h-5 mr-3" />
              <span className="text-gray-700" style={{ fontFamily: 'Mona Sans, sans-serif' }}>Created by an Occupational Therapist</span>
            </div>
          </div>
        </div>

        {/* Trial Info Card */}
        <div className="p-6 shadow-xl border border-gray-100 mb-6" style={{ backgroundColor: '#fff', borderRadius: '16px', fontFamily: 'Mona Sans, sans-serif' }}>
          <h2 className="mb-4" style={{ fontFamily: 'Mona Sans, sans-serif', fontSize: '18px', fontWeight: '600', color: '#252225' }}>
            How your trial works
          </h2>
          
          {/* Trial Steps */}
          <div className="space-y-3 mb-6">
            <div>
              <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Mona Sans, sans-serif' }}>Today: Get access</h3>
              <p className="text-gray-600 text-sm" style={{ fontFamily: 'Mona Sans, sans-serif' }}>Get the full assessment and sensory diet</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Mona Sans, sans-serif' }}>This week: Implement the sensory diet</h3>
              <p className="text-gray-600 text-sm" style={{ fontFamily: 'Mona Sans, sans-serif' }}>We'll remind you when your trial will end</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Mona Sans, sans-serif' }}>Trial ends: Subscription starts</h3>
              <p className="text-gray-600 text-sm" style={{ fontFamily: 'Mona Sans, sans-serif' }}>You can cancel before this date</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={(e) => {
              analytics.unlockButtonClicked();
              handleSubmit(e);
            }}
            disabled={isProcessing}
            className="w-full px-6 font-bold text-base hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: '#367A87', color: 'white', borderRadius: '100px', height: '40px', fontFamily: 'Mona Sans, sans-serif' }}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              'Unlock your Sensory Diet'
            )}
          </button>
          
          {/* Pricing */}
          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm" style={{ fontFamily: 'Mona Sans, sans-serif' }}>7-day free trial, then $9.99 a month</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 leading-relaxed" style={{ fontFamily: 'Mona Sans, sans-serif' }}>
            Sensorysmart was developed with a licensed occupational therapist and provides sensory activities based on professional knowledge. However, this app does not replace individualized therapy or medical consultation.
          </p>
        </div>
      </div>
    </div>
  )
} 