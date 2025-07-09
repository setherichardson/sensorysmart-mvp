'use client'
import { useState, useEffect } from 'react'
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
  type: 'proprioceptive' | 'vestibular' | 'tactile' | 'heavy-work' | 'calming'
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

  // Sample activities matching the wireframe
  const todaysActivities: Activity[] = [
    {
      id: 'wall-pushups',
      title: 'Wall push-ups',
      context: 'Great for morning regulation',
      duration: '2 minutes',
      type: 'proprioceptive'
    },
    {
      id: 'resistance-band',
      title: 'Resistance band pull',
      context: 'Perfect before lunch to help focus',
      duration: '3-5 minutes',
      type: 'heavy-work'
    },
    {
      id: 'weighted-lap-pad',
      title: 'Weighted lap pad activity',
      context: 'Ideal for afternoon energy',
      duration: '10-15 minutes',
      type: 'calming'
    }
  ]

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
      case 'resistance-band':
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
          {todaysActivities.map((activity) => (
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