'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Assessment, ActivityCompletion } from '@/lib/supabase/client'
import ActivityStory from '../../components/ActivityStory'
import BehaviorHelpModal from '../../components/BehaviorHelpModal'

interface Activity {
  id: string
  title: string
  context: string
  duration: string
  type: 'proprioceptive' | 'vestibular' | 'tactile' | 'heavy-work' | 'calming' | 'auditory' | 'visual' | 'olfactory' | 'interoception'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  sensorySystems: string[] // Which sensory systems this activity targets
  behaviorFit: 'seeking' | 'avoiding' | 'sensitive' | 'low-registration' | 'mixed'
  description: string
  benefits: string[]
  whenToUse: string
}

interface ActivityStep {
  id: number
  instruction: string
}

export default function TodayDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [activityCompletions, setActivityCompletions] = useState<ActivityCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingActivity, setSubmittingActivity] = useState<string | null>(null)
  const [storyOpen, setStoryOpen] = useState(false)
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null)
  const [behaviorHelpOpen, setBehaviorHelpOpen] = useState(false)

  // Comprehensive Activity Library
  const activityLibrary: Activity[] = [
    // Proprioceptive Activities
    {
      id: 'wall-pushups',
      title: 'Wall Push-ups',
      context: 'Great for morning regulation',
      duration: '2-3 minutes',
      type: 'proprioceptive',
      difficulty: 'beginner',
      sensorySystems: ['proprioceptive'],
      behaviorFit: 'seeking',
      description: 'Deep pressure input through pushing against a wall',
      benefits: ['Provides deep pressure input', 'Helps with regulation', 'Easy to do anywhere'],
      whenToUse: 'When seeking proprioceptive input or needing to calm down'
    },
    {
      id: 'resistance-band-pull',
      title: 'Resistance Band Pull',
      context: 'Perfect before lunch to help focus',
      duration: '3-5 minutes',
      type: 'heavy-work',
      difficulty: 'beginner',
      sensorySystems: ['proprioceptive'],
      behaviorFit: 'seeking',
      description: 'Pulling resistance band for muscle input',
      benefits: ['Provides heavy work', 'Improves focus', 'Strengthens muscles'],
      whenToUse: 'Before tasks requiring concentration'
    },
    {
      id: 'weighted-lap-pad',
      title: 'Weighted Lap Pad',
      context: 'Ideal for afternoon energy',
      duration: '10-15 minutes',
      type: 'calming',
      difficulty: 'beginner',
      sensorySystems: ['proprioceptive', 'tactile'],
      behaviorFit: 'avoiding',
      description: 'Gentle pressure from weighted pad on lap',
      benefits: ['Provides gentle pressure', 'Calming effect', 'Non-intrusive'],
      whenToUse: 'When feeling overwhelmed or needing gentle input'
    },
    {
      id: 'bear-hugs',
      title: 'Bear Hugs',
      context: 'Great for transitions',
      duration: '1-2 minutes',
      type: 'proprioceptive',
      difficulty: 'beginner',
      sensorySystems: ['proprioceptive', 'tactile'],
      behaviorFit: 'seeking',
      description: 'Firm, deep pressure hugs',
      benefits: ['Provides deep pressure', 'Emotional connection', 'Calming'],
      whenToUse: 'During transitions or when seeking comfort'
    },
    {
      id: 'chair-pushups',
      title: 'Chair Push-ups',
      context: 'Good for focus during seated work',
      duration: '1-2 minutes',
      type: 'proprioceptive',
      difficulty: 'beginner',
      sensorySystems: ['proprioceptive'],
      behaviorFit: 'seeking',
      description: 'Lifting body from chair using arm strength',
      benefits: ['Provides proprioceptive input', 'Improves focus', 'Strengthens arms'],
      whenToUse: 'During seated activities when needing input'
    },
    // Vestibular Activities
    {
      id: 'slow-spinning',
      title: 'Slow Spinning',
      context: 'Good for vestibular seeking',
      duration: '2-3 minutes',
      type: 'vestibular',
      difficulty: 'beginner',
      sensorySystems: ['vestibular'],
      behaviorFit: 'seeking',
      description: 'Gentle spinning in a chair or standing',
      benefits: ['Provides vestibular input', 'Can be calming', 'Improves balance'],
      whenToUse: 'When seeking movement input'
    },
    {
      id: 'rocking-chair',
      title: 'Rocking Chair',
      context: 'Calming vestibular input',
      duration: '5-10 minutes',
      type: 'calming',
      difficulty: 'beginner',
      sensorySystems: ['vestibular'],
      behaviorFit: 'avoiding',
      description: 'Gentle rocking motion',
      benefits: ['Calming effect', 'Gentle vestibular input', 'Relaxing'],
      whenToUse: 'When feeling overwhelmed or needing to calm down'
    },
    // Tactile Activities
    {
      id: 'texture-exploration',
      title: 'Texture Exploration',
      context: 'Good for tactile integration',
      duration: '5-10 minutes',
      type: 'tactile',
      difficulty: 'beginner',
      sensorySystems: ['tactile'],
      behaviorFit: 'avoiding',
      description: 'Exploring different textures with hands',
      benefits: ['Desensitizes tactile sensitivity', 'Improves tolerance', 'Educational'],
      whenToUse: 'When working on tactile tolerance'
    },
    {
      id: 'finger-painting',
      title: 'Finger Painting',
      context: 'Messy play for tactile seekers',
      duration: '10-15 minutes',
      type: 'tactile',
      difficulty: 'intermediate',
      sensorySystems: ['tactile'],
      behaviorFit: 'seeking',
      description: 'Painting with fingers for tactile input',
      benefits: ['Provides tactile input', 'Creative expression', 'Sensory exploration'],
      whenToUse: 'When seeking tactile input or creative activities'
    },
    // Auditory Activities
    {
      id: 'quiet-time',
      title: 'Quiet Time',
      context: 'For auditory sensitivity',
      duration: '5-10 minutes',
      type: 'calming',
      difficulty: 'beginner',
      sensorySystems: ['auditory'],
      behaviorFit: 'avoiding',
      description: 'Time in a quiet space with noise reduction',
      benefits: ['Reduces auditory input', 'Calming effect', 'Regulation'],
      whenToUse: 'When feeling overwhelmed by noise'
    },
    {
      id: 'rhythm-clapping',
      title: 'Rhythm Clapping',
      context: 'Good for auditory seekers',
      duration: '3-5 minutes',
      type: 'auditory',
      difficulty: 'beginner',
      sensorySystems: ['auditory', 'proprioceptive'],
      behaviorFit: 'seeking',
      description: 'Clapping to rhythms and patterns',
      benefits: ['Provides auditory input', 'Improves rhythm', 'Fun activity'],
      whenToUse: 'When seeking auditory input or needing energy'
    },
    // Visual Activities
    {
      id: 'visual-tracking',
      title: 'Visual Tracking',
      context: 'For visual processing',
      duration: '3-5 minutes',
      type: 'visual',
      difficulty: 'beginner',
      sensorySystems: ['visual'],
      behaviorFit: 'mixed',
      description: 'Following objects with eyes',
      benefits: ['Improves visual tracking', 'Focus development', 'Eye coordination'],
      whenToUse: 'When working on visual skills'
    },
    {
      id: 'dim-lighting',
      title: 'Dim Lighting Time',
      context: 'For visual sensitivity',
      duration: '5-10 minutes',
      type: 'calming',
      difficulty: 'beginner',
      sensorySystems: ['visual'],
      behaviorFit: 'avoiding',
      description: 'Time in reduced lighting',
      benefits: ['Reduces visual input', 'Calming effect', 'Regulation'],
      whenToUse: 'When feeling overwhelmed by bright lights'
    },
    // Interoception Activities
    {
      id: 'body-scan',
      title: 'Body Scan',
      context: 'For interoception awareness',
      duration: '3-5 minutes',
      type: 'interoception',
      difficulty: 'beginner',
      sensorySystems: ['interoception'],
      behaviorFit: 'low-registration',
      description: 'Mindful awareness of body sensations',
      benefits: ['Improves body awareness', 'Self-regulation', 'Mindfulness'],
      whenToUse: 'When working on body awareness'
    },
    {
      id: 'hunger-thirst-check',
      title: 'Hunger & Thirst Check',
      context: 'For interoception development',
      duration: '1-2 minutes',
      type: 'interoception',
      difficulty: 'beginner',
      sensorySystems: ['interoception'],
      behaviorFit: 'low-registration',
      description: 'Regular check-ins for hunger and thirst',
      benefits: ['Improves body awareness', 'Self-care skills', 'Regulation'],
      whenToUse: 'Throughout the day for body awareness'
    }
  ]

  // Personalization Logic
  const getPersonalizedActivities = async (assessment: Assessment) => {
    if (!assessment?.results) return []

    const results = assessment.results as any
    const behaviorScores = results.behaviorScores || {}
    
    // Get activities from database
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error || !activities) {
      console.error('Error fetching activities:', error)
      return []
    }

    // Score activities based on child's profile
    const scoredActivities = activities.map(activity => {
      let score = 0
      
      // Score based on behavior fit
      const dominantBehavior = getDominantBehavior(behaviorScores)
      if (activity.behavior_fit === dominantBehavior) {
        score += 10
      } else if (activity.behavior_fit === 'mixed') {
        score += 5
      }

      // Score based on sensory system needs
      const challengingSystems = getChallengingSystems(results)
      const activitySystems = activity.sensory_systems || []
      
      challengingSystems.forEach(system => {
        if (activitySystems.includes(system)) {
          score += 8
        }
      })

      // Score based on difficulty (prefer beginner for high avoiding/sensitive)
      if (behaviorScores.avoiding > 15 || behaviorScores.sensitive > 15) {
        if (activity.difficulty === 'beginner') score += 5
        else if (activity.difficulty === 'advanced') score -= 3
      }

      // Score based on age appropriateness
      if (profile?.child_age && activity.age_range) {
        const childAge = parseInt(profile.child_age.split('-')[0])
        const activityAge = parseInt(activity.age_range.split('-')[0])
        if (Math.abs(childAge - activityAge) <= 2) {
          score += 3
        }
      }

      return { ...activity, score }
    })

    // Sort by score and return top 6
    return scoredActivities
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
  }

  const getDominantBehavior = (behaviorScores: any) => {
    const scores = [
      { type: 'seeking', score: behaviorScores.seeking || 0 },
      { type: 'avoiding', score: behaviorScores.avoiding || 0 },
      { type: 'sensitive', score: behaviorScores.sensitive || 0 },
      { type: 'low-registration', score: behaviorScores['low-registration'] || 0 }
    ]
    
    return scores.reduce((max, current) => 
      current.score > max.score ? current : max
    ).type
  }

  const getChallengingSystems = (results: any) => {
    const systems = ['tactile', 'visual', 'auditory', 'olfactory', 'proprioceptive', 'vestibular', 'interoception', 'social-emotional']
    const challenging: string[] = []
    
    systems.forEach(system => {
      if (results[system] && results[system] > 15) {
        challenging.push(system)
      }
    })
    
    return challenging
  }

  const todaysActivities = async () => {
    if (!assessment) {
      // Return general activities if no assessment
      return activityLibrary.slice(0, 3)
    }
    return await getPersonalizedActivities(assessment)
  }

  // Activity instructions for all activities
  const getActivitySteps = (activityId: string): ActivityStep[] => {
    switch (activityId) {
      case 'wall-pushups':
        return [
          { id: 1, instruction: 'Stand facing a wall' },
          { id: 2, instruction: 'Place your hands on the wall at shoulder height' },
          { id: 3, instruction: 'Step back so your arms are straight' },
          { id: 4, instruction: 'Bend your elbows and lean toward the wall' },
          { id: 5, instruction: 'Push back to the starting position' },
          { id: 6, instruction: 'Repeat 5 times' }
        ]
      case 'resistance-band-pull':
        return [
          { id: 1, instruction: 'Sit in a comfortable chair' },
          { id: 2, instruction: 'Hold the resistance band with both hands' },
          { id: 3, instruction: 'Keep your elbows at your sides' },
          { id: 4, instruction: 'Pull the band apart slowly' },
          { id: 5, instruction: 'Hold for 3 seconds' },
          { id: 6, instruction: 'Release slowly and repeat 10 times' }
        ]
      case 'weighted-lap-pad':
        return [
          { id: 1, instruction: 'Find a quiet, comfortable space' },
          { id: 2, instruction: 'Place the weighted lap pad on your lap' },
          { id: 3, instruction: 'Take 3 deep breaths' },
          { id: 4, instruction: 'Close your eyes and feel the weight' },
          { id: 5, instruction: 'Stay still and relaxed for 5 minutes' },
          { id: 6, instruction: 'Slowly remove the pad when finished' }
        ]
      case 'bear-hugs':
        return [
          { id: 1, instruction: 'Stand or sit comfortably' },
          { id: 2, instruction: 'Wrap arms around yourself' },
          { id: 3, instruction: 'Apply firm, even pressure' },
          { id: 4, instruction: 'Hold for 10 seconds' },
          { id: 5, instruction: 'Release slowly' },
          { id: 6, instruction: 'Repeat 3 times' }
        ]
      case 'chair-pushups':
        return [
          { id: 1, instruction: 'Sit in a chair with armrests' },
          { id: 2, instruction: 'Place hands on armrests' },
          { id: 3, instruction: 'Lift your body slightly off the chair' },
          { id: 4, instruction: 'Hold for 3 seconds' },
          { id: 5, instruction: 'Lower back down slowly' },
          { id: 6, instruction: 'Repeat 5 times' }
        ]
      case 'slow-spinning':
        return [
          { id: 1, instruction: 'Stand in an open space' },
          { id: 2, instruction: 'Extend arms out to sides' },
          { id: 3, instruction: 'Turn slowly in one direction' },
          { id: 4, instruction: 'Complete 3 full rotations' },
          { id: 5, instruction: 'Stop and wait 10 seconds' },
          { id: 6, instruction: 'Repeat in opposite direction' }
        ]
      case 'rocking-chair':
        return [
          { id: 1, instruction: 'Sit in a rocking chair' },
          { id: 2, instruction: 'Place feet flat on the ground' },
          { id: 3, instruction: 'Begin gentle rocking motion' },
          { id: 4, instruction: 'Focus on the rhythm' },
          { id: 5, instruction: 'Rock for 5-10 minutes' },
          { id: 6, instruction: 'Slowly stop when finished' }
        ]
      case 'texture-exploration':
        return [
          { id: 1, instruction: 'Gather different textured items' },
          { id: 2, instruction: 'Start with familiar textures' },
          { id: 3, instruction: 'Touch each texture gently' },
          { id: 4, instruction: 'Describe how each feels' },
          { id: 5, instruction: 'Try new textures gradually' },
          { id: 6, instruction: 'Take breaks if needed' }
        ]
      case 'finger-painting':
        return [
          { id: 1, instruction: 'Set up painting area with paper' },
          { id: 2, instruction: 'Pour paint onto paper' },
          { id: 3, instruction: 'Start with one finger' },
          { id: 4, instruction: 'Make different patterns' },
          { id: 5, instruction: 'Try different colors' },
          { id: 6, instruction: 'Clean up when finished' }
        ]
      case 'quiet-time':
        return [
          { id: 1, instruction: 'Find a quiet space' },
          { id: 2, instruction: 'Turn off electronics' },
          { id: 3, instruction: 'Sit or lie comfortably' },
          { id: 4, instruction: 'Close your eyes' },
          { id: 5, instruction: 'Focus on breathing' },
          { id: 6, instruction: 'Stay for 5-10 minutes' }
        ]
      case 'rhythm-clapping':
        return [
          { id: 1, instruction: 'Sit or stand comfortably' },
          { id: 2, instruction: 'Start with simple rhythm' },
          { id: 3, instruction: 'Clap hands together' },
          { id: 4, instruction: 'Try different patterns' },
          { id: 5, instruction: 'Add counting' },
          { id: 6, instruction: 'Make it fun!' }
        ]
      case 'visual-tracking':
        return [
          { id: 1, instruction: 'Hold a small object' },
          { id: 2, instruction: 'Move it slowly left to right' },
          { id: 3, instruction: 'Follow with eyes only' },
          { id: 4, instruction: 'Move up and down' },
          { id: 5, instruction: 'Make figure-8 pattern' },
          { id: 6, instruction: 'Take breaks if eyes get tired' }
        ]
      case 'dim-lighting':
        return [
          { id: 1, instruction: 'Turn off bright lights' },
          { id: 2, instruction: 'Use soft lighting' },
          { id: 3, instruction: 'Find comfortable spot' },
          { id: 4, instruction: 'Close eyes if needed' },
          { id: 5, instruction: 'Stay for 5-10 minutes' },
          { id: 6, instruction: 'Gradually increase light' }
        ]
      case 'body-scan':
        return [
          { id: 1, instruction: 'Lie down comfortably' },
          { id: 2, instruction: 'Close your eyes' },
          { id: 3, instruction: 'Focus on your toes' },
          { id: 4, instruction: 'Move attention up your body' },
          { id: 5, instruction: 'Notice how each part feels' },
          { id: 6, instruction: 'End with your head' }
        ]
      case 'hunger-thirst-check':
        return [
          { id: 1, instruction: 'Stop what you\'re doing' },
          { id: 2, instruction: 'Take a deep breath' },
          { id: 3, instruction: 'Ask: "Am I hungry?"' },
          { id: 4, instruction: 'Ask: "Am I thirsty?"' },
          { id: 5, instruction: 'Notice how your body feels' },
          { id: 6, instruction: 'Get what you need' }
        ]
      default:
        return [
          { id: 1, instruction: 'Instructions coming soon!' }
        ]
    }
  }

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

        // Get latest assessment (optional)
        const { data: assessmentData } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single()

        // Get recent activity completions
        const { data: completionsData } = await supabase
          .from('activity_completions')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(20)

        setUser(user)
        setProfile(profileData)
        setAssessment(assessmentData)
        setActivityCompletions(completionsData || [])
      } catch (err) {
        console.error('Error loading user data:', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const handleStartActivity = async (activity: Activity) => {
    if (!user) return
    
    console.log('Starting activity:', activity.title)
    setSubmittingActivity(activity.id)

    try {
      // Just open the story for this activity - don't log to database yet
      console.log('Setting current activity and opening story')
      setCurrentActivity(activity)
      setStoryOpen(true)
      
      console.log(`Activity started: ${activity.title}`)
      console.log('Story state after setting:', { currentActivity: activity, storyOpen: true })
    } catch (err) {
      console.error('Error starting activity:', err)
    } finally {
      setSubmittingActivity(null)
    }
  }

  const handleCompleteActivity = async (activity: Activity, durationMinutes?: number) => {
    if (!user) {
      console.error('No user found when completing activity')
      return
    }

    console.log('Completing activity:', activity.title, 'Duration:', durationMinutes)
    console.log('User ID:', user.id)

    try {
      // For now, let's bypass the database insertion and go directly to rating
      // This will help us test the rating flow
      console.log('Bypassing database insertion for testing')
      
      // Close story
      setStoryOpen(false)
      setCurrentActivity(null)
      
      // Create a temporary activity ID for testing
      const tempActivityId = `temp-${Date.now()}`
      
      // Navigate to rating page with activity data
      const params = new URLSearchParams({
        activityId: tempActivityId,
        activityName: activity.title,
        activityType: activity.type,
        ...(durationMinutes && { durationMinutes: durationMinutes.toString() })
      })
      
      const ratingUrl = `/dashboard/activity-rating?${params.toString()}`
      console.log('Redirecting to rating page:', ratingUrl)
      router.push(ratingUrl)
    } catch (err) {
      console.error('Error completing activity:', err)
      alert('Failed to complete activity. Please try again.')
    }
  }

  const handleCloseStory = () => {
    setStoryOpen(false)
    setCurrentActivity(null)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="loading-text hig-body">Loading your activities...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect
  }

  return (
    <div className="today-container">
      <div className="today-wrapper">
        {/* Header */}
        <div className="today-header">
          <div className="today-header-icons">
            <Link href="/dashboard/profile" className="today-header-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <Link href="/dashboard/timer" className="today-header-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
          </div>

          <p className="today-greeting hig-body">
            Good morning, {profile.parent_name}
          </p>
          <h1 className="today-title hig-title-1">
            Today's recommended activities
          </h1>
          
          {!assessment && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 text-sm hig-footnote">
                Complete your{' '}
                <Link href="/onboarding/assessment" className="underline font-medium">
                  sensory assessment
                </Link>
                {' '}to get personalized activity recommendations.
              </p>
            </div>
          )}

          {assessment && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-blue-900">Personalized for {profile.child_name}</h3>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {assessment.results.profile}
                </span>
              </div>
              <p className="text-xs text-blue-700">
                Activities selected based on {profile.child_name}'s sensory assessment results
              </p>
            </div>
          )}
        </div>

        {/* Quick Action Cards */}
        <div className="quick-actions mb-6">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setBehaviorHelpOpen(true)}
              className="quick-action-card"
            >
              <div className="quick-action-content">
                <div className="quick-action-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="quick-action-title">Help with a behavior</h3>
                <p className="quick-action-subtitle">Get personalized support</p>
              </div>
            </button>
            
            <Link href="/dashboard/schedule" className="quick-action-card">
              <div className="quick-action-content">
                <div className="quick-action-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="quick-action-title">View today's schedule</h3>
                <p className="quick-action-subtitle">See your daily plan</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Activity Cards */}
        <div className="today-activities">
          {todaysActivities().map((activity) => (
            <div key={activity.id} className="activity-card">
              <div className="flex items-start justify-between mb-2">
                <p className="activity-context hig-footnote">{activity.context}</p>
                <div className="flex items-center space-x-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.behavior_fit === 'seeking' ? 'bg-green-100 text-green-700' :
                    activity.behavior_fit === 'avoiding' ? 'bg-blue-100 text-blue-700' :
                    activity.behavior_fit === 'sensitive' ? 'bg-orange-100 text-orange-700' :
                    activity.behavior_fit === 'low-registration' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {activity.behavior_fit}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    {activity.difficulty}
                  </span>
                </div>
              </div>
              
              <h3 className="activity-title hig-title-3 mb-2">{activity.title}</h3>
              
              <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="activity-duration hig-subhead">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {activity.duration}
                </div>
                
                <div className="flex items-center space-x-1">
                  {activity.sensory_systems.map((system, index) => (
                    <span key={index} className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                      {system}
                    </span>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => handleStartActivity(activity)}
                disabled={submittingActivity === activity.id}
                className="activity-button"
              >
                {submittingActivity === activity.id ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Starting...
                  </span>
                ) : (
                  'Start Activity'
                )}
              </button>
            </div>
          ))}
        </div>



        {/* Activity Story */}
        {currentActivity && (
          <ActivityStory
            activityTitle={currentActivity.title}
            steps={getActivitySteps(currentActivity.id)}
            isOpen={storyOpen}
            onClose={handleCloseStory}
            onComplete={(durationMinutes) => handleCompleteActivity(currentActivity, durationMinutes)}
          />
        )}

        {/* Behavior Help Modal */}
        <BehaviorHelpModal
          isOpen={behaviorHelpOpen}
          onClose={() => setBehaviorHelpOpen(false)}
        />

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <div className="bottom-nav-wrapper">
            <div className="bottom-nav-container">
              {/* Today Tab - Active */}
              <Link href="/dashboard/today" className="nav-tab">
                <div className="nav-tab-content nav-tab-active">
                  <div className="nav-tab-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15l4-4 4 4" />
                    </svg>
                  </div>
                  <span className="nav-tab-label-active hig-caption-1">Today</span>
                </div>
              </Link>

              {/* Coach Tab */}
              <Link href="/dashboard/coach" className="nav-tab">
                <div className="nav-tab-content nav-tab-inactive">
                  <div className="nav-tab-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="nav-tab-label-inactive hig-caption-1">Coach</span>
                </div>
              </Link>

              {/* Journal Tab */}
              <Link href="/dashboard/journal" className="nav-tab">
                <div className="nav-tab-content nav-tab-inactive">
                  <div className="nav-tab-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="nav-tab-label-inactive hig-caption-1">Journal</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 