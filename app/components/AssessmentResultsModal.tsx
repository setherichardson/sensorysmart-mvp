'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Assessment } from '@/lib/supabase/client'
import { analytics } from '@/lib/analytics'

interface AssessmentResultsModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  profile: Profile | null
}

export default function AssessmentResultsModal({ isOpen, onClose, user, profile }: AssessmentResultsModalProps) {
  const router = useRouter()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && user) {
      loadAssessment()
    }
  }, [isOpen, user])

  const loadAssessment = async () => {
    try {
      const { data: assessmentData } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user!.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single()

      console.log('Assessment data:', assessmentData)
      console.log('Assessment results:', assessmentData?.results)
      setAssessment(assessmentData)
    } catch (err) {
      console.error('Error loading assessment:', err)
    } finally {
      setLoading(false)
    }
  }

  const getDetailedSensoryProfile = () => {
    if (!assessment || !assessment.results) return null

    const results = assessment.results as any
    
    return {
      overallProfile: results.profile || 'Mixed Profile',
      categories: [
        {
          name: 'Touch',
          score: results.tactile || 0,
          description: 'How your child processes touch and texture sensations'
        },
        {
          name: 'Sight',
          score: results.visual || 0,
          description: 'How your child processes visual information'
        },
        {
          name: 'Sound',
          score: results.auditory || 0,
          description: 'How your child processes sounds and noise'
        },
        {
          name: 'Smell',
          score: results.olfactory || 0,
          description: 'How your child processes smells and odors'
        },
        {
          name: 'Body Awareness',
          score: results.proprioceptive || 0,
          description: 'How your child understands where their body is in space'
        },
        {
          name: 'Movement',
          score: results.vestibular || 0,
          description: 'How your child processes balance and movement'
        },
        {
          name: 'Internal Awareness',
          score: results.interoception || 0,
          description: 'How your child perceives internal body signals'
        },
        {
          name: 'Social-Emotional Regulation',
          score: results['social-emotional'] || 0,
          description: 'How your child manages emotions and social situations'
        }
      ]
    }
  }

  const getScoreColor = (score: number) => {
    if (score <= 8) return 'bg-red-100 text-red-700'
    if (score <= 12) return 'bg-orange-100 text-orange-700'
    if (score <= 16) return 'bg-blue-100 text-blue-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  const getScoreLabel = (score: number) => {
    console.log('Score being evaluated:', score, 'Type:', typeof score)
    if (score <= 8) return 'Avoiding'
    if (score <= 12) return 'Sensitive'
    if (score <= 16) return 'Typical'
    return 'Seeking'
  }

  const handleViewActivities = () => {
    analytics.assessmentModalViewed()
    onClose()
    // The user is already on the dashboard, so they can see activities
  }

  if (!isOpen) return null

  const sensoryProfile = getDetailedSensoryProfile()

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="h-full w-full overflow-y-auto pt-0">
        {/* Header */}
        <div className="px-6 pt-0">
          <div className="flex items-center justify-between" style={{ marginTop: '16px' }}>
            <div>
              <h2 className="font-semibold text-gray-900" style={{ fontFamily: 'Mona Sans, sans-serif', fontSize: '22px', fontWeight: '600', color: '#252225' }}>
                Assessment Complete!
              </h2>
              <p className="text-gray-600 mt-1" style={{ fontFamily: 'Mona Sans, sans-serif' }}>
                Here's what we discovered about {profile?.child_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading results...</span>
            </div>
          ) : sensoryProfile ? (
            <div className="space-y-6">
              {/* Detailed Results */}
              <div>
                <div className="grid gap-3">
                  {sensoryProfile.categories
                    .filter(category => getScoreLabel(category.score) !== 'Typical')
                    .map((category, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900" style={{ fontFamily: 'Mona Sans, sans-serif', fontWeight: '600' }}>
                          {category.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(category.score)}`}>
                            {getScoreLabel(category.score)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Assessment completed on {assessment ? new Date(assessment.completed_at).toLocaleDateString() : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No assessment results found.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleViewActivities}
            className="w-full px-6 font-bold text-base hover:opacity-90 transition-colors"
            style={{ backgroundColor: '#367A87', color: 'white', borderRadius: '100px', height: '40px', fontFamily: 'Mona Sans, sans-serif' }}
          >
            View {profile?.child_name}'s Activities
          </button>
        </div>
      </div>
    </div>
  )
} 