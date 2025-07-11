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
  activity_type: 'proprioceptive' | 'vestibular' | 'tactile' | 'heavy-work' | 'calming' | 'auditory' | 'visual' | 'olfactory' | 'interoception'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  sensory_systems: string[] // Which sensory systems this activity targets
  behavior_fit: 'seeking' | 'avoiding' | 'sensitive' | 'low-registration' | 'mixed'
  description: string
  benefits: string[]
  when_to_use: string
}

interface ActivityStep {
  id: number
  instruction: string
}

function getTimeOfDayGreeting() {
  const now = new Date();
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 20) return 'Good evening';
  return 'Winding down for the day';
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
  const [todaysActivities, setTodaysActivities] = useState<Activity[]>([])
  const [greeting, setGreeting] = useState('')

  // Set greeting on client-side to avoid hydration mismatch
  useEffect(() => {
    setGreeting(getTimeOfDayGreeting())
  }, [])

  // Comprehensive Activity Library
  const activityLibrary: Activity[] = [
    // Proprioceptive Activities
    {
      id: 'wall-pushups',
      title: 'Wall Push-ups',
      context: 'Great for morning regulation',
      duration: '2-3 minutes',
      activity_type: 'proprioceptive',
      difficulty: 'beginner',
      sensory_systems: ['proprioceptive'],
      behavior_fit: 'seeking',
      description: 'Deep pressure input through pushing against a wall',
      benefits: ['Provides deep pressure input', 'Helps with regulation', 'Easy to do anywhere'],
      when_to_use: 'When seeking proprioceptive input or needing to calm down'
    },
    {
      id: 'resistance-band-pull',
      title: 'Resistance Band Pull',
      context: 'Perfect before lunch to help focus',
      duration: '3-5 minutes',
      activity_type: 'heavy-work',
      difficulty: 'beginner',
      sensory_systems: ['proprioceptive'],
      behavior_fit: 'seeking',
      description: 'Pulling resistance band for muscle input',
      benefits: ['Provides heavy work', 'Improves focus', 'Strengthens muscles'],
      when_to_use: 'Before tasks requiring concentration'
    },
    {
      id: 'weighted-lap-pad',
      title: 'Weighted Lap Pad',
      context: 'Ideal for afternoon energy',
      duration: '10-15 minutes',
      activity_type: 'calming',
      difficulty: 'beginner',
      sensory_systems: ['proprioceptive', 'tactile'],
      behavior_fit: 'avoiding',
      description: 'Gentle pressure from weighted pad on lap',
      benefits: ['Provides gentle pressure', 'Calming effect', 'Non-intrusive'],
      when_to_use: 'When feeling overwhelmed or needing gentle input'
    },
    {
      id: 'bear-hugs',
      title: 'Bear Hugs',
      context: 'Great for transitions',
      duration: '1-2 minutes',
      activity_type: 'proprioceptive',
      difficulty: 'beginner',
      sensory_systems: ['proprioceptive', 'tactile'],
      behavior_fit: 'seeking',
      description: 'Firm, deep pressure hugs',
      benefits: ['Provides deep pressure', 'Emotional connection', 'Calming'],
      when_to_use: 'During transitions or when seeking comfort'
    },
    {
      id: 'chair-pushups',
      title: 'Chair Push-ups',
      context: 'Good for focus during seated work',
      duration: '1-2 minutes',
      activity_type: 'proprioceptive',
      difficulty: 'beginner',
      sensory_systems: ['proprioceptive'],
      behavior_fit: 'seeking',
      description: 'Lifting body from chair using arm strength',
      benefits: ['Provides proprioceptive input', 'Improves focus', 'Strengthens arms'],
      when_to_use: 'During seated activities when needing input'
    },
    // Vestibular Activities
    {
      id: 'slow-spinning',
      title: 'Slow Spinning',
      context: 'Good for vestibular seeking',
      duration: '2-3 minutes',
      activity_type: 'vestibular',
      difficulty: 'beginner',
      sensory_systems: ['vestibular'],
      behavior_fit: 'seeking',
      description: 'Gentle spinning in a chair or standing',
      benefits: ['Provides vestibular input', 'Can be calming', 'Improves balance'],
      when_to_use: 'When seeking movement input'
    },
    {
      id: 'rocking-chair',
      title: 'Rocking Chair',
      context: 'Calming vestibular input',
      duration: '5-10 minutes',
      activity_type: 'calming',
      difficulty: 'beginner',
      sensory_systems: ['vestibular'],
      behavior_fit: 'avoiding',
      description: 'Gentle rocking motion',
      benefits: ['Calming effect', 'Gentle vestibular input', 'Relaxing'],
      when_to_use: 'When feeling overwhelmed or needing to calm down'
    },
    // Tactile Activities
    {
      id: 'texture-exploration',
      title: 'Texture Exploration',
      context: 'Good for tactile integration',
      duration: '5-10 minutes',
      activity_type: 'tactile',
      difficulty: 'beginner',
      sensory_systems: ['tactile'],
      behavior_fit: 'avoiding',
      description: 'Exploring different textures with hands',
      benefits: ['Desensitizes tactile sensitivity', 'Improves tolerance', 'Educational'],
      when_to_use: 'When working on tactile tolerance'
    },
    {
      id: 'finger-painting',
      title: 'Finger Painting',
      context: 'Messy play for tactile seekers',
      duration: '10-15 minutes',
      activity_type: 'tactile',
      difficulty: 'intermediate',
      sensory_systems: ['tactile'],
      behavior_fit: 'seeking',
      description: 'Painting with fingers for tactile input',
      benefits: ['Provides tactile input', 'Creative expression', 'Sensory exploration'],
      when_to_use: 'When seeking tactile input or creative activities'
    },
    // Auditory Activities
    {
      id: 'quiet-time',
      title: 'Quiet Time',
      context: 'For auditory sensitivity',
      duration: '5-10 minutes',
      activity_type: 'calming',
      difficulty: 'beginner',
      sensory_systems: ['auditory'],
      behavior_fit: 'avoiding',
      description: 'Time in a quiet space with noise reduction',
      benefits: ['Reduces auditory input', 'Calming effect', 'Regulation'],
      when_to_use: 'When feeling overwhelmed by noise'
    },
    {
      id: 'rhythm-clapping',
      title: 'Rhythm Clapping',
      context: 'Good for auditory seekers',
      duration: '3-5 minutes',
      activity_type: 'auditory',
      difficulty: 'beginner',
      sensory_systems: ['auditory', 'proprioceptive'],
      behavior_fit: 'seeking',
      description: 'Clapping to rhythms and patterns',
      benefits: ['Provides auditory input', 'Improves rhythm', 'Fun activity'],
      when_to_use: 'When seeking auditory input or needing energy'
    },
    // Visual Activities
    {
      id: 'visual-tracking',
      title: 'Visual Tracking',
      context: 'For visual processing',
      duration: '3-5 minutes',
      activity_type: 'visual',
      difficulty: 'beginner',
      sensory_systems: ['visual'],
      behavior_fit: 'mixed',
      description: 'Following objects with eyes',
      benefits: ['Improves visual tracking', 'Focus development', 'Eye coordination'],
      when_to_use: 'When working on visual skills'
    },
    {
      id: 'dim-lighting',
      title: 'Dim Lighting Time',
      context: 'For visual sensitivity',
      duration: '5-10 minutes',
      activity_type: 'calming',
      difficulty: 'beginner',
      sensory_systems: ['visual'],
      behavior_fit: 'avoiding',
      description: 'Time in reduced lighting',
      benefits: ['Reduces visual input', 'Calming effect', 'Regulation'],
      when_to_use: 'When feeling overwhelmed by bright lights'
    },
    // Interoception Activities
    {
      id: 'body-scan',
      title: 'Body Scan',
      context: 'For interoception awareness',
      duration: '3-5 minutes',
      activity_type: 'interoception',
      difficulty: 'beginner',
      sensory_systems: ['interoception'],
      behavior_fit: 'low-registration',
      description: 'Mindful awareness of body sensations',
      benefits: ['Improves body awareness', 'Self-regulation', 'Mindfulness'],
      when_to_use: 'When working on body awareness'
    },
    {
      id: 'hunger-thirst-check',
      title: 'Hunger & Thirst Check',
      context: 'For interoception development',
      duration: '1-2 minutes',
      activity_type: 'interoception',
      difficulty: 'beginner',
      sensory_systems: ['interoception'],
      behavior_fit: 'low-registration',
      description: 'Regular check-ins for hunger and thirst',
      benefits: ['Improves body awareness', 'Self-care skills', 'Regulation'],
      when_to_use: 'Throughout the day for body awareness'
    }
  ]

  // Personalization Logic
  const getPersonalizedActivities = async (assessment: Assessment) => {
    if (!assessment?.results) return []

    const results = assessment.results as any
    const behaviorScores = results.behaviorScores || {}
    
    try {
      // Get activities from database
      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error || !activities || activities.length === 0) {
        console.log('Database activities not available, using fallback library')
        
        // Fallback to hardcoded activities with scoring
        const scoredActivities = activityLibrary.map(activity => {
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

          return { ...activity, score }
        })

        // Sort by score and return top 6
        return scoredActivities
          .sort((a, b) => b.score - a.score)
          .slice(0, 6)
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
    } catch (error) {
      console.log('Error in getPersonalizedActivities, using fallback:', error)
      
      // Fallback to hardcoded activities with scoring
      const scoredActivities = activityLibrary.map(activity => {
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

        return { ...activity, score }
      })

      // Sort by score and return top 6
      return scoredActivities
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
    }
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

  const loadTodaysActivities = async () => {
    try {
      console.log('Loading activities...', { assessment: !!assessment, profile: !!profile })
      
      if (!assessment) {
        // Return general activities if no assessment
        console.log('No assessment found, using general activities')
        setTodaysActivities(activityLibrary.slice(0, 3))
      } else {
        console.log('Assessment found, getting personalized activities')
        const activities = await getPersonalizedActivities(assessment)
        console.log('Personalized activities loaded:', activities?.length || 0)
        setTodaysActivities(activities || activityLibrary.slice(0, 3))
      }
    } catch (error) {
      console.log('Error loading activities, using fallback:', error)
      // Fallback to general activities
      setTodaysActivities(activityLibrary.slice(0, 3))
    }
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

  useEffect(() => {
    loadTodaysActivities()
  }, [assessment, profile])

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

  const handleCompleteActivity = async (activity: Activity, durationMinutes?: number, rating?: string) => {
    try {
      setSubmittingActivity(activity.id)
      
      // Calculate duration in minutes if not provided
      const duration = durationMinutes || Math.floor(Math.random() * 10) + 5 // Default 5-15 minutes
      
      // Create activity completion record
      const { error } = await supabase
        .from('activity_completions')
        .insert({
          user_id: user?.id,
          activity_id: activity.id,
          completed_at: new Date().toISOString(),
          duration_minutes: duration,
          activity_name: activity.title,
          activity_type: activity.activity_type,
          regulation_rating: rating // Add the rating to the database
        })

      if (error) {
        console.error('Error saving activity completion:', error)
        throw error // Re-throw to be caught by the calling function
      }

      // Close the story modal
      setStoryOpen(false)
      setCurrentActivity(null)
      
      // Refresh activities to show updated state
      await loadTodaysActivities()
      
      console.log(`Activity "${activity.title}" completed with rating: ${rating}`)
      
    } catch (error) {
      console.error('Error completing activity:', error)
      throw error // Re-throw to be caught by the calling function
    } finally {
      setSubmittingActivity(null)
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

  const parentName = profile.parent_name

  return (
    <div className="today-container min-h-screen" style={{ background: '#F6F6F6' }}>
      <div className="today-wrapper mx-auto w-full max-w-md">
        {/* Header */}
        <div className="today-header mb-4 px-4">
          <div className="today-header-icons">
            <Link href="/dashboard/profile" className="today-header-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
        {/* Greeting */}
        <h1 className="text-2xl font-semibold text-left mb-4 px-4" style={{ color: '#252225', marginBottom: 16, maxWidth: '100%', wordWrap: 'break-word' }}>
          {greeting}, {parentName}
        </h1>

        {/* Activity Cards */}
        <div className="today-activities flex flex-col">
          {todaysActivities && todaysActivities.slice(0, 3).map((activity, idx) => (
            <div key={activity.id} className="activity-card" style={{ borderRadius: 24, background: '#fff', boxShadow: '0 2px 8px 0 rgba(44, 62, 80, 0.06)', marginBottom: 16 }}>
              <h3 className="activity-title mb-2" style={{ color: '#252225', fontWeight: 600, fontSize: 20 }}>
                {activity.title}
              </h3>
              <div className="flex items-center mb-2">
                <img src="/icons/target.svg" alt="target" style={{ width: 18, height: 18, marginRight: 8, color: '#3D3A3D' }} />
                <span style={{ color: '#252225', fontSize: 15, fontWeight: 400 }}>{activity.context}</span>
              </div>
              <div className="flex items-center mb-4">
                <svg fill="none" stroke="#3D3A3D" viewBox="0 0 24 24" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ color: '#252225', fontSize: 15 }}>{activity.duration}</span>
              </div>
              <button 
                onClick={() => handleStartActivity(activity)}
                disabled={submittingActivity === activity.id}
                style={{ height: 40, width: '100%', background: idx === 0 ? '#367A87' : '#fff', color: idx === 0 ? '#fff' : '#252225', fontWeight: 600, borderRadius: 16, fontSize: 16, marginTop: 8, border: idx === 0 ? 'none' : '1px solid #EEE6E5' }}
              >
                {submittingActivity === activity.id ? 'Starting...' : 'Start activity'}
              </button>
            </div>
          ))}
        </div>

        {/* Activity Story */}
        {storyOpen && currentActivity && (
          <ActivityStory
            activityId={currentActivity.id}
            activityData={currentActivity}
            childName={profile.child_name}
            onClose={handleCloseStory}
            onComplete={(rating) => handleCompleteActivity(currentActivity, undefined, rating)}
          />
        )}

        {/* Behavior Help Modal */}
        <BehaviorHelpModal
          isOpen={behaviorHelpOpen}
          onClose={() => setBehaviorHelpOpen(false)}
        />

        {/* Full-width Behavior Help button at bottom */}
        <div className="flex justify-center mt-4 mb-4">
          <button
            onClick={() => setBehaviorHelpOpen(true)}
            style={{
              height: 40,
              width: '90%',
              maxWidth: '100%',
              border: '1px solid #D1CBCA',
              background: '#fff',
              borderRadius: 16,
              fontWeight: 600,
              color: '#252225',
              fontSize: 16,
            }}
          >
            Behavior support
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <div className="bottom-nav-wrapper">
            <div className="bottom-nav-container flex justify-between">
              {/* Today Tab - Active */}
              <Link href="/dashboard/today" className="nav-tab">
                <div className="nav-tab-content nav-tab-active flex flex-col items-center">
                  <img src="/icons/Calendar-Active.svg" alt="Today" style={{ width: 28, height: 28 }} />
                  <span className="nav-tab-label-active hig-caption-1">Today</span>
                </div>
              </Link>
              {/* Coach Tab */}
              <Link href="/dashboard/coach" className="nav-tab">
                <div className="nav-tab-content nav-tab-inactive flex flex-col items-center">
                  <img src="/icons/Chat-Default.svg" alt="Coach" style={{ width: 28, height: 28 }} />
                  <span className="nav-tab-label-inactive hig-caption-1">Coach</span>
                </div>
              </Link>
              {/* Journal Tab */}
              <Link href="/dashboard/journal" className="nav-tab">
                <div className="nav-tab-content nav-tab-inactive flex flex-col items-center">
                  <img src="/icons/Journal-Default.svg" alt="Journal" style={{ width: 28, height: 28 }} />
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