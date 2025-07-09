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
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    email: ''
  })
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
      } catch (err) {
        console.error('Error loading user data:', err)
        setError('Failed to load your results. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const plans = {
    monthly: {
      price: 9.99,
      period: 'month',
      savings: null,
      popular: false
    },
    yearly: {
      price: 99.99,
      period: 'year',
      savings: 'Save 17%',
      popular: true
    }
  }

  const getProfileDescription = (profile: string, childName: string) => {
    switch (profile) {
      case 'Sensory Seeking':
        return {
          title: 'Sensory Seeking',
          description: `${childName} tends to seek out sensory experiences and may need more intense sensory input to feel regulated.`,
          color: 'bg-green-100 text-green-800',
          recommendations: [
            'Provide heavy work activities (pushing, pulling, carrying)',
            'Offer movement breaks throughout the day',
            'Include textured materials in play',
            'Use firm pressure for comfort (weighted blankets, tight hugs)'
          ]
        }
      case 'Sensory Avoiding':
        return {
          title: 'Sensory Avoiding',
          description: `${childName} tends to be sensitive to sensory input and may become overwhelmed easily.`,
          color: 'bg-blue-100 text-blue-800',
          recommendations: [
            'Create calm, quiet spaces for breaks',
            'Use gentle, predictable touch',
            'Provide advance warning for sensory experiences',
            'Offer noise-canceling headphones in loud environments'
          ]
        }
      case 'Mixed Profile':
        return {
          title: 'Mixed Profile',
          description: `${childName} shows both seeking and avoiding patterns across different sensory systems.`,
          color: 'bg-purple-100 text-purple-800',
          recommendations: [
            'Tailor activities to specific sensory needs',
            'Provide choices in sensory experiences',
            'Monitor for signs of overwhelm or under-stimulation',
            'Create a flexible sensory toolkit'
          ]
        }
      default:
        return {
          title: 'Mixed/Typical',
          description: `${childName} shows typical sensory responses with some variation across different situations.`,
          color: 'bg-gray-100 text-gray-800',
          recommendations: [
            'Continue providing varied sensory experiences',
            'Watch for changes in sensory needs over time',
            'Maintain a balanced approach to sensory activities',
            'Be responsive to daily variations in sensory tolerance'
          ]
        }
    }
  }

  const getSystemLabel = (system: string) => {
    switch (system) {
      case 'tactile': return 'Touch'
      case 'auditory': return 'Hearing'
      case 'visual': return 'Sight'
      case 'vestibular': return 'Movement'
      case 'proprioceptive': return 'Body Awareness'
      default: return system
    }
  }

  const getScoreInterpretation = (score: number) => {
    if (score <= 6) return { label: 'Avoiding', color: 'bg-red-100 text-red-700' }
    if (score <= 9) return { label: 'Sensitive', color: 'bg-orange-100 text-orange-700' }
    if (score <= 12) return { label: 'Typical', color: 'bg-gray-100 text-gray-700' }
    return { label: 'Seeking', color: 'bg-green-100 text-green-700' }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      router.push('/dashboard/today')
    }, 2000)
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

  const profileInfo = getProfileDescription(assessment.results.profile, profile.child_name)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {profile.child_name}'s Sensory Profile
          </h1>
          <p className="text-lg text-gray-600">
            Based on your assessment, here's what we found and how we can help.
          </p>
        </div>

        {/* Assessment Results */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Assessment Results</h2>
          
          {/* Profile Summary */}
          <div className={`p-6 rounded-xl ${profileInfo.color} mb-6`}>
            <h3 className="text-lg font-bold mb-2">{profileInfo.title}</h3>
            <p className="text-sm leading-relaxed">{profileInfo.description}</p>
          </div>

          {/* System Breakdown */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900">Sensory System Breakdown</h3>
            {Object.entries(assessment.results).map(([system, score]) => {
              if (system === 'total' || system === 'profile') return null
              const interpretation = getScoreInterpretation(score as number)
              return (
                <div key={system} className="flex items-center justify-between">
                  <span className="text-gray-700">{getSystemLabel(system)}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{score}/15</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${interpretation.color}`}>
                      {interpretation.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Recommended Activities</h3>
            <div className="space-y-3">
              {profileInfo.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What You'll Get:</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Personalized daily activities tailored to {profile.child_name}'s sensory profile</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">AI-powered coaching and progress tracking</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Expert-curated activities for all sensory systems</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Progress reports and insights for parents</span>
            </div>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Plan:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedPlan === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan(key)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    ${plan.price}
                  </div>
                  <div className="text-gray-600">per {plan.period}</div>
                  {plan.savings && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      {plan.savings}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name on Card
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                required
              />
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span>${plans[selectedPlan as keyof typeof plans].price}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                `Start ${profile.child_name}'s Sensory Journey - $${plans[selectedPlan as keyof typeof plans].price}`
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Your payment is secure and encrypted
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Trusted by occupational therapists and sensory parents worldwide
          </p>
        </div>
      </div>
    </div>
  )
} 