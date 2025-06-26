'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Assessment, ActivityCompletion } from '@/lib/supabase/client'

interface Activity {
  id: string
  title: string
  context: string
  duration: string
  type: 'proprioceptive' | 'vestibular' | 'tactile' | 'heavy-work' | 'calming'
}

export default function TodayDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [activityCompletions, setActivityCompletions] = useState<ActivityCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingActivity, setSubmittingActivity] = useState<string | null>(null)

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

      // Update local state
      if (data) {
        setActivityCompletions(prev => [data, ...prev])
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
          <p className="loading-text">Loading your activities...</p>
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
            <div className="today-header-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="today-header-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <p className="today-greeting">
            {profile.child_name}, you've got this!
          </p>
          <h1 className="today-title">
            Today's recommended activities
          </h1>
          
          {!assessment && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 text-sm">
                Complete your{' '}
                <Link href="/onboarding/assessment" className="underline font-medium">
                  sensory assessment
                </Link>
                {' '}to get personalized activity recommendations.
              </p>
            </div>
          )}
        </div>

        {/* Activity Cards */}
        <div className="today-activities">
          {todaysActivities.map((activity) => (
            <div key={activity.id} className="activity-card">
              <p className="activity-context">{activity.context}</p>
              <h3 className="activity-title">{activity.title}</h3>
              <div className="activity-duration">
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

        {/* Recent Activity */}
        {activityCompletions.length > 0 && (
          <div className="px-6 mb-20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-2">
              {activityCompletions.slice(0, 3).map((completion) => (
                <div key={completion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{completion.activity_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(completion.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    completion.rating === 'worked' ? 'bg-green-100 text-green-700' :
                    completion.rating === 'didnt_work' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {completion.rating === 'worked' ? 'Worked' :
                     completion.rating === 'didnt_work' ? "Didn't work" :
                     'Neutral'
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                  <span className="nav-tab-label-active">Today</span>
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
                  <span className="nav-tab-label-inactive">Coach</span>
                </div>
              </Link>

              {/* Behaviors Tab */}
              <Link href="/dashboard/behaviors" className="nav-tab">
                <div className="nav-tab-content nav-tab-inactive">
                  <div className="nav-tab-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="nav-tab-label-inactive">Behaviors</span>
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
                  <span className="nav-tab-label-inactive">Journal</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 