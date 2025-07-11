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
      case 'Sensory Sensitive':
        return {
          title: 'Sensory Sensitive',
          description: `${childName} is highly sensitive to sensory input and may overreact to stimuli.`,
          color: 'bg-orange-100 text-orange-800',
          recommendations: [
            'Create predictable, low-stimulation environments',
            'Use gentle, gradual sensory experiences',
            'Provide advance warning for changes',
            'Offer calming activities and deep breathing'
          ]
        }
      case 'Low Registration':
        return {
          title: 'Low Registration',
          description: `${childName} may not notice sensory input and may need more intense stimuli to respond.`,
          color: 'bg-purple-100 text-purple-800',
          recommendations: [
            'Use bright, engaging activities',
            'Provide strong, clear sensory input',
            'Use movement and vibration',
            'Create highly stimulating environments'
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
      case 'visual': return 'Sight'
      case 'auditory': return 'Hearing'
      case 'olfactory': return 'Smell'
      case 'proprioceptive': return 'Body Awareness'
      case 'vestibular': return 'Movement'
      case 'interoception': return 'Internal Awareness'
      case 'social-emotional': return 'Social-Emotional'
      default: return system
    }
  }

  const getScoreInterpretation = (score: number) => {
    if (score <= 8) return { label: 'Avoiding', color: 'bg-red-100 text-red-700' }
    if (score <= 12) return { label: 'Sensitive', color: 'bg-orange-100 text-orange-700' }
    if (score <= 16) return { label: 'Typical', color: 'bg-gray-100 text-gray-700' }
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
    <div className="min-h-screen" style={{ backgroundColor: '#F6F6F6' }}>
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="text-left mb-8" style={{ marginTop: '70px' }}>
          {/* Title */}
          <h1 className="text-2xl font-bold text-left mb-2" style={{ color: '#252225' }}>
            {profile.child_name}&apos;s sensory profile is ready
          </h1>
          <p className="mb-6 text-left" style={{ fontSize: '16px', color: '#252225', fontWeight: 400 }}>
            Based on your assessment, here’s a personalized plan to support {profile.child_name}&apos;s sensory needs.
          </p>
        </div>

        {/* Assessment Results */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Assessment Results</h2>
          
          {/* System Breakdown */}
          <div className="space-y-4">
            {Object.entries(assessment.results).map(([system, score]) => {
              if (system === 'total' || system === 'profile' || system === 'behaviorScores') return null
              if (typeof score !== 'number') return null
              const interpretation = getScoreInterpretation(score)
              return (
                <div key={system} className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">{getSystemLabel(system)}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 font-medium">{score}/25</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${interpretation.color}`}>
                      {interpretation.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Value Proposition */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How Sensorysmart helps</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#367A87' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 font-medium">No more guessing what activities will work</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#367A87' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 font-medium">Stop the daily meltdowns and sensory overwhelm</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#367A87' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 font-medium">Get support throughout the week and in between therapy visits</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#367A87' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 font-medium">Track what works so you can do more of it</span>
            </div>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select your plan</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedPlan === key
                    ? 'border-[#367A87] bg-white'
                    : 'border-[#EEE6E5] bg-white'
                }`}
                onClick={() => setSelectedPlan(key)}
              >
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    selectedPlan === key ? 'text-[#367A87]' : 'text-[#252225]'
                  }`}>
                    ${plan.price}
                  </div>
                  <div className={`${
                    selectedPlan === key ? 'text-[#367A87]' : 'text-[#6C6C6C]'
                  } font-medium`}>
                    billed {plan.period === 'month' ? 'monthly' : 'yearly'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Payment details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Name on Card
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
                required
              />
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-[#252225]">Total:</span>
                <span className="text-[#252225]">
                  ${plans[selectedPlan as keyof typeof plans].price}
                  {selectedPlan === 'monthly' ? '/mo' : '/year'}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-2xl font-bold text-base hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: '#367A87', color: 'white' }}
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
                `Start ${profile.child_name}'s sensory journey`
              )}
            </button>
          </form>
        </div>

        {/* Disclaimer Blurb */}
        <div className="w-full flex justify-center mt-4">
          <p style={{ fontSize: '12pt', color: '#6C6C6C', lineHeight: '18px', fontWeight: 400, maxWidth: 600, textAlign: 'center' }}>
            Sensorysmart was developed with input from a licensed occupational therapist and provides educational activities based on professional knowledge. However, this app does not replace individualized therapy or medical consultation.
          </p>
        </div>
      </div>
    </div>
  )
} 