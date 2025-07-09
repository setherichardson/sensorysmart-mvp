'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Assessment } from '@/lib/supabase/client'

interface Activity {
  id: string
  title: string
  context: string
  duration: string
  type: 'proprioceptive' | 'vestibular' | 'tactile' | 'heavy-work' | 'calming'
}

interface TimeBlock {
  id: string
  title: string
  subtitle: string
  activities: Activity[]
}

export default function DaySchedule() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [submittingActivity, setSubmittingActivity] = useState<string | null>(null)

  // Comprehensive day schedule organized by time blocks
  const daySchedule: TimeBlock[] = [
    {
      id: 'morning',
      title: 'Morning',
      subtitle: 'Start the day with regulation',
      activities: [
        {
          id: 'morning-wall-pushups',
          title: 'Wall push-ups',
          context: 'Great for morning regulation',
          duration: '2 minutes',
          type: 'proprioceptive'
        },
        {
          id: 'morning-heavy-carry',
          title: 'Carry something heavy to kitchen',
          context: 'Help with breakfast prep',
          duration: '2 minutes',
          type: 'heavy-work'
        },
        {
          id: 'jumping-patterns',
          title: 'Jumping patterns game',
          context: 'Wake up the body',
          duration: '5-10 minutes',
          type: 'vestibular'
        },
        {
          id: 'joint-compressions',
          title: 'Joint compressions',
          context: 'Calming deep pressure',
          duration: '3-5 minutes',
          type: 'proprioceptive'
        }
      ]
    },
    {
      id: 'breakfast',
      title: 'Breakfast Routine',
      subtitle: 'Activities to help with mealtime',
      activities: [
        {
          id: 'breakfast-wall-pushups',
          title: 'Wall push-ups',
          context: 'Before sitting to eat',
          duration: '2 minutes',
          type: 'proprioceptive'
        },
        {
          id: 'breakfast-heavy-carry',
          title: 'Carry something heavy to kitchen',
          context: 'Help set the table',
          duration: '2 minutes',
          type: 'heavy-work'
        }
      ]
    },
    {
      id: 'mid-morning',
      title: 'Mid-Morning',
      subtitle: 'Focus and attention activities',
      activities: [
        {
          id: 'resistance-band-focus',
          title: 'Resistance band exercises',
          context: 'Great for focus before activities',
          duration: '3-5 minutes',
          type: 'heavy-work'
        },
        {
          id: 'balance-beam',
          title: 'Balance beam walk',
          context: 'Improve body awareness',
          duration: '5 minutes',
          type: 'vestibular'
        },
        {
          id: 'fidget-play',
          title: 'Textured fidget play',
          context: 'Calm and organize',
          duration: '10 minutes',
          type: 'tactile'
        }
      ]
    },
    {
      id: 'lunch',
      title: 'Lunch Routine',
      subtitle: 'Pre-meal regulation activities',
      activities: [
        {
          id: 'lunch-resistance-band',
          title: 'Resistance band pull',
          context: 'Perfect before lunch to help focus',
          duration: '3-5 minutes',
          type: 'heavy-work'
        },
        {
          id: 'chair-pushups',
          title: 'Chair push-ups',
          context: 'Quick proprioceptive input',
          duration: '2 minutes',
          type: 'proprioceptive'
        }
      ]
    },
    {
      id: 'afternoon',
      title: 'Afternoon',
      subtitle: 'Energy regulation for the day',
      activities: [
        {
          id: 'weighted-lap-pad',
          title: 'Weighted lap pad activity',
          context: 'Ideal for afternoon energy',
          duration: '10-15 minutes',
          type: 'calming'
        },
        {
          id: 'trampoline-jumps',
          title: 'Mini trampoline jumps',
          context: 'Release excess energy',
          duration: '5-10 minutes',
          type: 'vestibular'
        },
        {
          id: 'sensory-bin',
          title: 'Sensory bin exploration',
          context: 'Calm and explore textures',
          duration: '15-20 minutes',
          type: 'tactile'
        }
      ]
    },
    {
      id: 'evening',
      title: 'Evening Wind-Down',
      subtitle: 'Prepare for rest and sleep',
      activities: [
        {
          id: 'deep-pressure-massage',
          title: 'Deep pressure massage',
          context: 'Calming before bedtime',
          duration: '10-15 minutes',
          type: 'calming'
        },
        {
          id: 'yoga-stretches',
          title: 'Gentle yoga stretches',
          context: 'Relax the body',
          duration: '10 minutes',
          type: 'proprioceptive'
        },
        {
          id: 'quiet-tactile-play',
          title: 'Quiet tactile activities',
          context: 'Soothing sensory input',
          duration: '15 minutes',
          type: 'tactile'
        }
      ]
    }
  ]

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

  const handleStartActivity = async (activity: Activity) => {
    if (!user) return
    
    setSubmittingActivity(activity.id)

    try {
      // Log activity completion to Supabase
      const { data, error } = await supabase
        .from('activity_completions')
        .insert({
          user_id: user.id,
          activity_name: activity.title,
          activity_type: activity.type,
          rating: 'neutral', // Default rating, can be updated later
          completed_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log(`Activity started: ${activity.title}`)
      // TODO: Navigate to activity detail page or show activity instructions
    } catch (err) {
      console.error('Error logging activity:', err)
      // For now, just log locally on error
      console.log(`Starting activity: ${activity.title}`)
    } finally {
      setSubmittingActivity(null)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="loading-text hig-body">Loading your schedule...</p>
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
        {/* Header with Back Button */}
        <div className="schedule-header">
          <div className="schedule-header-nav">
            <Link href="/dashboard/today" className="schedule-back-button">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Today</span>
            </Link>
          </div>

          <h1 className="schedule-title hig-title-1">
            Day Schedule
          </h1>
          <p className="schedule-subtitle hig-body">
            Plan your day with these recommended activities based on your child's sensory profile.
          </p>
        </div>

        {/* Time Block Activities */}
        <div className="schedule-content">
          {daySchedule.map((timeBlock) => (
            <div key={timeBlock.id} className="schedule-time-block">
              <div className="schedule-time-header">
                <h2 className="schedule-time-title hig-title-2">{timeBlock.title}</h2>
                <p className="schedule-time-subtitle hig-subhead">{timeBlock.subtitle}</p>
              </div>
              
              <div className="schedule-activities">
                {timeBlock.activities.map((activity) => (
                  <div key={activity.id} className="activity-card">
                    <p className="activity-context hig-footnote">{activity.context}</p>
                    <h3 className="activity-title hig-title-3">{activity.title}</h3>
                    <div className="activity-duration hig-subhead">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {activity.duration}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 