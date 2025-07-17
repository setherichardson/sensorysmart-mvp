'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Assessment } from '@/lib/supabase/client'
import { analytics } from '@/lib/analytics'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({
    parent_name: '',
    child_name: ''
  })
  const [saving, setSaving] = useState(false)

  // Track page view
  useEffect(() => {
    analytics.pageView('dashboard-profile');
  }, []);

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

  const handleBillingPortal = async () => {
    setBillingLoading(true)
    try {
      const response = await fetch('/api/billing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const { url, error } = await response.json()

      if (error) {
        console.error('Billing portal error:', error)
        
        // Fallback to direct Customer Portal link
        const directPortalUrl = 'https://billing.stripe.com/p/login/aFa9AU8OM7LS6qb8NJds400'
        if (confirm('Redirecting to billing portal. Continue?')) {
          window.location.href = directPortalUrl
        }
        return
      }

      // Redirect to Stripe Customer Portal
      window.location.href = url
    } catch (error) {
      console.error('Billing portal error:', error)
      
      // Fallback to direct Customer Portal link
      const directPortalUrl = 'https://billing.stripe.com/p/login/aFa9AU8OM7LS6qb8NJds400'
      if (confirm('Unable to access billing portal. Use direct link instead?')) {
        window.location.href = directPortalUrl
      }
    } finally {
      setBillingLoading(false)
    }
  }

  const getSystemLabel = (system: string) => {
    switch (system) {
      case 'tactile': return 'Touch'
      case 'visual': return 'Sight'
      case 'auditory': return 'Hearing'
      case 'olfactory': return 'Smell'
      case 'proprioceptive': return 'Body Awareness'
      case 'vestibular': return 'Movement'
      case 'interoception': return 'Internal Awareness'
      case 'social-emotional': return 'Social-Emotional'
      default: return system
    }
  }

  const getScoreInterpretation = (score: number) => {
    if (score <= 8) return { label: 'Avoiding', color: 'bg-red-100 text-red-700' }
    if (score <= 12) return { label: 'Sensitive', color: 'bg-orange-100 text-orange-700' }
    if (score <= 16) return { label: 'Typical', color: 'bg-gray-100 text-gray-700' }
    return { label: 'Seeking', color: 'bg-green-100 text-green-700' }
  }

  const getNeedsForSystem = (system: string, score: number) => {
    const interpretation = getScoreInterpretation(score)
    
    // Only return needs for non-typical scores
    if (interpretation.label === 'Typical') return null
    
    switch (system) {
      case 'tactile':
        if (interpretation.label === 'Avoiding') return 'Gentle, predictable touch experiences'
        if (interpretation.label === 'Sensitive') return 'Soft, controlled tactile input'
        if (interpretation.label === 'Seeking') return 'Rich, varied tactile experiences'
        break
      case 'visual':
        if (interpretation.label === 'Avoiding') return 'Calm, organized visual spaces'
        if (interpretation.label === 'Sensitive') return 'Soft, diffused lighting'
        if (interpretation.label === 'Seeking') return 'Bright, engaging visual stimuli'
        break
      case 'auditory':
        if (interpretation.label === 'Avoiding') return 'Quiet, peaceful sound environments'
        if (interpretation.label === 'Sensitive') return 'Gentle, predictable sounds'
        if (interpretation.label === 'Seeking') return 'Rich sounds and engaging audio'
        break
      case 'olfactory':
        if (interpretation.label === 'Avoiding') return 'Neutral, clean scents'
        if (interpretation.label === 'Sensitive') return 'Mild, familiar aromas'
        if (interpretation.label === 'Seeking') return 'Varied, interesting scents'
        break
      case 'proprioceptive':
        if (interpretation.label === 'Avoiding') return 'Light, gentle body input'
        if (interpretation.label === 'Sensitive') return 'Moderate, controlled movement'
        if (interpretation.label === 'Seeking') return 'Heavy work and deep pressure'
        break
      case 'vestibular':
        if (interpretation.label === 'Avoiding') return 'Steady, predictable motion'
        if (interpretation.label === 'Sensitive') return 'Slow, gentle movement'
        if (interpretation.label === 'Seeking') return 'Active, dynamic movement'
        break
      case 'interoception':
        if (interpretation.label === 'Avoiding') return 'Gentle body awareness activities'
        if (interpretation.label === 'Sensitive') return 'Calm internal awareness'
        if (interpretation.label === 'Seeking') return 'Strong internal feedback'
        break
      case 'social-emotional':
        if (interpretation.label === 'Avoiding') return 'Patient, understanding environments'
        if (interpretation.label === 'Sensitive') return 'Supportive, gentle interactions'
        if (interpretation.label === 'Seeking') return 'Engaging, social opportunities'
        break
    }
    return null
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
          {assessment && assessment.results && (
            <div className="profile-section" style={{ borderRadius: 24, background: '#fff', marginBottom: 16 }}>
              <div className="profile-section-header">
                <h2 className="profile-section-title hig-title-2" style={{ fontSize: 18, fontWeight: 600, color: '#252225' }}>{profile.child_name}'s Sensory Profile</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(assessment.results).map(([system, score]) => {
                  if (system === 'total' || system === 'profile' || system === 'behaviorScores') return null
                  if (typeof score !== 'number') return null
                  
                  const needs = getNeedsForSystem(system, score)
                  if (!needs) return null // Skip typical scores
                  
                  return (
                    <div key={system} className="flex flex-col">
                      <span className="text-gray-700 font-medium">{getSystemLabel(system)}:</span>
                      <span className="text-gray-600 ml-0">{needs}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {/* Sign Out & Billing Section */}
          <div className="profile-section" style={{ borderRadius: 24, background: '#fff', marginBottom: 8, padding: 24 }}>
            <div className="profile-section-header mb-4">
              <h2 className="profile-section-title hig-title-2" style={{ fontSize: 18, fontWeight: 600, color: '#252225' }}>Account</h2>
            </div>
            <div className="flex flex-col gap-3 mb-2">
              <a href="mailto:Allie@livingfullypeds.com" style={{ width: '100%', height: 40, border: '1px solid #EAE3E1', borderRadius: 16, background: '#fff', color: '#252225', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>Support</a>
              <button
                onClick={handleBillingPortal}
                disabled={billingLoading}
                style={{ width: '100%', height: 40, border: '1px solid #EAE3E1', borderRadius: 16, background: '#fff', color: '#252225', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {billingLoading ? 'Loading...' : 'Manage Billing'}
              </button>
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