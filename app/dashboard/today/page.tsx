'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Assessment, ActivityCompletion, Activity } from '@/lib/supabase/client'
import ActivityStory from '../../components/ActivityStory'
import BehaviorHelpModal from '../../components/BehaviorHelpModal'



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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isMockPayment, setIsMockPayment] = useState(false)
  const [showActivityCompleted, setShowActivityCompleted] = useState(false)

  // Set greeting on client-side to avoid hydration mismatch
  useEffect(() => {
    setGreeting(getTimeOfDayGreeting())
  }, [])

  // Check for success message from payment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const mock = urlParams.get('mock')
    
    if (success === 'true') {
      setShowSuccessMessage(true)
      setIsMockPayment(mock === 'true')
      
      // Clear the URL parameters
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)
    }
  }, [])

  // Refresh activities when user returns to the app
  useEffect(() => {
    const handleFocus = () => {
      // Check if there was a recent activity completion
      const lastActivityUpdate = localStorage.getItem('lastActivityUpdate')
      const now = new Date().getTime()
      
      // Refresh if there was a recent activity completion (within last 5 minutes)
      if (lastActivityUpdate && (now - parseInt(lastActivityUpdate)) < 300000) {
        console.log('Refreshing activities due to recent completion')
        loadTodaysActivities()
        localStorage.removeItem('lastActivityUpdate') // Clear the flag
      }
      // Also refresh if it's been more than 1 hour since last activity load
      else {
        const lastLoad = localStorage.getItem('lastActivityLoad')
        if (!lastLoad || (now - parseInt(lastLoad)) > 3600000) { // 1 hour
          console.log('Refreshing activities due to app focus')
          loadTodaysActivities()
          localStorage.setItem('lastActivityLoad', now.toString())
        }
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [assessment, profile])

  // Comprehensive Activity Library
  const activityLibrary: Activity[] = [
    // Proprioceptive Activities
    {
      id: 'wall-pushups',
      title: 'Wall Push-ups',
      context: 'Great for morning regulation',
      duration_minutes: 3,
      activity_type: 'proprioceptive',
      difficulty: 'beginner',
      sensory_systems: ['proprioceptive'],
      behavior_fit: 'seeking',
      description: 'Deep pressure input through pushing against a wall',
      benefits: ['Provides deep pressure input', 'Helps with regulation', 'Easy to do anywhere'],
      when_to_use: 'When seeking proprioceptive input or needing to calm down',
      materials_needed: [],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'resistance-band-pull',
      title: 'Resistance Band Pull',
      context: 'Perfect before lunch to help focus',
      duration_minutes: 5,
      activity_type: 'heavy-work',
      difficulty: 'beginner',
      sensory_systems: ['proprioceptive'],
      behavior_fit: 'seeking',
      description: 'Pulling resistance band for muscle input',
      benefits: ['Provides heavy work', 'Improves focus', 'Strengthens muscles'],
      when_to_use: 'Before tasks requiring concentration',
      materials_needed: ['Resistance band'],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'weighted-lap-pad',
      title: 'Weighted Lap Pad',
      context: 'Ideal for afternoon energy',
      duration_minutes: 15,
      activity_type: 'calming',
      difficulty: 'beginner',
      sensory_systems: ['proprioceptive', 'tactile'],
      behavior_fit: 'avoiding',
      description: 'Gentle pressure from weighted pad on lap',
      benefits: ['Provides gentle pressure', 'Calming effect', 'Non-intrusive'],
      when_to_use: 'When feeling overwhelmed or needing gentle input',
      materials_needed: ['Weighted lap pad'],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'bear-hugs',
      title: 'Bear Hugs',
      context: 'Great for transitions',
      duration_minutes: 2,
      activity_type: 'proprioceptive',
      difficulty: 'beginner',
      sensory_systems: ['proprioceptive', 'tactile'],
      behavior_fit: 'seeking',
      description: 'Firm, deep pressure hugs',
      benefits: ['Provides deep pressure', 'Emotional connection', 'Calming'],
      when_to_use: 'During transitions or when seeking comfort',
      materials_needed: [],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'chair-pushups',
      title: 'Chair Push-ups',
      context: 'Good for focus during seated work',
      duration_minutes: 2,
      activity_type: 'proprioceptive',
      difficulty: 'beginner',
      sensory_systems: ['proprioceptive'],
      behavior_fit: 'seeking',
      description: 'Lifting body from chair using arm strength',
      benefits: ['Provides proprioceptive input', 'Improves focus', 'Strengthens arms'],
      when_to_use: 'During seated activities when needing input',
      materials_needed: ['Chair with armrests'],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Vestibular Activities
    {
      id: 'slow-spinning',
      title: 'Slow Spinning',
      context: 'Good for vestibular seeking',
      duration_minutes: 3,
      activity_type: 'vestibular',
      difficulty: 'beginner',
      sensory_systems: ['vestibular'],
      behavior_fit: 'seeking',
      description: 'Gentle spinning in a chair or standing',
      benefits: ['Provides vestibular input', 'Can be calming', 'Improves balance'],
      when_to_use: 'When seeking movement input',
      materials_needed: [],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'rocking-chair',
      title: 'Rocking Chair',
      context: 'Calming vestibular input',
      duration_minutes: 10,
      activity_type: 'calming',
      difficulty: 'beginner',
      sensory_systems: ['vestibular'],
      behavior_fit: 'avoiding',
      description: 'Gentle rocking motion',
      benefits: ['Calming effect', 'Gentle vestibular input', 'Relaxing'],
      when_to_use: 'When feeling overwhelmed or needing to calm down',
      materials_needed: ['Rocking chair'],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Tactile Activities
    {
      id: 'texture-exploration',
      title: 'Texture Exploration',
      context: 'Good for tactile integration',
      duration_minutes: 10,
      activity_type: 'tactile',
      difficulty: 'beginner',
      sensory_systems: ['tactile'],
      behavior_fit: 'avoiding',
      description: 'Exploring different textures with hands',
      benefits: ['Desensitizes tactile sensitivity', 'Improves tolerance', 'Educational'],
      when_to_use: 'When working on tactile tolerance',
      materials_needed: ['Various textured objects'],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'finger-painting',
      title: 'Finger Painting',
      context: 'Messy play for tactile seekers',
      duration_minutes: 15,
      activity_type: 'tactile',
      difficulty: 'intermediate',
      sensory_systems: ['tactile'],
      behavior_fit: 'seeking',
      description: 'Painting with fingers for tactile input',
      benefits: ['Provides tactile input', 'Creative expression', 'Sensory exploration'],
      when_to_use: 'When seeking tactile input or creative activities',
      materials_needed: ['Paint', 'Paper', 'Protective covering'],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Auditory Activities
    {
      id: 'quiet-time',
      title: 'Quiet Time',
      context: 'For auditory sensitivity',
      duration_minutes: 10,
      activity_type: 'calming',
      difficulty: 'beginner',
      sensory_systems: ['auditory'],
      behavior_fit: 'avoiding',
      description: 'Time in a quiet space with noise reduction',
      benefits: ['Reduces auditory input', 'Calming effect', 'Regulation'],
      when_to_use: 'When feeling overwhelmed by noise',
      materials_needed: ['Quiet space'],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'rhythm-clapping',
      title: 'Rhythm Clapping',
      context: 'Good for auditory seekers',
      duration_minutes: 5,
      activity_type: 'auditory',
      difficulty: 'beginner',
      sensory_systems: ['auditory', 'proprioceptive'],
      behavior_fit: 'seeking',
      description: 'Clapping to rhythms and patterns',
      benefits: ['Provides auditory input', 'Improves rhythm', 'Fun activity'],
      when_to_use: 'When seeking auditory input or needing energy',
      materials_needed: [],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Visual Activities
    {
      id: 'visual-tracking',
      title: 'Visual Tracking',
      context: 'For visual processing',
      duration_minutes: 5,
      activity_type: 'visual',
      difficulty: 'beginner',
      sensory_systems: ['visual'],
      behavior_fit: 'mixed',
      description: 'Following objects with eyes',
      benefits: ['Improves visual tracking', 'Focus development', 'Eye coordination'],
      when_to_use: 'When working on visual skills',
      materials_needed: ['Moving object or toy'],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'dim-lighting',
      title: 'Dim Lighting Time',
      context: 'For visual sensitivity',
      duration_minutes: 10,
      activity_type: 'calming',
      difficulty: 'beginner',
      sensory_systems: ['visual'],
      behavior_fit: 'avoiding',
      description: 'Time in reduced lighting',
      benefits: ['Reduces visual input', 'Calming effect', 'Regulation'],
      when_to_use: 'When feeling overwhelmed by bright lights',
      materials_needed: ['Dimmed lighting'],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Interoception Activities
    {
      id: 'body-scan',
      title: 'Body Scan',
      context: 'For interoception awareness',
      duration_minutes: 5,
      activity_type: 'interoception',
      difficulty: 'beginner',
      sensory_systems: ['interoception'],
      behavior_fit: 'low-registration',
      description: 'Mindful awareness of body sensations',
      benefits: ['Improves body awareness', 'Self-regulation', 'Mindfulness'],
      when_to_use: 'When working on body awareness',
      materials_needed: ['Quiet space'],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'hunger-thirst-check',
      title: 'Hunger & Thirst Check',
      context: 'For interoception development',
      duration_minutes: 2,
      activity_type: 'interoception',
      difficulty: 'beginner',
      sensory_systems: ['interoception'],
      behavior_fit: 'low-registration',
      description: 'Regular check-ins for hunger and thirst',
      benefits: ['Improves body awareness', 'Self-care skills', 'Regulation'],
      when_to_use: 'Throughout the day for body awareness',
      materials_needed: [],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Evening Activities
    {
      id: 'evening-stretches',
      title: 'Evening Stretches',
      context: 'Perfect for winding down',
      duration_minutes: 8,
      activity_type: 'proprioceptive',
      difficulty: 'beginner',
      sensory_systems: ['proprioceptive'],
      behavior_fit: 'mixed',
      description: 'Gentle stretching to relax muscles',
      benefits: ['Relaxes muscles', 'Calming effect', 'Improves sleep'],
      when_to_use: 'In the evening to wind down',
      materials_needed: ['Comfortable space'],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'warm-bath-time',
      title: 'Warm Bath Time',
      context: 'Evening relaxation ritual',
      duration_minutes: 15,
      activity_type: 'tactile',
      difficulty: 'beginner',
      sensory_systems: ['tactile', 'proprioceptive'],
      behavior_fit: 'avoiding',
      description: 'Warm bath with gentle water pressure',
      benefits: ['Deep relaxation', 'Sensory input', 'Sleep preparation'],
      when_to_use: 'Evening before bedtime',
      materials_needed: ['Warm bath', 'Quiet environment'],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'bedtime-story',
      title: 'Bedtime Story',
      context: 'Evening calming activity',
      duration_minutes: 10,
      activity_type: 'auditory',
      difficulty: 'beginner',
      sensory_systems: ['auditory'],
      behavior_fit: 'avoiding',
      description: 'Reading or listening to a calming story',
      benefits: ['Calming effect', 'Language development', 'Sleep preparation'],
      when_to_use: 'Evening before bedtime',
      materials_needed: ['Book or audio story'],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Night Activities
    {
      id: 'deep-breathing',
      title: 'Deep Breathing',
      context: 'Night calming technique',
      duration_minutes: 3,
      activity_type: 'calming',
      difficulty: 'beginner',
      sensory_systems: ['interoception'],
      behavior_fit: 'avoiding',
      description: 'Slow, deep breathing exercises',
      benefits: ['Calms nervous system', 'Reduces anxiety', 'Sleep aid'],
      when_to_use: 'When having trouble sleeping',
      materials_needed: ['Quiet space'],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'progressive-relaxation',
      title: 'Progressive Relaxation',
      context: 'Night body relaxation',
      duration_minutes: 5,
      activity_type: 'calming',
      difficulty: 'beginner',
      sensory_systems: ['proprioceptive', 'interoception'],
      behavior_fit: 'avoiding',
      description: 'Systematically relaxing each body part',
      benefits: ['Deep relaxation', 'Sleep preparation', 'Body awareness'],
      when_to_use: 'When having trouble falling asleep',
      materials_needed: ['Comfortable bed or chair'],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'white-noise',
      title: 'White Noise',
      context: 'Night auditory comfort',
      duration_minutes: 30,
      activity_type: 'auditory',
      difficulty: 'beginner',
      sensory_systems: ['auditory'],
      behavior_fit: 'avoiding',
      description: 'Listening to calming white noise',
      benefits: ['Blocks distracting sounds', 'Calming effect', 'Sleep aid'],
      when_to_use: 'When noise is preventing sleep',
      materials_needed: ['White noise machine or app'],
      steps: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
      
      // Get current time to select time-appropriate activities
      const now = new Date()
      const hour = now.getHours()
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 20 ? 'evening' : 'night'
      
      if (!assessment) {
        // Return time-appropriate general activities
        console.log('No assessment found, using time-based general activities')
        const timeBasedActivities = getTimeBasedActivities(activityLibrary, timeOfDay)
        setTodaysActivities(timeBasedActivities.slice(0, 3))
      } else {
        console.log('Assessment found, getting personalized activities for', timeOfDay)
        const activities = await getPersonalizedActivities(assessment)
        console.log('Personalized activities loaded:', activities?.length || 0)
        
        // Filter activities based on time of day
        const timeBasedActivities = getTimeBasedActivities(activities || activityLibrary, timeOfDay)
        setTodaysActivities(timeBasedActivities.slice(0, 3))
      }
    } catch (error) {
      console.log('Error loading activities, using fallback:', error)
      // Fallback to time-based general activities
      const now = new Date()
      const hour = now.getHours()
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 20 ? 'evening' : 'night'
      const timeBasedActivities = getTimeBasedActivities(activityLibrary, timeOfDay)
      setTodaysActivities(timeBasedActivities.slice(0, 3))
    }
  }

  const getTimeBasedActivities = (activities: Activity[], timeOfDay: string): Activity[] => {
    // Add time-based scoring to activities
    const timeScoredActivities = activities.map(activity => {
      let timeScore = 0
      
      // Morning activities (6 AM - 12 PM): Energizing, focus-oriented
      if (timeOfDay === 'morning') {
        if (activity.activity_type === 'proprioceptive' || activity.activity_type === 'heavy-work') {
          timeScore += 10
        }
        if (activity.context?.toLowerCase().includes('morning') || 
            activity.context?.toLowerCase().includes('focus')) {
          timeScore += 8
        }
        if (activity.duration_minutes && activity.duration_minutes <= 5) {
          timeScore += 5 // Quick morning activities
        }
      }
      
      // Afternoon activities (12 PM - 5 PM): Balanced, transition-focused
      else if (timeOfDay === 'afternoon') {
        if (activity.activity_type === 'calming' || activity.activity_type === 'tactile') {
          timeScore += 8
        }
        if (activity.context?.toLowerCase().includes('lunch') || 
            activity.context?.toLowerCase().includes('transition')) {
          timeScore += 10
        }
        if (activity.duration_minutes && activity.duration_minutes <= 10) {
          timeScore += 3
        }
      }
      
      // Evening activities (5 PM - 8 PM): Calming, winding down
      else if (timeOfDay === 'evening') {
        if (activity.activity_type === 'calming' || activity.activity_type === 'visual') {
          timeScore += 12
        }
        if (activity.context?.toLowerCase().includes('evening') || 
            activity.context?.toLowerCase().includes('calm')) {
          timeScore += 10
        }
        if (activity.duration_minutes && activity.duration_minutes >= 10) {
          timeScore += 5 // Longer evening activities
        }
      }
      
      // Night activities (8 PM - 6 AM): Very calming, quiet
      else {
        if (activity.activity_type === 'calming' || activity.activity_type === 'auditory') {
          timeScore += 15
        }
        if (activity.context?.toLowerCase().includes('quiet') || 
            activity.context?.toLowerCase().includes('bedtime')) {
          timeScore += 12
        }
        if (activity.duration_minutes && activity.duration_minutes <= 5) {
          timeScore += 8 // Short night activities
        }
      }
      
      return { ...activity, timeScore: (activity as any).score + timeScore }
    })
    
    // Sort by time score and return
    return timeScoredActivities.sort((a, b) => (b as any).timeScore - (a as any).timeScore)
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
      case 'evening-stretches':
        return [
          { id: 1, instruction: 'Find a comfortable space' },
          { id: 2, instruction: 'Start with gentle arm stretches' },
          { id: 3, instruction: 'Stretch your legs slowly' },
          { id: 4, instruction: 'Bend and stretch your back' },
          { id: 5, instruction: 'Hold each stretch for 10 seconds' },
          { id: 6, instruction: 'Take deep breaths throughout' }
        ]
      case 'warm-bath-time':
        return [
          { id: 1, instruction: 'Fill bath with warm water' },
          { id: 2, instruction: 'Add calming bath salts if desired' },
          { id: 3, instruction: 'Get in slowly and comfortably' },
          { id: 4, instruction: 'Close your eyes and relax' },
          { id: 5, instruction: 'Stay for 10-15 minutes' },
          { id: 6, instruction: 'Dry off gently when finished' }
        ]
      case 'bedtime-story':
        return [
          { id: 1, instruction: 'Find a comfortable spot' },
          { id: 2, instruction: 'Choose a calming story' },
          { id: 3, instruction: 'Read in a soft, gentle voice' },
          { id: 4, instruction: 'Take your time with each page' },
          { id: 5, instruction: 'Use different voices for characters' },
          { id: 6, instruction: 'End with a gentle goodnight' }
        ]
      case 'deep-breathing':
        return [
          { id: 1, instruction: 'Lie down comfortably' },
          { id: 2, instruction: 'Place hands on your belly' },
          { id: 3, instruction: 'Breathe in slowly for 4 counts' },
          { id: 4, instruction: 'Hold for 4 counts' },
          { id: 5, instruction: 'Breathe out slowly for 4 counts' },
          { id: 6, instruction: 'Repeat 5-10 times' }
        ]
      case 'progressive-relaxation':
        return [
          { id: 1, instruction: 'Lie down in a quiet space' },
          { id: 2, instruction: 'Start with your toes - tense them' },
          { id: 3, instruction: 'Hold for 5 seconds, then relax' },
          { id: 4, instruction: 'Move up to your legs, then arms' },
          { id: 5, instruction: 'Continue with your whole body' },
          { id: 6, instruction: 'End with your face and head' }
        ]
      case 'white-noise':
        return [
          { id: 1, instruction: 'Find a quiet space' },
          { id: 2, instruction: 'Turn on white noise machine or app' },
          { id: 3, instruction: 'Set volume to comfortable level' },
          { id: 4, instruction: 'Lie down and close your eyes' },
          { id: 5, instruction: 'Focus on the steady sound' },
          { id: 6, instruction: 'Let it help you drift to sleep' }
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

  // Check for recent activity updates when component mounts
  useEffect(() => {
    const lastActivityUpdate = localStorage.getItem('lastActivityUpdate')
    if (lastActivityUpdate) {
      const now = new Date().getTime()
      if ((now - parseInt(lastActivityUpdate)) < 300000) { // Within 5 minutes
        console.log('Detected recent activity completion, refreshing activities')
        loadTodaysActivities()
        localStorage.removeItem('lastActivityUpdate')
      }
    }
  }, [])

  const handleStartActivity = async (activity: Activity) => {
    if (!user) return
    
    console.log('Starting activity:', activity.title, 'ID:', activity.id)
    console.log('Activity data:', activity)
    setSubmittingActivity(activity.id)

    try {
      // Just open the story for this activity - don't log to database yet
      console.log('Setting current activity and opening story')
      setCurrentActivity(activity)
      setStoryOpen(true)
      
      console.log(`Activity started: ${activity.title}`)
      console.log('Story state after setting:', { currentActivity: activity, storyOpen: true })
    } catch (err) {
      console.log('Error starting activity, but continuing')
    } finally {
      setSubmittingActivity(null)
    }
  }

  const handleCompleteActivity = async (activity: Activity, durationMinutes?: number, rating?: string) => {
    try {
      setSubmittingActivity(activity.id)
      
      // Simple localStorage approach - this will definitely work
      const completion = {
        id: Date.now().toString(), // Simple unique ID
        user_id: user?.id,
        completed_at: new Date().toISOString(),
        duration_minutes: durationMinutes || Math.floor(Math.random() * 10) + 5,
        activity_name: activity.title,
        activity_type: activity.activity_type || 'sensory',
        rating: rating || 'neutral',
        notes: ''
      }
      
      // Save to localStorage
      const existingCompletions = JSON.parse(localStorage.getItem('activity_completions') || '[]')
      existingCompletions.push(completion)
      localStorage.setItem('activity_completions', JSON.stringify(existingCompletions))
      
      console.log('✅ Activity saved to localStorage:', completion)
      
      // Also try to save to database, but don't fail if it doesn't work
      try {
        const { error } = await supabase
          .from('activity_completions')
          .insert({
            user_id: user?.id,
            completed_at: new Date().toISOString(),
            duration_minutes: completion.duration_minutes,
            activity_name: activity.title,
            activity_type: activity.activity_type || 'sensory',
            rating: rating || 'neutral'
          })
        if (error) {
          console.log('Database save failed, but localStorage worked:', error)
        } else {
          console.log('✅ Activity also saved to database')
        }
      } catch (dbError) {
        console.log('Database error, but localStorage worked:', dbError)
      }
      
      // Close the story modal
      setStoryOpen(false)
      setCurrentActivity(null)
      
      // Update the activity list: remove completed activity and add a new one
      const currentActivities = [...todaysActivities]
      const completedIndex = currentActivities.findIndex(a => a.id === activity.id)
      
      console.log('Completing activity:', activity.title)
      console.log('Current activities before:', currentActivities.map(a => a.title))
      console.log('Completed index:', completedIndex)
      
      if (completedIndex !== -1) {
        // Remove the completed activity
        currentActivities.splice(completedIndex, 1)
        console.log('Activities after removal:', currentActivities.map(a => a.title))
        
        // Get a new activity that considers recent completions and assessment
        const newActivity = await getNextActivity(currentActivities, activity)
        
        // Add the new activity at the bottom
        currentActivities.push(newActivity)
        console.log('New activity added:', newActivity.title)
        console.log('Final activities:', currentActivities.map(a => a.title))
        
        // Update the state immediately
        setTodaysActivities([...currentActivities])
        
        // Force a re-render by updating localStorage
        localStorage.setItem('lastActivityUpdate', Date.now().toString())
        
        console.log('✅ Activity list updated successfully')
        
        // Show success message for new activity
        setShowActivityCompleted(true)
        setTimeout(() => {
          setShowActivityCompleted(false)
        }, 3000) // Hide after 3 seconds
      }
      
      // Show a brief success message and stay on the page
      console.log('✅ Activity completed successfully!')
      
    } catch (error) {
      console.log('Error completing activity:', error)
      alert('Activity completed but there was an issue saving. Check the journal to see if it was saved.')
    } finally {
      setSubmittingActivity(null)
    }
  }

  // New function to get the next best activity
  const getNextActivity = async (currentActivities: Activity[], justCompleted: Activity): Promise<Activity> => {
    try {
      // Get recent completions (last 24 hours)
      const existingCompletions = JSON.parse(localStorage.getItem('activity_completions') || '[]')
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentCompletions = existingCompletions.filter((comp: any) => 
        new Date(comp.completed_at) > oneDayAgo
      )
      
      console.log('Recent completions:', recentCompletions.map((c: any) => c.activity_name))
      
      // Get current time for time-based scoring
      const now = new Date()
      const hour = now.getHours()
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 20 ? 'evening' : 'night'
      
      // Get available activities
      let availableActivities: Activity[]
      if (assessment) {
        const personalizedActivities = await getPersonalizedActivities(assessment)
        availableActivities = personalizedActivities || activityLibrary
      } else {
        availableActivities = activityLibrary
      }
      
      // Filter out activities that are already in the current list
      availableActivities = availableActivities.filter(a => 
        !currentActivities.some(existing => existing.id === a.id)
      )
      
      // Filter out recently completed activities (last 24 hours)
      const recentlyCompletedNames = recentCompletions.map((c: any) => c.activity_name)
      availableActivities = availableActivities.filter(a => 
        !recentlyCompletedNames.includes(a.title)
      )
      
      // If we're running low on activities, allow some repetition but prefer variety
      if (availableActivities.length < 5) {
        console.log('Low on activities, allowing some repetition')
        availableActivities = assessment ? (await getPersonalizedActivities(assessment)) || activityLibrary : activityLibrary
        availableActivities = availableActivities.filter(a => 
          !currentActivities.some(existing => existing.id === a.id)
        )
      }
      
      // Score activities based on multiple factors
      const scoredActivities = availableActivities.map(activity => {
        let score = 0
        
        // Time-based scoring
        if (timeOfDay === 'morning') {
          if (activity.activity_type === 'proprioceptive' || activity.activity_type === 'heavy-work') {
            score += 10
          }
          if (activity.context?.toLowerCase().includes('morning') || 
              activity.context?.toLowerCase().includes('focus')) {
            score += 8
          }
          if (activity.duration_minutes && activity.duration_minutes <= 5) {
            score += 5
          }
        } else if (timeOfDay === 'afternoon') {
          if (activity.activity_type === 'calming' || activity.activity_type === 'tactile') {
            score += 8
          }
          if (activity.context?.toLowerCase().includes('lunch') || 
              activity.context?.toLowerCase().includes('transition')) {
            score += 10
          }
          if (activity.duration_minutes && activity.duration_minutes <= 10) {
            score += 3
          }
        } else if (timeOfDay === 'evening') {
          if (activity.activity_type === 'calming' || activity.activity_type === 'visual') {
            score += 12
          }
          if (activity.context?.toLowerCase().includes('evening') || 
              activity.context?.toLowerCase().includes('calm')) {
            score += 10
          }
          if (activity.duration_minutes && activity.duration_minutes >= 10) {
            score += 5
          }
        } else { // night
          if (activity.activity_type === 'calming' || activity.activity_type === 'auditory') {
            score += 15
          }
          if (activity.context?.toLowerCase().includes('quiet') || 
              activity.context?.toLowerCase().includes('bedtime')) {
            score += 12
          }
          if (activity.duration_minutes && activity.duration_minutes <= 5) {
            score += 8
          }
        }
        
        // Variety scoring - prefer different activity types than what was just completed
        if (justCompleted.activity_type && activity.activity_type !== justCompleted.activity_type) {
          score += 5
        }
        
        // Assessment-based scoring (if available)
        if (assessment?.results) {
          const results = assessment.results as any
          const behaviorScores = results.behaviorScores || {}
          
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
        }
        
        // Duration variety - if we just did a long activity, prefer a shorter one and vice versa
        const justCompletedDuration = justCompleted.duration_minutes || 10
        const currentDuration = activity.duration_minutes || 10
        if (Math.abs(justCompletedDuration - currentDuration) > 5) {
          score += 3
        }
        
        return { ...activity, score }
      })
      
      // Sort by score and return the best option
      scoredActivities.sort((a, b) => (b as any).score - (a as any).score)
      
      console.log('Top 3 scored activities:', scoredActivities.slice(0, 3).map(a => ({
        title: a.title,
        score: (a as any).score,
        type: a.activity_type
      })))
      
      return scoredActivities[0] || activityLibrary[Math.floor(Math.random() * activityLibrary.length)]
      
    } catch (error) {
      console.log('Error getting next activity, using fallback:', error)
      // Fallback to random activity from library
      return activityLibrary[Math.floor(Math.random() * activityLibrary.length)]
    }
  }

  const handleCloseStory = () => {
    setStoryOpen(false)
    setCurrentActivity(null)
  }

  const handleStartActivityFromBehavior = (activity: Activity) => {
    // Start the activity
    setCurrentActivity(activity)
    setStoryOpen(true)
    // Close the behavior modal
    setBehaviorHelpOpen(false)
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
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-green-800 font-medium">
                  {isMockPayment ? 'Test subscription activated!' : 'Payment successful!'}
                </p>
                <p className="text-green-700 text-sm">
                  {isMockPayment ? 'You can now test all features' : 'Welcome to Sensorysmart!'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Activity Completed Success Message */}
        {showActivityCompleted && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-blue-800 font-medium">Activity completed!</p>
                <p className="text-blue-700 text-sm">A new activity has been added to your journal</p>
              </div>
            </div>
          </div>
        )}

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
                <img src="/Icons/target.svg" alt="target" style={{ width: 18, height: 18, marginRight: 8, color: '#3D3A3D' }} />
                <span style={{ color: '#252225', fontSize: 15, fontWeight: 400 }}>{activity.context}</span>
              </div>
              <div className="flex items-center mb-4">
                <svg fill="none" stroke="#3D3A3D" viewBox="0 0 24 24" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ color: '#252225', fontSize: 15 }}>{activity.duration_minutes} min</span>
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
          user={user}
          assessment={assessment}
          onStartActivity={handleStartActivityFromBehavior}
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
                  <img src="/Icons/Calendar-Active.svg" alt="Today" style={{ width: 28, height: 28 }} />
                  <span className="nav-tab-label-active hig-caption-1">Today</span>
                </div>
              </Link>
              {/* Coach Tab */}
              <Link href="/dashboard/coach" className="nav-tab">
                <div className="nav-tab-content nav-tab-inactive flex flex-col items-center">
                  <img src="/Icons/Chat-Default.svg" alt="Coach" style={{ width: 28, height: 28 }} />
                  <span className="nav-tab-label-inactive hig-caption-1">Coach</span>
                </div>
              </Link>
              {/* Journal Tab */}
              <Link href="/dashboard/journal" className="nav-tab">
                <div className="nav-tab-content nav-tab-inactive flex flex-col items-center">
                  <img src="/Icons/Journal-Default.svg" alt="Journal" style={{ width: 28, height: 28 }} />
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