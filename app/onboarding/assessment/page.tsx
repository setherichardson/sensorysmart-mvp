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
        let retries = 3
        let profileData = null
        let profileError = null

        while (retries > 0 && !profileData) {
          console.log(`🔄 Assessment: Fetching profile (${4 - retries}/3)...`)
          
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
          router.push('/onboarding')
          return
        }

        setUser(user)
        setProfile(profileData)
      } catch (err) {
        console.error('❌ Assessment: Error loading user data:', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const questions: Question[] = [
    // 1. Tactile / Touch (5 Questions)
    {
      id: 1,
      text: `My child avoids messy play like finger paint or slime.`,
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
      text: `My child constantly touches objects, textures, or other people.`,
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
      text: `My child complains about clothing tags, seams, or certain fabrics.`,
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
      text: `My child doesn't notice when they have food or dirt on their face.`,
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
      text: `My child pulls away from hugs or hand-holding.`,
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
      text: `My child is easily distracted by lights, colors, or movement.`,
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
      text: `My child seeks out bright lights, spinning objects, or visual patterns.`,
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
      text: `My child struggles to find objects even when they're visible.`,
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
      text: `My child stares at lights or spinning fans.`,
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
      text: `My child squints, looks away, or shields eyes from lights.`,
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
    // 3. Auditory / Sound (5 Questions)
    {
      id: 11,
      text: `My child covers their ears in noisy environments.`,
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
      text: `My child doesn't respond when their name is called.`,
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
      id: 13,
      text: `My child seeks out loud or repetitive noises.`,
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
      id: 14,
      text: `My child is startled by sudden sounds more than others.`,
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
      text: `My child talks loudly or constantly makes noise.`,
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
    // 4. Olfactory / Smell (4 Questions)
    {
      id: 16,
      text: `My child complains about smells others don't notice.`,
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
      text: `My child frequently smells objects, food, or people.`,
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
      text: `My child avoids foods or places due to smell.`,
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
      id: 19,
      text: `My child doesn't notice strong odors (like perfume or cleaning products).`,
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
    // 5. Proprioception / Body Awareness (5 Questions)
    {
      id: 20,
      text: `My child enjoys crashing, jumping, or falling into things.`,
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
      id: 21,
      text: `My child hugs too hard or plays roughly.`,
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
      id: 22,
      text: `My child appears clumsy or bumps into people/objects.`,
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
      id: 23,
      text: `My child tires easily or avoids movement games.`,
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
      id: 24,
      text: `My child presses too hard when writing or coloring.`,
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
    // 6. Vestibular / Balance & Movement (5 Questions)
    {
      id: 25,
      text: `My child loves spinning, swinging, or being upside down.`,
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
      id: 26,
      text: `My child avoids swings, slides, or fast-moving activities.`,
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
      id: 27,
      text: `My child becomes dizzy or off-balance easily.`,
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
      text: `My child constantly moves, even when sitting.`,
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
      id: 29,
      text: `My child seems unaware of their speed or body in space.`,
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
    // 7. Interoception / Internal Body Awareness (5 Questions)
    {
      id: 30,
      text: `My child doesn't notice when they're hungry, thirsty, or tired.`,
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
      id: 31,
      text: `My child overreacts to small injuries or internal sensations.`,
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
      id: 32,
      text: `My child doesn't recognize when they need to go to the bathroom.`,
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
      id: 33,
      text: `My child complains often of being "too hot" or "too cold."`,
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
      id: 34,
      text: `My child doesn't ask for help when uncomfortable or unwell.`,
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
    // 8. Social-Emotional Regulation (4 Questions)
    {
      id: 35,
      text: `My child has frequent emotional outbursts or meltdowns.`,
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
      id: 36,
      text: `My child doesn't notice when others are upset or reacting.`,
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
      id: 37,
      text: `My child seeks excessive attention through physical play or sound.`,
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
      text: `My child avoids group play or social situations.`,
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
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 text-base font-medium"
            disabled={submitting}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <div className="px-6 py-6">
          {/* Progress Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 text-sm">Question {currentQ} of 38</span>
            </div>
            {/* Progress Bar */}
            <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-black h-full transition-all duration-300 ease-out rounded-full"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          {/* Question */}
          <h2 className="text-xl font-bold mb-8 leading-relaxed text-gray-900">
            {currentQuestion.text}
          </h2>

          {/* Options */}
          <div className="space-y-2 mb-10">
            {currentQuestion.options.map((option) => (
              <button
                key={option.score}
                className={`w-full p-3 text-left rounded-2xl border transition-all duration-200 text-sm ${
                  answers[currentQ] === option.score
                    ? 'border-black bg-gray-50 text-black font-medium' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                onClick={() => handleAnswer(option.score)}
                disabled={submitting}
              >
                {option.text}
              </button>
            ))}
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