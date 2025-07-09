'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Assessment, ActivityCompletion } from '@/lib/supabase/client'
import NoteModal from '../../components/NoteModal'

interface JournalActivity {
  id: string
  activity_name: string
  activity_type: 'proprioceptive' | 'vestibular' | 'tactile' | 'heavy-work' | 'calming' | 'auditory' | 'visual'
  completed_at: Date
  duration_minutes?: number
  rating: 'regulated' | 'calmer' | 'neutral' | 'distracted' | 'dysregulated' | 'worked_well' | 'didnt_work' | 'okay' | null
  notes?: string
}

interface JournalStats {
  totalActivities: number
  activitiesThisWeek: number
  currentStreak: number
}



export default function JournalPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [activities, setActivities] = useState<JournalActivity[]>([])
  const [stats, setStats] = useState<JournalStats>({
    totalActivities: 0,
    activitiesThisWeek: 0,
    currentStreak: 0
  })
  const [loading, setLoading] = useState(true)

  const [noteModal, setNoteModal] = useState<{
    isOpen: boolean
    activityId: string
    activityName: string
    activityDate: string
    initialNote: string
  }>({
    isOpen: false,
    activityId: '',
    activityName: '',
    activityDate: '',
    initialNote: ''
  })
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false)

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

        // Load completed activities
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activity_completions')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })

        if (activitiesError) {
          console.error('Error loading activities:', activitiesError)
        } else {
          // Transform the data to match our interface
          const transformedActivities: JournalActivity[] = (activitiesData || []).map(activity => ({
            id: activity.id,
            activity_name: activity.activity_name || 'Sensory Activity',
            activity_type: activity.activity_type || 'proprioceptive',
            completed_at: new Date(activity.completed_at),
            duration_minutes: activity.duration_minutes,
            rating: activity.rating,
            notes: activity.notes
          }))
          setActivities(transformedActivities)
          
          // Calculate stats
          calculateStats(transformedActivities)
          
          // Check if we just completed an activity (most recent activity is within last 5 minutes)
          if (transformedActivities.length > 0) {
            const mostRecent = transformedActivities[0]
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
            if (mostRecent.completed_at > fiveMinutesAgo) {
              setShowCompletionAnimation(true)
              // Hide animation after 3 seconds
              setTimeout(() => setShowCompletionAnimation(false), 3000)
            }
          }
        }

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

  const calculateStats = (activities: JournalActivity[]) => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const activitiesThisWeek = activities.filter(activity => activity.completed_at >= oneWeekAgo)
    
    // Calculate current streak
    let currentStreak = 0
    const sortedActivities = [...activities].sort((a, b) => b.completed_at.getTime() - a.completed_at.getTime())
    
    for (let i = 0; i < sortedActivities.length; i++) {
      const activityDate = new Date(sortedActivities[i].completed_at)
      const expectedDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      
      if (activityDate.toDateString() === expectedDate.toDateString()) {
        currentStreak++
      } else {
        break
      }
    }
    
    setStats({
      totalActivities: activities.length,
      activitiesThisWeek: activitiesThisWeek.length,
      currentStreak
    })
  }

  const getFilteredActivities = () => {
    return activities
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return 'Today, ' + date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } else if (diffDays === 2) {
      return 'Yesterday, ' + date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'proprioceptive': return 'Proprioceptive'
      case 'vestibular': return 'Vestibular'
      case 'tactile': return 'Tactile'
      case 'heavy-work': return 'Heavy Work'
      case 'calming': return 'Calming'
      case 'auditory': return 'Auditory'
      case 'visual': return 'Visual'
      default: return type
    }
  }

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'proprioceptive': return 'bg-blue-100 text-blue-700'
      case 'vestibular': return 'bg-green-100 text-green-700'
      case 'tactile': return 'bg-purple-100 text-purple-700'
      case 'heavy-work': return 'bg-orange-100 text-orange-700'
      case 'calming': return 'bg-pink-100 text-pink-700'
      case 'auditory': return 'bg-indigo-100 text-indigo-700'
      case 'visual': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRatingDisplay = (rating: string | null) => {
    switch (rating) {
      case 'regulated':
        return {
          emoji: '😌',
          label: 'Regulated',
          color: 'text-green-600'
        }
      case 'calmer':
        return {
          emoji: '😊',
          label: 'Calmer',
          color: 'text-blue-600'
        }
      case 'neutral':
        return {
          emoji: '😐',
          label: 'Neutral',
          color: 'text-gray-600'
        }
      case 'distracted':
        return {
          emoji: '😵‍💫',
          label: 'Distracted',
          color: 'text-yellow-600'
        }
      case 'dysregulated':
        return {
          emoji: '😖',
          label: 'Dysregulated',
          color: 'text-red-600'
        }
      case 'worked_well':
        return {
          emoji: '✅',
          label: 'Worked Well',
          color: 'text-green-600'
        }
      case 'didnt_work':
        return {
          emoji: '❌',
          label: "Didn't Work",
          color: 'text-red-600'
        }
      case 'okay':
        return {
          emoji: '⚠️',
          label: 'Okay',
          color: 'text-yellow-600'
        }
      default:
        return {
          emoji: '❓',
          label: 'Not rated',
          color: 'text-gray-500'
        }
    }
  }

  const openNoteModal = (activity: JournalActivity) => {
    setNoteModal({
      isOpen: true,
      activityId: activity.id,
      activityName: activity.activity_name,
      activityDate: activity.completed_at.toISOString(),
      initialNote: activity.notes || ''
    })
  }

  const closeNoteModal = () => {
    setNoteModal(prev => ({ ...prev, isOpen: false }))
  }

  const handleNoteSave = () => {
    // Refresh activities to show updated notes
    const loadActivities = async () => {
      const { data: activitiesData } = await supabase
        .from('activity_completions')
        .select('*')
        .eq('user_id', user!.id)
        .order('completed_at', { ascending: false })

      if (activitiesData) {
        const transformedActivities: JournalActivity[] = activitiesData.map(activity => ({
          id: activity.id,
          activity_name: activity.activity_name || 'Sensory Activity',
          activity_type: activity.activity_type || 'proprioceptive',
          completed_at: new Date(activity.completed_at),
          duration_minutes: activity.duration_minutes,
          rating: activity.rating,
          notes: activity.notes
        }))
        setActivities(transformedActivities)
        calculateStats(transformedActivities)
      }
    }
    
    loadActivities()
  }

  const filteredActivities = getFilteredActivities()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="loading-text">Loading your activity journal...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect
  }

  return (
    <div className="journal-container">
      {/* Completion Animation */}
      {showCompletionAnimation && (
        <div className="completion-animation">
          <div className="completion-content">
            <div className="completion-icon">✅</div>
            <div className="completion-text">Activity completed!</div>
          </div>
        </div>
      )}
      
      <div className="journal-wrapper">
        {/* Header */}
        <div className="journal-header">
          <div className="journal-header-nav">
            <h1 className="journal-title">Activity Journal</h1>
            <Link href="/dashboard/today" className="journal-header-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15l4-4 4 4" />
              </svg>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="journal-stats">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats.totalActivities}</div>
                <div className="stat-label">Total Activities</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.activitiesThisWeek}</div>
                <div className="stat-label">This Week</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.currentStreak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>
          </div>


        </div>

        {/* Content */}
        <div className="journal-content">
          {filteredActivities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="empty-state-title">No activities yet</h3>
              <p className="empty-state-text">
                Complete your first sensory activity to start tracking progress!
              </p>
              <Link href="/dashboard/today" className="empty-state-button">
                Start an Activity
              </Link>
            </div>
          ) : (
            <div className="activity-list">
              {filteredActivities.map((activity) => {
                const ratingDisplay = getRatingDisplay(activity.rating)
                return (
                  <div key={activity.id} className="activity-card">
                    <div className="activity-card-header">
                      <div className="activity-info">
                        <h3 className="activity-name">{activity.activity_name}</h3>
                        <div className="activity-meta">
                          <span className={`activity-type ${getActivityTypeColor(activity.activity_type)}`}>
                            {getActivityTypeLabel(activity.activity_type)}
                          </span>
                          {activity.duration_minutes && (
                            <span className="activity-duration">
                              {activity.duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="activity-actions">
                        <div className={`activity-rating ${ratingDisplay.color}`}>
                          <span className="rating-emoji">{ratingDisplay.emoji}</span>
                          <span className="rating-label">{ratingDisplay.label}</span>
                        </div>
                        <button
                          onClick={() => openNoteModal(activity)}
                          className="note-button"
                          title={activity.notes ? "Edit note" : "Add note"}
                        >
                          {activity.notes ? (
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="note-icon has-note">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          ) : (
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="note-icon">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="activity-card-content">
                      <div className="activity-time">
                        {formatDate(activity.completed_at)}
                      </div>
                      {activity.notes && (
                        <div className="activity-notes-preview">
                          <p className="notes-text">{activity.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Note Modal */}
        <NoteModal
          isOpen={noteModal.isOpen}
          onClose={closeNoteModal}
          activityId={noteModal.activityId}
          activityName={noteModal.activityName}
          activityDate={noteModal.activityDate}
          initialNote={noteModal.initialNote}
          onSave={handleNoteSave}
        />

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <div className="bottom-nav-wrapper">
            <div className="bottom-nav-container">
              {/* Today Tab */}
              <Link href="/dashboard/today" className="nav-tab">
                <div className="nav-tab-content nav-tab-inactive">
                  <div className="nav-tab-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15l4-4 4 4" />
                    </svg>
                  </div>
                  <span className="nav-tab-label-inactive">Today</span>
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

              {/* Journal Tab - Active */}
              <Link href="/dashboard/journal" className="nav-tab">
                <div className="nav-tab-content nav-tab-active">
                  <div className="nav-tab-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="nav-tab-label-active">Journal</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
        </div>
  )
} 