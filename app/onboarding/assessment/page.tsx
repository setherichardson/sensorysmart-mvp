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
    // Tactile (Touch) Questions 1-3
    {
      id: 1,
      text: `When ${profile?.child_name || '[Child\'s name]'} gets food on their hands or face during meals, they:`,
      system: 'tactile',
      options: [
        { text: 'Always get upset and want it cleaned off immediately', score: 1 },
        { text: 'Usually get upset and want help cleaning it off', score: 2 },
        { text: 'Sometimes notice and may ask for help', score: 3 },
        { text: 'Rarely seem bothered by it', score: 4 },
        { text: 'Never seem to notice or care', score: 5 }
      ]
    },
    {
      id: 2,
      text: `When playing with messy materials (playdough, finger paint, sand), ${profile?.child_name || '[Child\'s name]'}:`,
      system: 'tactile',
      options: [
        { text: 'Always avoids or refuses to touch them', score: 1 },
        { text: 'Usually avoids but might try briefly', score: 2 },
        { text: 'Sometimes enjoys them, sometimes doesn\'t', score: 3 },
        { text: 'Usually enjoys and explores them', score: 4 },
        { text: 'Always seeks out and loves messy play', score: 5 }
      ]
    },
    {
      id: 3,
      text: `When someone touches ${profile?.child_name || '[Child\'s name]'} unexpectedly (like a tap on the shoulder), they:`,
      system: 'tactile',
      options: [
        { text: 'Always react strongly or get upset', score: 1 },
        { text: 'Usually react with surprise or discomfort', score: 2 },
        { text: 'Sometimes react, depending on their mood', score: 3 },
        { text: 'Rarely react much to unexpected touch', score: 4 },
        { text: 'Never seem bothered by unexpected touch', score: 5 }
      ]
    },
    // Auditory Questions 4-6
    {
      id: 4,
      text: `When there are loud or sudden sounds (vacuum, blender, fire alarm), ${profile?.child_name || '[Child\'s name]'}:`,
      system: 'auditory',
      options: [
        { text: 'Always covers ears or becomes very upset', score: 1 },
        { text: 'Usually gets upset or tries to leave the area', score: 2 },
        { text: 'Sometimes reacts but can usually handle it', score: 3 },
        { text: 'Rarely seems bothered by loud sounds', score: 4 },
        { text: 'Never seems to notice or react to loud sounds', score: 5 }
      ]
    },
    {
      id: 5,
      text: `${profile?.child_name || '[Child\'s name]'} tends to:`,
      system: 'auditory',
      options: [
        { text: 'Always seek quiet environments', score: 1 },
        { text: 'Usually prefer quieter spaces', score: 2 },
        { text: 'Be okay with moderate noise levels', score: 3 },
        { text: 'Usually enjoy louder, more active environments', score: 4 },
        { text: 'Always seek out noisy, stimulating environments', score: 5 }
      ]
    },
    {
      id: 6,
      text: `When trying to listen in a noisy environment (restaurant, classroom), ${profile?.child_name || '[Child\'s name]'}:`,
      system: 'auditory',
      options: [
        { text: 'Always has great difficulty focusing', score: 1 },
        { text: 'Usually struggles to pay attention', score: 2 },
        { text: 'Sometimes has trouble, sometimes doesn\'t', score: 3 },
        { text: 'Usually can focus okay', score: 4 },
        { text: 'Never seems to have trouble filtering sounds', score: 5 }
      ]
    },
    // Visual Questions 7-9
    {
      id: 7,
      text: `In bright lights or sunny environments, ${profile?.child_name || '[Child\'s name]'}:`,
      system: 'visual',
      options: [
        { text: 'Always squints, complains, or seeks dimmer areas', score: 1 },
        { text: 'Usually shows discomfort with bright lights', score: 2 },
        { text: 'Sometimes is bothered, sometimes isn\'t', score: 3 },
        { text: 'Usually handles bright lights fine', score: 4 },
        { text: 'Never seems bothered by any lighting', score: 5 }
      ]
    },
    {
      id: 8,
      text: `In busy visual environments (stores, parties, crowded places), ${profile?.child_name || '[Child\'s name]'}:`,
      system: 'visual',
      options: [
        { text: 'Always becomes overwhelmed or upset', score: 1 },
        { text: 'Usually gets overstimulated or tired', score: 2 },
        { text: 'Sometimes handles it well, sometimes doesn\'t', score: 3 },
        { text: 'Usually enjoys the visual activity', score: 4 },
        { text: 'Always seeks out visually busy, exciting places', score: 5 }
      ]
    },
    {
      id: 9,
      text: `When looking at books or doing visual tasks, ${profile?.child_name || '[Child\'s name]'}:`,
      system: 'visual',
      options: [
        { text: 'Always has difficulty focusing or gets overwhelmed', score: 1 },
        { text: 'Usually struggles with visual attention', score: 2 },
        { text: 'Sometimes focuses well, sometimes struggles', score: 3 },
        { text: 'Usually maintains good visual attention', score: 4 },
        { text: 'Always focuses intensely and for long periods', score: 5 }
      ]
    },
    // Vestibular Questions 10-12
    {
      id: 10,
      text: `On playground equipment (swings, slides, merry-go-rounds), ${profile?.child_name || '[Child\'s name]'}:`,
      system: 'vestibular',
      options: [
        { text: 'Always avoids or becomes fearful', score: 1 },
        { text: 'Usually shows caution or mild fear', score: 2 },
        { text: 'Sometimes enjoys it, sometimes is cautious', score: 3 },
        { text: 'Usually enjoys movement activities', score: 4 },
        { text: 'Always seeks intense movement and spinning', score: 5 }
      ]
    },
    {
      id: 11,
      text: `Throughout the day, ${profile?.child_name || '[Child\'s name]'}:`,
      system: 'vestibular',
      options: [
        { text: 'Always prefers to stay still and calm', score: 1 },
        { text: 'Usually chooses quieter, less active play', score: 2 },
        { text: 'Sometimes seeks movement, sometimes prefers calm', score: 3 },
        { text: 'Usually seeks active, moving activities', score: 4 },
        { text: 'Always needs to be moving or fidgeting', score: 5 }
      ]
    },
    {
      id: 12,
      text: `When walking on uneven surfaces or stairs, ${profile?.child_name || '[Child\'s name]'}:`,
      system: 'vestibular',
      options: [
        { text: 'Always shows fear or needs extra support', score: 1 },
        { text: 'Usually is cautious or needs some help', score: 2 },
        { text: 'Sometimes is confident, sometimes cautious', score: 3 },
        { text: 'Usually moves confidently', score: 4 },
        { text: 'Never shows any concern about balance', score: 5 }
      ]
    },
    // Proprioceptive Questions 13-15
    {
      id: 13,
      text: `${profile?.child_name || '[Child\'s name]'} enjoys activities that involve pushing, pulling, or carrying heavy things:`,
      system: 'proprioceptive',
      options: [
        { text: 'Never - they avoid any physical effort', score: 1 },
        { text: 'Rarely - they prefer light activities', score: 2 },
        { text: 'Sometimes - depends on their mood', score: 3 },
        { text: 'Usually - they often choose these activities', score: 4 },
        { text: 'Always - they constantly seek heavy work', score: 5 }
      ]
    },
    {
      id: 14,
      text: `${profile?.child_name || '[Child\'s name]'} seems to know where their body is in space and how much force to use:`,
      system: 'proprioceptive',
      options: [
        { text: 'Never - often bumps into things or uses too much/little force', score: 1 },
        { text: 'Rarely - frequently has trouble with body awareness', score: 2 },
        { text: 'Sometimes - depends on the situation', score: 3 },
        { text: 'Usually - good body awareness most of the time', score: 4 },
        { text: 'Always - excellent body awareness and motor control', score: 5 }
      ]
    },
    {
      id: 15,
      text: `When upset or overwhelmed, ${profile?.child_name || '[Child\'s name]'} responds well to:`,
      system: 'proprioceptive',
      options: [
        { text: 'Very gentle, minimal touch or pressure', score: 1 },
        { text: 'Light, soothing touch', score: 2 },
        { text: 'It depends on the situation', score: 3 },
        { text: 'Firm hugs or pressure', score: 4 },
        { text: 'Very tight hugs, weighted blankets, or deep pressure', score: 5 }
      ]
    }
  ]

  const calculateSensoryProfile = (): SensoryProfile => {
    const systemScores = {
      tactile: 0,
      auditory: 0,
      visual: 0,
      vestibular: 0,
      proprioceptive: 0
    }

    // Calculate scores for each system
    questions.forEach(question => {
      const answer = answers[question.id]
      if (answer) {
        systemScores[question.system as keyof typeof systemScores] += answer
      }
    })

    const total = Object.values(systemScores).reduce((sum, score) => sum + score, 0)
    
    // Determine profile based on scores
    let profile = 'Mixed/Typical'
    if (total >= 60) {
      profile = 'Sensory Seeking'
    } else if (total <= 30) {
      profile = 'Sensory Avoiding'
    } else {
      // Check for mixed patterns
      const seekingCount = Object.values(systemScores).filter(score => score >= 12).length
      const avoidingCount = Object.values(systemScores).filter(score => score <= 6).length
      
      if (seekingCount >= 2 && avoidingCount >= 2) {
        profile = 'Mixed Profile'
      }
    }

    return {
      ...systemScores,
      total,
      profile
    }
  }

  const handleAnswer = (score: number) => {
    setAnswers({ ...answers, [currentQ]: score })
    setError('') // Clear any previous errors
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQ < 15) {
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
  const progress = Math.round((currentQ / 15) * 100)
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
              <span className="text-gray-600 text-sm">Question {currentQ} of 15</span>
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