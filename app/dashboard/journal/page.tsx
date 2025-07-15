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
    activityRating: string | null
  }>({
    isOpen: false,
    activityId: '',
    activityName: '',
    activityDate: '',
    initialNote: '',
    activityRating: null
  })


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

        // Load completed activities from database
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activity_completions')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })

        // Also load from localStorage as fallback
        const localStorageActivities = JSON.parse(localStorage.getItem('activity_completions') || '[]')
        const userLocalActivities = localStorageActivities.filter((activity: any) => activity.user_id === user.id)
        
        console.log('Database activities:', activitiesData?.length || 0)
        console.log('localStorage activities:', userLocalActivities.length)
        
        // Combine database and localStorage activities
        let allActivities = activitiesData || []
        
        // Add localStorage activities that aren't in database
        userLocalActivities.forEach((localActivity: any) => {
          const existsInDb = allActivities.some((dbActivity: any) => 
            dbActivity.id === localActivity.id || 
            (dbActivity.activity_name === localActivity.activity_name && 
             dbActivity.completed_at === localActivity.completed_at)
          )
          if (!existsInDb) {
            allActivities.push(localActivity)
          }
        })
        
        // Sort by completed_at descending
        allActivities.sort((a: any, b: any) => 
          new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
        )

        if (activitiesError) {
          console.error('Error loading activities from database:', activitiesError)
        }
        
        // Transform the data to match our interface
        const transformedActivities: JournalActivity[] = allActivities.map(activity => ({
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
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
          color: '#0C3A28',
          background: '#DEFFF2',
          icon: '/Icons/Smile.svg'
        }
      case 'calmer':
        return {
          emoji: '😊',
          label: 'Calmer',
          color: '#12224C',
          background: '#DEE7FF',
          icon: '/Icons/Calmer.svg'
        }
      case 'neutral':
        return {
          emoji: '😐',
          label: 'Neutral',
          color: '#252225',
          background: '#E2E4F6',
          icon: '/Icons/meh.svg'
        }
      case 'distracted':
        return {
          emoji: '😵‍💫',
          label: 'Distracted',
          color: '#563616',
          background: '#FFEDDB',
          icon: '/Icons/Distracted.svg'
        }
      case 'dysregulated':
        return {
          emoji: '😖',
          label: 'Dysregulated',
          color: '#571B1A',
          background: '#FFB0AE',
          icon: '/Icons/Sad.svg'
        }
      case 'worked_well':
        return {
          emoji: '✅',
          label: 'Worked Well',
          color: '#0C3A28',
          background: '#DEFFF2',
          icon: '/Icons/Check.svg'
        }
      case 'didnt_work':
        return {
          emoji: '❌',
          label: "Didn't Work",
          color: '#571B1A',
          background: '#FFB0AE',
          icon: '/Icons/X.svg'
        }
      case 'okay':
        return {
          emoji: '⚠️',
          label: 'Okay',
          color: '#563616',
          background: '#FFEDDB',
          icon: '/Icons/meh.svg'
        }
      default:
        return {
          emoji: '❓',
          label: 'Not rated',
          color: '#252225',
          background: '#E2E4F6',
          icon: '/Icons/meh.svg'
        }
    }
  }

  const openNoteModal = (activity: JournalActivity) => {
    setNoteModal({
      isOpen: true,
      activityId: activity.id,
      activityName: activity.activity_name,
      activityDate: activity.completed_at.toISOString(),
      initialNote: activity.notes || '',
      activityRating: activity.rating
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

      // Also load from localStorage as fallback
      const localStorageActivities = JSON.parse(localStorage.getItem('activity_completions') || '[]')
      const userLocalActivities = localStorageActivities.filter((activity: any) => activity.user_id === user!.id)
      
      // Combine database and localStorage activities
      let allActivities = activitiesData || []
      
      // Add localStorage activities that aren't in database
      userLocalActivities.forEach((localActivity: any) => {
        const existsInDb = allActivities.some((dbActivity: any) => 
          dbActivity.id === localActivity.id || 
          (dbActivity.activity_name === localActivity.activity_name && 
           dbActivity.completed_at === localActivity.completed_at)
        )
        if (!existsInDb) {
          allActivities.push(localActivity)
        }
      })
      
      // Sort by completed_at descending
      allActivities.sort((a: any, b: any) => 
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      )

      if (allActivities.length > 0) {
        const transformedActivities: JournalActivity[] = allActivities.map(activity => ({
          id: activity.id,
          activity_name: activity.activity_name || 'Sensory Activity',
          activity_type: activity.activity_type || 'proprioceptive',
          completed_at: new Date(activity.completed_at),
          duration_minutes: activity.duration_minutes,
          rating: activity.rating,
          notes: activity.notes
        }))
        setActivities(transformedActivities)
        
        // Recalculate stats
        calculateStats(transformedActivities)
      }
    }
    loadActivities()
    closeNoteModal()
  }

  const handleNoteCancel = () => {
    setNoteModal({ ...noteModal, isOpen: false })
  }

  const exportData = () => {
    // Get all localStorage data
    const localStorageActivities = JSON.parse(localStorage.getItem('activity_completions') || '[]')
    const userActivities = localStorageActivities.filter((activity: any) => activity.user_id === user?.id)
    
    if (userActivities.length === 0) {
      alert('No data to export')
      return
    }

    // Create JSON export
    const jsonData = JSON.stringify(userActivities, null, 2)
    const jsonBlob = new Blob([jsonData], { type: 'application/json' })
    const jsonUrl = URL.createObjectURL(jsonBlob)
    const jsonLink = document.createElement('a')
    jsonLink.href = jsonUrl
    jsonLink.download = `sensory-activities-${new Date().toISOString().split('T')[0]}.json`
    jsonLink.click()

    // Create CSV export
    const csvHeaders = ['Date', 'Activity', 'Type', 'Duration (min)', 'Rating', 'Notes']
    const csvRows = userActivities.map((activity: any) => [
      new Date(activity.completed_at).toLocaleDateString(),
      activity.activity_name,
      activity.activity_type,
      activity.duration_minutes,
      activity.rating,
      activity.notes || ''
    ])
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map((cell: string) => `"${cell}"`).join(','))
      .join('\n')
    
    const csvBlob = new Blob([csvContent], { type: 'text/csv' })
    const csvUrl = URL.createObjectURL(csvBlob)
    const csvLink = document.createElement('a')
    csvLink.href = csvUrl
    csvLink.download = `sensory-activities-${new Date().toISOString().split('T')[0]}.csv`
    csvLink.click()
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
    <div className="journal-container min-h-screen" style={{ background: '#F6F6F6' }}>
      <div className="journal-wrapper mx-auto w-full max-w-md px-4">
        {/* Header */}
        <div className="journal-header">
          <div className="journal-header-nav">
            <h1 className="journal-title" style={{ fontWeight: 700, fontSize: 32, color: '#252225' }}>Activity journal</h1>
          </div>

          {/* Stats Section */}
          <div className="journal-stats-row">
            <div className="stat-card">
              <div className="stat-number">{stats.totalActivities}</div>
              <div className="stat-label">TODAY</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.activitiesThisWeek}</div>
              <div className="stat-label">THIS WEEK</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.currentStreak}</div>
              <div className="stat-label">STREAK</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="journal-content" style={{ marginTop: 0 }}>
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
            <div className="activity-list flex flex-col gap-4">
              {filteredActivities.map((activity) => {
                const ratingDisplay = getRatingDisplay(activity.rating)
                return (
                  <div 
                    key={activity.id} 
                    className="activity-card"
                    style={{ 
                      borderRadius: 24, 
                      background: '#fff', 
                      boxShadow: '0 2px 8px 0 rgba(44, 62, 80, 0.06)', 
                      padding: '16px 12px 12px 12px',
                      marginBottom: 0, 
                      width: '100%',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <h3 className="activity-title" style={{ color: '#252225', fontWeight: 600, fontSize: 20, margin: 0 }}>{activity.activity_name}</h3>
                      <button
                        onClick={() => openNoteModal(activity)}
                        style={{ background: 'none', border: 'none', padding: 0, marginLeft: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        aria-label="Edit note"
                      >
                        <img src="/Icons/Edit.svg" alt="Edit" style={{ width: 18, height: 18 }} />
                      </button>
                    </div>
                    {/* Rating chip */}
                    {ratingDisplay && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', fontSize: 12, padding: '4px 8px', borderRadius: 12, background: ratingDisplay.background, color: ratingDisplay.color, fontWeight: 600, marginBottom: 8 }}>
                        <img src={ratingDisplay.icon} alt={ratingDisplay.label} style={{ width: 14, height: 14, marginRight: 4, filter: 'brightness(0) saturate(100%)', opacity: 0.8 }} />
                        {ratingDisplay.label}
                      </div>
                    )}
                    {/* Time completed with calendar icon */}
                    <div style={{ display: 'flex', alignItems: 'center', color: '#252225', fontSize: 14, fontWeight: 500, margin: '8px 0 0 0' }}>
                      <img src="/Icons/Calendar.svg" alt="Calendar" style={{ width: 16, height: 16, marginRight: 6, color: '#252225', filter: 'invert(10%) sepia(6%) saturate(0%) hue-rotate(0deg) brightness(100%)' }} />
                      {formatTime(activity.completed_at)}
                    </div>
                    {/* Parent note */}
                    {activity.notes && activity.notes.trim() && (
                      <div style={{ border: '1px solid #EEE6E5', borderRadius: 12, padding: 12, marginTop: 12, color: '#252225', fontSize: 15, background: '#FAF9F8' }}>
                        {activity.notes}
                      </div>
                    )}
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
          activityRating={noteModal.activityRating}
        />

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <div className="bottom-nav-wrapper">
            <div className="bottom-nav-container flex justify-between">
              {/* Today Tab */}
              <Link href="/dashboard/today" className="nav-tab">
                <div className="nav-tab-content nav-tab-inactive flex flex-col items-center">
                  <img src="/Icons/Calendar-Default.svg" alt="Today" style={{ width: 28, height: 28 }} />
                  <span className="nav-tab-label-inactive hig-caption-1">Today</span>
                </div>
              </Link>
              {/* Coach Tab */}
              <Link href="/dashboard/coach" className="nav-tab">
                <div className="nav-tab-content nav-tab-inactive flex flex-col items-center">
                  <img src="/Icons/Chat-Default.svg" alt="Coach" style={{ width: 28, height: 28 }} />
                  <span className="nav-tab-label-inactive hig-caption-1">Coach</span>
                </div>
              </Link>
              {/* Journal Tab - Active */}
              <Link href="/dashboard/journal" className="nav-tab">
                <div className="nav-tab-content nav-tab-active flex flex-col items-center">
                  <img src="/Icons/Journal-Active.svg" alt="Journal" style={{ width: 28, height: 28 }} />
                  <span className="nav-tab-label-active hig-caption-1">Journal</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
          .journal-stats-row {
            display: flex;
            gap: 16px;
            margin-bottom: 24px;
            justify-content: space-between;
            flex-wrap: wrap;
          }
          .stat-card {
            flex: 1 1 0;
            background: #fff;
            border: 1px solid #ececec;
            border-radius: 16px;
            padding: 24px 0 16px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-shadow: 0 1px 4px rgba(0,0,0,0.03);
            min-width: 100px;
            max-width: 180px;
          }
          .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: #252225;
            margin-bottom: 4px;
          }
          .stat-label {
            font-size: 1rem;
            color: #888;
            letter-spacing: 1px;
            font-weight: 500;
            text-transform: uppercase;
          }
          @media (max-width: 600px) {
            .journal-stats-row {
              gap: 8px;
            }
            .stat-card {
              min-width: 80px;
              padding: 16px 0 12px 0;
            }
            .stat-number {
              font-size: 1.5rem;
            }
            .stat-label {
              font-size: 0.875rem;
            }
          }
        `}</style>
    </div>
  )
} 