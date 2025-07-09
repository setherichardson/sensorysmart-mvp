'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Assessment } from '@/lib/supabase/client'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

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

        // Get latest assessment
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

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await supabase.auth.signOut()
      router.push('/signup')
    } catch (error) {
      console.error('Error signing out:', error)
      setSigningOut(false)
    }
  }

  const getSensoryProfileSummary = () => {
    if (!assessment || !assessment.results) return null

    const results = assessment.results as any
    
    return [
      {
        name: 'Vestibular',
        status: results.sensory_profile || 'Mixed Profile',
        description: results.sensory_profile === 'Sensory Seeking' 
          ? 'Seeks movement, spinning, and swinging activities'
          : results.sensory_profile === 'Sensory Avoiding'
          ? 'Prefers calm, predictable movement activities'
          : 'Benefits from a mix of movement and calming activities'
      },
      {
        name: 'Tactile', 
        status: 'Balanced',
        description: 'Generally comfortable with most textures'
      },
      {
        name: 'Proprioceptive',
        status: results.sensory_profile || 'Mixed Profile',
        description: results.sensory_profile === 'Sensory Seeking'
          ? 'Seeks deep pressure and heavy work activities'
          : results.sensory_profile === 'Sensory Avoiding'
          ? 'Prefers gentle, predictable pressure activities'
          : 'Benefits from varied proprioceptive input'
      }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Seeking':
      case 'Sensory Seeking':
        return 'bg-blue-100 text-blue-700'
      case 'Balanced':
        return 'bg-green-100 text-green-700'
      case 'Avoiding':
      case 'Sensory Avoiding':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="loading-text hig-body">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect
  }

  const sensoryProfileSummary = getSensoryProfileSummary()

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* Header with Back Button */}
        <div className="profile-header">
          <div className="profile-header-nav">
            <Link href="/dashboard/today" className="profile-back-button">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Today</span>
            </Link>
          </div>

          <h1 className="profile-title hig-title-1">
            Settings
          </h1>
        </div>

        {/* Profile Information */}
        <div className="profile-content">
          <div className="profile-section">
            <div className="profile-section-header">
              <div className="profile-section-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="profile-section-title hig-title-2">Profile</h2>
            </div>

            <div className="profile-fields">
              <div className="profile-field">
                <label className="profile-field-label hig-subhead">Your name</label>
                <div className="profile-field-value hig-body">{profile.parent_name}</div>
              </div>
              
              <div className="profile-field">
                <label className="profile-field-label hig-subhead">Child's name</label>
                <div className="profile-field-value hig-body">{profile.child_name}</div>
              </div>
            </div>
          </div>

          {/* Sensory Profile Section */}
          {sensoryProfileSummary && (
            <div className="profile-section">
              <div className="profile-section-header">
                <div className="profile-section-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="profile-section-title hig-title-2">Child's Sensory Profile</h2>
              </div>

              <div className="sensory-profile-summary">
                {sensoryProfileSummary.map((item, index) => (
                  <div key={index} className="sensory-profile-item">
                    <div className="sensory-profile-header">
                      <h3 className="sensory-profile-name hig-headline">{item.name}</h3>
                      <span className={`sensory-profile-status hig-caption-1 ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="sensory-profile-description hig-subhead">{item.description}</p>
                  </div>
                ))}
              </div>

              <Link href="/dashboard/profile/sensory-details" className="view-full-profile-button">
                <span>View full sensory profile</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

          {!assessment && (
            <div className="profile-section">
              <div className="assessment-prompt">
                <p className="assessment-prompt-text hig-body">
                  Complete your sensory assessment to see your child's profile here.
                </p>
                <Link href="/onboarding/assessment" className="assessment-prompt-button">
                  Take Assessment
                </Link>
              </div>
            </div>
          )}

          {/* Sign Out Section */}
          <div className="profile-section">
            <div className="profile-section-header">
              <div className="profile-section-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="profile-section-title hig-title-2">Account</h2>
            </div>

            <button 
              onClick={handleSignOut}
              disabled={signingOut}
              className="sign-out-button"
            >
              {signingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing out...
                </>
              ) : (
                <>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 