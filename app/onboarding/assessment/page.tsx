'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, SensoryProfile } from '@/lib/supabase/client'

interface Question {
  id: number
  text: string
  options: { text: string; score: number }[]
  system: string
  behaviorType: 'avoiding' | 'seeking' | 'sensitive' | 'low-registration'
}

export default function Assessment() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [currentQ, setCurrentQ] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('🎯 Assessment: Loading user data...')
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.log('❌ Assessment: No user found, redirecting to login')
          router.push('/login')
          return
        }

        console.log('✅ Assessment: User found:', user.email)

        // Get user profile with retry logic for timing issues
        let retries = 5
        let profileData = null
        let profileError = null

        while (retries > 0 && !profileData) {
          console.log(`🔄 Assessment: Fetching profile (${6 - retries}/5)...`)
          
          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          profileData = result.data
          profileError = result.error

          if (profileError || !profileData) {
            console.log('⚠️ Assessment: Profile not found, retrying in 1s...', profileError?.message)
            retries--
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          } else {
            console.log('✅ Assessment: Profile loaded:', profileData.child_name)
            break
          }
        }

        if (profileError || !profileData) {
          console.log('❌ Assessment: No profile found after retries, redirecting to onboarding')
          // Instead of redirecting, show a user-friendly error
          setError('Profile not found. Please go back and try creating your profile again.')
          setLoading(false)
          return
        }

        setUser(user)
        setProfile(profileData)
      } catch (err) {
        console.error('❌ Assessment: Error loading user data:', err)
        setError('Failed to load your profile. Please try refreshing the page or go back to create your profile again.')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const getPersonalizedQuestions = (childName: string): Question[] => [
    // 1. Tactile / Touch (5 Questions)
    {
      id: 1,
      text: `${childName} avoids messy play like finger paint or slime.`,
      system: 'tactile',
      behaviorType: 'avoiding',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    },
    {
      id: 2,
      text: `${childName} constantly touches objects, textures, or other people.`,
      system: 'tactile',
      behaviorType: 'seeking',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    {
      id: 3,
      text: `${childName} complains about clothing tags, seams, or certain fabrics.`,
      system: 'tactile',
      behaviorType: 'sensitive',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    },
    {
      id: 4,
      text: `${childName} doesn't notice when they have food or dirt on their face.`,
      system: 'tactile',
      behaviorType: 'low-registration',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    {
      id: 5,
      text: `${childName} pulls away from hugs or hand-holding.`,
      system: 'tactile',
      behaviorType: 'avoiding',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    },
    // 2. Visual / Sight (5 Questions)
    {
      id: 6,
      text: `${childName} is easily distracted by lights, colors, or movement.`,
      system: 'visual',
      behaviorType: 'sensitive',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    },
    {
      id: 7,
      text: `${childName} seeks out bright lights, spinning objects, or visual patterns.`,
      system: 'visual',
      behaviorType: 'seeking',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    {
      id: 8,
      text: `${childName} struggles to find objects even when they're visible.`,
      system: 'visual',
      behaviorType: 'low-registration',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    {
      id: 9,
      text: `${childName} stares at lights or spinning fans.`,
      system: 'visual',
      behaviorType: 'seeking',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    {
      id: 10,
      text: `${childName} avoids looking at bright lights or busy patterns.`,
      system: 'visual',
      behaviorType: 'avoiding',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    },
    // 3. Auditory / Hearing (5 Questions)
    {
      id: 11,
      text: `${childName} covers their ears at loud sounds.`,
      system: 'auditory',
      behaviorType: 'sensitive',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    },
    {
      id: 12,
      text: `${childName} seeks out loud noises or repetitive sounds.`,
      system: 'auditory',
      behaviorType: 'seeking',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    {
      id: 13,
      text: `${childName} doesn't respond when called by name.`,
      system: 'auditory',
      behaviorType: 'low-registration',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    {
      id: 14,
      text: `${childName} gets distracted by background noises.`,
      system: 'auditory',
      behaviorType: 'sensitive',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    },
    {
      id: 15,
      text: `${childName} avoids noisy environments.`,
      system: 'auditory',
      behaviorType: 'avoiding',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    },
    // 4. Olfactory / Smell (5 Questions)
    {
      id: 16,
      text: `${childName} is bothered by strong smells.`,
      system: 'olfactory',
      behaviorType: 'sensitive',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    },
    {
      id: 17,
      text: `${childName} seeks out strong smells or scents.`,
      system: 'olfactory',
      behaviorType: 'seeking',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    {
      id: 18,
      text: `${childName} doesn't notice strong odors.`,
      system: 'olfactory',
      behaviorType: 'low-registration',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    {
      id: 19,
      text: `${childName} avoids certain foods due to smell.`,
      system: 'olfactory',
      behaviorType: 'avoiding',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    },
    {
      id: 20,
      text: `${childName} sniffs objects or people.`,
      system: 'olfactory',
      behaviorType: 'seeking',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    // 5. Proprioceptive / Body Awareness (5 Questions)
    {
      id: 21,
      text: `${childName} crashes into things or people.`,
      system: 'proprioceptive',
      behaviorType: 'low-registration',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    {
      id: 22,
      text: `${childName} seeks out heavy work or deep pressure.`,
      system: 'proprioceptive',
      behaviorType: 'seeking',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    {
      id: 23,
      text: `${childName} is sensitive to being touched or moved.`,
      system: 'proprioceptive',
      behaviorType: 'sensitive',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    },
    {
      id: 24,
      text: `${childName} avoids physical activities or sports.`,
      system: 'proprioceptive',
      behaviorType: 'avoiding',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    },
    {
      id: 25,
      text: `${childName} has difficulty with fine motor tasks.`,
      system: 'proprioceptive',
      behaviorType: 'low-registration',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    // 6. Vestibular / Movement (5 Questions)
    {
      id: 26,
      text: `${childName} seeks out spinning, swinging, or bouncing.`,
      system: 'vestibular',
      behaviorType: 'seeking',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    {
      id: 27,
      text: `${childName} gets dizzy easily.`,
      system: 'vestibular',
      behaviorType: 'sensitive',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    },
    {
      id: 28,
      text: `${childName} avoids playground equipment or rides.`,
      system: 'vestibular',
      behaviorType: 'avoiding',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    },
    {
      id: 29,
      text: `${childName} doesn't notice when they're moving.`,
      system: 'vestibular',
      behaviorType: 'low-registration',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    {
      id: 30,
      text: `${childName} has poor balance or coordination.`,
      system: 'vestibular',
      behaviorType: 'low-registration',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    // 7. Interoception / Internal Sensations (4 Questions)
    {
      id: 31,
      text: `${childName} doesn't notice when they are hungry, thirsty, or tired.`,
      system: 'interoception',
      behaviorType: 'low-registration',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    {
      id: 32,
      text: `${childName} is very aware of internal sensations.`,
      system: 'interoception',
      behaviorType: 'sensitive',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    },
    {
      id: 33,
      text: `${childName} seeks out activities that provide internal feedback.`,
      system: 'interoception',
      behaviorType: 'seeking',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    {
      id: 34,
      text: `${childName} avoids activities that might cause internal sensations.`,
      system: 'interoception',
      behaviorType: 'avoiding',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    },
    // 8. Social-Emotional (4 Questions)
    {
      id: 35,
      text: `${childName} has difficulty reading social cues.`,
      system: 'social-emotional',
      behaviorType: 'low-registration',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    {
      id: 36,
      text: `${childName} is very sensitive to others' emotions.`,
      system: 'social-emotional',
      behaviorType: 'sensitive',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    },
    {
      id: 37,
      text: `${childName} seeks out social interactions intensely.`,
      system: 'social-emotional',
      behaviorType: 'seeking',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 4 },
        { text: 'Always', score: 5 }
      ]
    },
    {
      id: 38,
      text: `${childName} avoids social situations or crowds.`,
      system: 'social-emotional',
      behaviorType: 'avoiding',
      options: [
        { text: 'Never', score: 5 },
        { text: 'Rarely', score: 4 },
        { text: 'Sometimes', score: 3 },
        { text: 'Often', score: 2 },
        { text: 'Always', score: 1 }
      ]
    }
  ]

  // Get personalized questions based on profile
  const questions = profile ? getPersonalizedQuestions(profile.child_name) : []

  const calculateSensoryProfile = (): SensoryProfile => {
    const systemScores = {
      tactile: 0,
      visual: 0,
      auditory: 0,
      olfactory: 0,
      proprioceptive: 0,
      vestibular: 0,
      interoception: 0,
      'social-emotional': 0
    }

    const behaviorScores = {
      avoiding: 0,
      seeking: 0,
      sensitive: 0,
      'low-registration': 0
    }

    // Calculate scores for each system and behavior type
    questions.forEach(question => {
      const answer = answers[question.id]
      if (answer) {
        systemScores[question.system as keyof typeof systemScores] += answer
        behaviorScores[question.behaviorType] += answer
      }
    })

    const total = Object.values(systemScores).reduce((sum, score) => sum + score, 0)
    
    // Determine profile based on behavior patterns
    let profile = 'Mixed/Typical'
    const maxBehavior = Math.max(...Object.values(behaviorScores))
    const behaviorThreshold = 20 // Threshold for significant behavior pattern
    
    if (behaviorScores.seeking >= behaviorThreshold && behaviorScores.seeking > behaviorScores.avoiding) {
      profile = 'Sensory Seeking'
    } else if (behaviorScores.avoiding >= behaviorThreshold && behaviorScores.avoiding > behaviorScores.seeking) {
      profile = 'Sensory Avoiding'
    } else if (behaviorScores.sensitive >= behaviorThreshold) {
      profile = 'Sensory Sensitive'
    } else if (behaviorScores['low-registration'] >= behaviorThreshold) {
      profile = 'Low Registration'
    } else if (maxBehavior >= behaviorThreshold) {
      profile = 'Mixed Profile'
    }

    return {
      ...systemScores,
      total,
      profile,
      behaviorScores
    }
  }

  const handleAnswer = (score: number) => {
    setAnswers({ ...answers, [currentQ]: score })
    setError('') // Clear any previous errors
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQ < 38) {
        setCurrentQ(currentQ + 1)
      } else {
        // Submit assessment on last question
        handleSubmitAssessment()
      }
    }, 300)
  }

  const handleSubmitAssessment = async () => {
    setSubmitting(true)
    setError('')

    try {
      if (!user) throw new Error('User not authenticated')

      const sensoryProfile = calculateSensoryProfile()
      
      // Save assessment to Supabase
      const { error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          responses: answers,
          results: sensoryProfile,
          completed_at: new Date().toISOString()
        })

      if (assessmentError) {
        throw assessmentError
      }

      // Success! Redirect to results and payment
      router.push('/onboarding/results-payment')
    } catch (err) {
      console.error('Error saving assessment:', err)
      setError('Failed to save assessment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    if (currentQ > 1) {
      setCurrentQ(currentQ - 1)
    } else {
      router.push('/onboarding')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    )
  }

  // No user or profile
  if (!user || !profile) {
    return null // Will redirect
  }

  const currentQuestion = questions[currentQ - 1]
  const hasAnswer = answers[currentQ]
  const progress = Math.round((currentQ / 38) * 100)
  const overallProgress = Math.round(33 + (progress * 0.34)) // 33% from onboarding + 34% for assessment

  return (
    <div className="min-h-screen" style={{ background: '#F6F6F6' }}>
      <div className="max-w-md mx-auto">
        {/* Header with Back Button and Question Number */}
        <div className="flex items-center justify-between px-4 pt-8 pb-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-[#6C6C6C] hover:text-[#252225] focus:outline-none"
            disabled={submitting}
            style={{ fontSize: 24 }}
          >
            <span style={{ fontSize: 24, lineHeight: 1 }}>←</span>
          </button>
          <span className="text-[#6C6C6C] text-base font-normal">Question {currentQ} of 38</span>
        </div>

        <div className="px-4 py-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          {/* Title */}
          <h1
            className="text-[26px] text-[#252225] mb-8 text-left font-medium"
            style={{ letterSpacing: '-1px', lineHeight: 'calc(1.2em - 2px)' }}
          >
            {currentQuestion?.text}
          </h1>

          {/* Options */}
          <div className="space-y-3 mb-10">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQ] === option.score
              return (
                <button
                  key={option.score}
                  className={`w-full py-3 px-4 rounded-[16px] border transition-all duration-200 text-[16px] font-normal text-center flex justify-center items-center ${
                    isSelected
                      ? 'border-2 border-[#367A87] bg-white text-[#252225] font-semibold shadow-sm animate-fade-in'
                      : 'border border-[#EEE6E5] bg-white text-[#252225] hover:border-[#367A87]'
                  }`}
                  style={{ transition: 'border-color 120ms cubic-bezier(0.4,0,0.2,1), border-width 120ms cubic-bezier(0.4,0,0.2,1)' }}
                  onClick={() => handleAnswer(option.score)}
                  disabled={submitting}
                >
                  {option.text}
                </button>
              )
            })}
          </div>

          {/* Progress Indicator */}
          {submitting && (
            <div className="text-center py-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-300 mr-2"></div>
                Saving Assessment...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 