'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Assessment } from '@/lib/supabase/client'

export default function SensoryDetailsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)

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

        if (!assessmentData) {
          router.push('/onboarding/assessment')
          return
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

  const getDetailedSensoryProfile = () => {
    if (!assessment || !assessment.results) return null

    const results = assessment.results as any
    
    return {
      overallProfile: results.profile || 'Mixed Profile',
      categories: [
        {
          name: 'Tactile (Touch)',
          score: results.tactile || 0,
          description: 'How your child processes touch and texture sensations',
          recommendations: [
            'Use textured materials during play',
            'Try different fabric textures',
            'Incorporate touch activities into daily routines'
          ]
        },
        {
          name: 'Visual (Sight)',
          score: results.visual || 0,
          description: 'How your child processes visual information',
          recommendations: [
            'Reduce visual clutter in learning spaces',
            'Use visual schedules and supports',
            'Consider lighting preferences'
          ]
        },
        {
          name: 'Auditory (Sound)',
          score: results.auditory || 0,
          description: 'How your child processes sounds and noise',
          recommendations: [
            'Use noise-canceling headphones when needed',
            'Create quiet spaces for regulation',
            'Gradually introduce new sounds'
          ]
        },
        {
          name: 'Olfactory (Smell)',
          score: results.olfactory || 0,
          description: 'How your child processes smells and odors',
          recommendations: [
            'Avoid strong scents if sensitive',
            'Introduce new smells gradually',
            'Use preferred scents for comfort'
          ]
        },
        {
          name: 'Proprioceptive (Body Awareness)',
          score: results.proprioceptive || 0,
          description: 'How your child understands where their body is in space',
          recommendations: [
            'Include heavy work activities',
            'Try joint compression exercises',
            'Use weighted items for regulation'
          ]
        },
        {
          name: 'Vestibular (Movement)',
          score: results.vestibular || 0,
          description: 'How your child processes balance and movement',
          recommendations: [
            'Include movement breaks throughout the day',
            'Try swinging or spinning activities',
            'Practice balance exercises'
          ]
        },
        {
          name: 'Interoception (Internal Awareness)',
          score: results.interoception || 0,
          description: 'How your child perceives internal body signals (hunger, thirst, bathroom)',
          recommendations: [
            'Encourage regular check-ins for hunger/thirst',
            'Use reminders for bathroom breaks',
            'Discuss body signals and feelings'
          ]
        },
        {
          name: 'Social-Emotional Regulation',
          score: results['social-emotional'] || 0,
          description: 'How your child manages emotions and social situations',
          recommendations: [
            'Practice emotional labeling and coping skills',
            'Use social stories for group situations',
            'Encourage positive social interactions'
          ]
        }
      ]
    }
  }

  const getScoreColor = (score: number) => {
    if (score <= 1.5) return 'bg-green-100 text-green-700'
    if (score <= 2.5) return 'bg-yellow-100 text-yellow-700'
    if (score <= 3.5) return 'bg-orange-100 text-orange-700'
    return 'bg-red-100 text-red-700'
  }

  const getScoreLabel = (score: number) => {
    if (score <= 1.5) return 'Low Need'
    if (score <= 2.5) return 'Moderate Need'
    if (score <= 3.5) return 'High Need'
    return 'Very High Need'
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="loading-text hig-body">Loading your sensory profile...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile || !assessment) {
    return null // Will redirect
  }

  const sensoryProfile = getDetailedSensoryProfile()

  return (
    <div className="sensory-details-container">
      <div className="sensory-details-wrapper">
        {/* Header with Back Button */}
        <div className="sensory-details-header">
          <div className="sensory-details-header-nav">
            <Link href="/dashboard/profile" className="sensory-details-back-button">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Profile</span>
            </Link>
          </div>

          <h1 className="sensory-details-title hig-title-1">
            {profile.child_name}'s Sensory Profile
          </h1>
          <p className="sensory-details-subtitle hig-body">
            Complete assessment results and recommendations
          </p>
        </div>

        {/* Overall Profile */}
        <div className="sensory-details-content">
          <div className="sensory-details-section">
            <h2 className="sensory-details-section-title hig-title-2">Overall Profile</h2>
            <div className="overall-profile-card">
              <div className="overall-profile-badge">
                <span className="overall-profile-label hig-headline">{sensoryProfile?.overallProfile}</span>
              </div>
              <p className="overall-profile-description hig-body">
                {sensoryProfile?.overallProfile === 'Sensory Seeking' 
                  ? 'Your child tends to seek out sensory experiences and may need more input to feel regulated.'
                  : sensoryProfile?.overallProfile === 'Sensory Avoiding'
                  ? 'Your child tends to be sensitive to sensory input and may prefer calmer environments.'
                  : 'Your child shows a mix of sensory seeking and avoiding behaviors in different areas.'
                }
              </p>
            </div>
          </div>

          {/* Detailed Categories */}
          <div className="sensory-details-section">
            <h2 className="sensory-details-section-title hig-title-2">Detailed Results</h2>
            <div className="sensory-categories">
              {sensoryProfile?.categories.map((category, index) => (
                <div key={index} className="sensory-category-card">
                  <div className="sensory-category-header">
                    <h3 className="sensory-category-name hig-headline">{category.name}</h3>
                    <div className="sensory-category-score">
                      <span className={`sensory-score-badge hig-caption-1 ${getScoreColor(category.score)}`}>
                        {getScoreLabel(category.score)}
                      </span>
                      <span className="sensory-score-value hig-subhead">{category.score.toFixed(1)}/5</span>
                    </div>
                  </div>
                  
                  <p className="sensory-category-description hig-subhead">{category.description}</p>
                  
                  <div className="sensory-recommendations">
                    <h4 className="sensory-recommendations-title hig-callout">Recommendations:</h4>
                    <ul className="sensory-recommendations-list">
                      {category.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="sensory-recommendation-item hig-subhead">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment Info */}
          <div className="sensory-details-section">
            <div className="assessment-info">
              <p className="assessment-info-text hig-footnote">
                Assessment completed on {new Date(assessment.completed_at).toLocaleDateString()}
              </p>
              <Link href="/onboarding/assessment" className="retake-assessment-button">
                Retake Assessment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 