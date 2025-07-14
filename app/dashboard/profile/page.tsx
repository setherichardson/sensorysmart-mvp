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
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({
    parent_name: '',
    child_name: ''
  })
  const [saving, setSaving] = useState(false)

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
        setEditValues({
          parent_name: profileData.parent_name || '',
          child_name: profileData.child_name || ''
        })
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

  const startEditing = (field: string) => {
    setEditingField(field)
    setEditValues({
      parent_name: profile?.parent_name || '',
      child_name: profile?.child_name || ''
    })
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditValues({
      parent_name: profile?.parent_name || '',
      child_name: profile?.child_name || ''
    })
  }

  const saveChanges = async () => {
    if (!user || !profile || !editingField) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          [editingField]: editValues[editingField as keyof typeof editValues]
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        return
      }

      // Update local state
      setProfile({
        ...profile,
        [editingField]: editValues[editingField as keyof typeof editValues]
      })
      setEditingField(null)
    } catch (error) {
      console.error('Error saving changes:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveChanges()
    } else if (e.key === 'Escape') {
      cancelEditing()
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
    <div className="profile-container" style={{ background: '#F6F6F6', minHeight: '100vh' }}>
      <div className="profile-wrapper mx-auto w-full px-4">
        {/* Header with Back Button */}
        <div className="profile-header flex items-center mb-6">
          <button onClick={() => router.push('/dashboard/today')} className="mr-2 p-0 bg-transparent border-none flex items-center">
            <svg fill="none" stroke="#252225" viewBox="0 0 24 24" width={24} height={24}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="profile-title hig-title-1 flex-1 text-center" style={{ fontWeight: 700, fontSize: 18, color: '#252225' }}>Settings</h1>
        </div>
        {/* Profile Information */}
        <div className="profile-content">
          <div className="profile-section" style={{ borderRadius: 24, background: '#fff', marginBottom: 16 }}>
            <div className="profile-section-header">
              <h2 className="profile-section-title hig-title-2" style={{ fontSize: 18, fontWeight: 600, color: '#252225' }}>Profile</h2>
            </div>
            <div className="profile-fields">
              <div className="profile-field">
                <label className="profile-field-label hig-subhead">Parent name</label>
                {editingField === 'parent_name' ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={editValues.parent_name}
                      onChange={(e) => setEditValues({ ...editValues, parent_name: e.target.value })}
                      onKeyDown={handleKeyPress}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        paddingRight: '80px',
                        border: '1px solid #EEE6E5',
                        borderRadius: 8,
                        fontSize: 16,
                        color: '#252225'
                      }}
                      autoFocus
                    />
                    <button
                      onClick={saveChanges}
                      disabled={saving}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        padding: '4px 12px',
                        background: '#367A87',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        cursor: 'pointer',
                        opacity: saving ? 0.6 : 1
                      }}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                ) : (
                  <div 
                    className="profile-field-value hig-body cursor-pointer hover:bg-gray-50 p-2 rounded"
                    onClick={() => startEditing('parent_name')}
                    style={{ minHeight: 40 }}
                  >
                    <span>{profile.parent_name}</span>
                  </div>
                )}
              </div>
              <div className="profile-field">
                <label className="profile-field-label hig-subhead">Child's name</label>
                {editingField === 'child_name' ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={editValues.child_name}
                      onChange={(e) => setEditValues({ ...editValues, child_name: e.target.value })}
                      onKeyDown={handleKeyPress}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        paddingRight: '80px',
                        border: '1px solid #EEE6E5',
                        borderRadius: 8,
                        fontSize: 16,
                        color: '#252225'
                      }}
                      autoFocus
                    />
                    <button
                      onClick={saveChanges}
                      disabled={saving}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        padding: '4px 12px',
                        background: '#367A87',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        cursor: 'pointer',
                        opacity: saving ? 0.6 : 1
                      }}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                ) : (
                  <div 
                    className="profile-field-value hig-body cursor-pointer hover:bg-gray-50 p-2 rounded"
                    onClick={() => startEditing('child_name')}
                    style={{ minHeight: 40 }}
                  >
                    <span>{profile.child_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Sensory Profile Section */}
          {sensoryProfileSummary && (
            <div className="profile-section" style={{ borderRadius: 24, background: '#fff', marginBottom: 16 }}>
              <div className="profile-section-header">
                <h2 className="profile-section-title hig-title-2" style={{ fontSize: 18, fontWeight: 600, color: '#252225' }}>{profile.child_name}'s Sensory Profile</h2>
              </div>
              <div className="sensory-profile-summary flex flex-col gap-4">
                {sensoryProfileSummary.map((item, index) => (
                  <div key={index} className="sensory-profile-item" style={{ background: '#F6F6F6', border: '1px solid #EEE6E5', borderRadius: 16, color: '#252225', padding: 16 }}>
                    <div className="sensory-profile-header flex items-center justify-between mb-1">
                      <h3 className="sensory-profile-name hig-headline" style={{ fontWeight: 600 }}>{item.name}</h3>
                      <span className={`sensory-profile-status hig-caption-1 ${getStatusColor(item.status)}`}>{item.status}</span>
                    </div>
                    <p className="sensory-profile-description hig-subhead" style={{ color: '#252225' }}>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Sign Out & Billing Section */}
          <div className="profile-section" style={{ borderRadius: 24, background: '#fff', marginBottom: 8, padding: 24 }}>
            <div className="profile-section-header mb-4">
              <h2 className="profile-section-title hig-title-2" style={{ fontSize: 18, fontWeight: 600, color: '#252225' }}>Account</h2>
            </div>
            <div className="flex flex-col gap-3 mb-2">
              <a href="mailto:help@getsensorysmart.com" style={{ width: '100%', height: 40, border: '1px solid #EAE3E1', borderRadius: 16, background: '#fff', color: '#252225', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>Support</a>
              <Link href="/dashboard/billing" style={{ width: '100%', height: 40, border: '1px solid #EAE3E1', borderRadius: 16, background: '#fff', color: '#252225', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Billing</Link>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                style={{ width: '100%', height: 40, border: '1px solid #A7230C', borderRadius: 16, background: '#fff', color: '#A7230C', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {signingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
          {/* EA Release Note */}
          <div className="w-full flex justify-center mt-2">
            <p style={{ fontSize: 12, color: '#6C6C6C', fontWeight: 400, textAlign: 'center' }}>EA release. 0.1</p>
          </div>
        </div>
      </div>
    </div>
  )
} 