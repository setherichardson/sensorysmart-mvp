'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Assessment } from '@/lib/supabase/client'

export default function Results() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)
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
          // No assessment found, redirect to assessment
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

  const handleContinue = () => {
    setIsRedirecting(true)
    setTimeout(() => {
      // Redirect directly to Today view for immediate access to activities
      router.push('/dashboard/today')
    }, 1000)
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
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-base font-medium">Step 3 of 3</span>
            <span className="text-gray-600 text-base font-medium">100% complete</span>
          </div>
          <div className="bg-gray-200 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-black h-full rounded-full w-full" />
          </div>
        </div>

        <div className="px-6 py-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Assessment Complete!
            </h1>
            <p className="text-gray-600 text-base">
              Here's {profile.child_name}'s sensory profile
            </p>
          </div>

          {/* Profile Summary */}
          <div className="mb-8">
            <div className={`p-6 rounded-2xl ${profileInfo.color} mb-6`}>
              <h2 className="text-lg font-bold mb-2">{profileInfo.title}</h2>
              <p className="text-sm leading-relaxed">{profileInfo.description}</p>
            </div>

            {/* System Breakdown */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-gray-900">Sensory System Breakdown</h3>
              {Object.entries(assessment.results).map(([system, score]) => {
                if (system === 'total' || system === 'profile') return null
                const numericScore = typeof score === 'number' ? score : 0
                const interpretation = getScoreInterpretation(numericScore)
                return (
                  <div key={system} className="flex items-center justify-between">
                    <span className="text-gray-700">{getSystemLabel(system)}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{numericScore}/15</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${interpretation.color}`}>
                        {interpretation.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-8">
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

          {/* Action Button */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/onboarding/payment')}
              className="w-full py-4 px-6 rounded-2xl font-medium text-base bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-lg"
            >
              Get Access for $9.99/mo
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              Trusted by occupational therapists and sensory parents worldwide
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 