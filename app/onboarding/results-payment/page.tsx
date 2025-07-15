'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Assessment } from '@/lib/supabase/client'

export default function ResultsPayment() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [error, setError] = useState('')

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
        const { data: assessmentData } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single()

        setUser(user)
        setProfile(profileData)
        setAssessment(assessmentData)
      } catch (err) {
        console.error('Error loading user data:', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const handlePayment = async () => {
    setIsProcessing(true)
    setError('')

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update user profile to mark as paid
      if (user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'active',
            subscription_plan: selectedPlan,
            subscription_start_date: new Date().toISOString()
          })
          .eq('id', user.id)

        if (updateError) {
          throw updateError
        }
      }

      // Redirect to dashboard
      router.push('/dashboard/today')
    } catch (err) {
      console.error('Payment error:', err)
      setError('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="loading-text">Loading payment options...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect
  }

  return (
    <div className="payment-container min-h-screen" style={{ background: '#F6F6F6' }}>
      <div className="payment-wrapper mx-auto w-full max-w-md px-4">
        {/* Header */}
        <div className="payment-header mb-6">
          <h1 className="text-2xl font-semibold text-center mb-2" style={{ color: '#252225' }}>
            Choose Your Plan
          </h1>
          <p className="text-center text-gray-600">
            Get personalized sensory activities and expert coaching
          </p>
        </div>

        {/* Plan Selection */}
        <div className="plan-selection mb-6">
          {/* Monthly Plan */}
          <div 
            className={`plan-card mb-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedPlan === 'monthly' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white'
            }`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold" style={{ color: '#252225' }}>Monthly Plan</h3>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: '#367A87' }}>$9.99</div>
                <div className="text-sm text-gray-500">per month</div>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Personalized sensory activities</li>
              <li>• Expert AI coaching</li>
              <li>• Progress tracking</li>
              <li>• Cancel anytime</li>
            </ul>
          </div>

          {/* Yearly Plan */}
          <div 
            className={`plan-card mb-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedPlan === 'yearly' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white'
            }`}
            onClick={() => setSelectedPlan('yearly')}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: '#252225' }}>Yearly Plan</h3>
                <div className="text-sm text-green-600 font-medium">Save 17%</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: '#367A87' }}>$99.99</div>
                <div className="text-sm text-gray-500">per year</div>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• All monthly features</li>
              <li>• Priority support</li>
              <li>• Advanced analytics</li>
              <li>• Best value</li>
            </ul>
          </div>
        </div>

        {/* Payment Form */}
        <div className="payment-form mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#252225' }}>Payment Information</h3>
            
            {/* Mock payment fields for testing */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input 
                  type="text" 
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                  <input 
                    type="text" 
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Test Mode:</strong> This is a demo payment form. Click "Start Subscription" to simulate payment processing.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Processing...' : `Start ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`}
        </button>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center mt-4">
          By subscribing, you agree to our Terms of Service and Privacy Policy. 
          You can cancel your subscription at any time.
        </p>
      </div>
    </div>
  )
} 