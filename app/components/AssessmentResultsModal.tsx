'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Assessment } from '@/lib/supabase/client'

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
          name: 'Tactile (Touch)',
          score: results.tactile || 0,
          description: 'How your child processes touch and texture sensations'
        },
        {
          name: 'Visual (Sight)',
          score: results.visual || 0,
          description: 'How your child processes visual information'
        },
        {
          name: 'Auditory (Sound)',
          score: results.auditory || 0,
          description: 'How your child processes sounds and noise'
        },
        {
          name: 'Olfactory (Smell)',
          score: results.olfactory || 0,
          description: 'How your child processes smells and odors'
        },
        {
          name: 'Proprioceptive (Body Awareness)',
          score: results.proprioceptive || 0,
          description: 'How your child understands where their body is in space'
        },
        {
          name: 'Vestibular (Movement)',
          score: results.vestibular || 0,
          description: 'How your child processes balance and movement'
        },
        {
          name: 'Interoception (Internal Awareness)',
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

  const handleViewActivities = () => {
    onClose()
    // The user is already on the dashboard, so they can see activities
  }

  if (!isOpen) return null

  const sensoryProfile = getDetailedSensoryProfile()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Mona Sans, sans-serif' }}>
                Assessment Complete! 🎉
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
              {/* Overall Profile */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2" style={{ fontFamily: 'Mona Sans, sans-serif' }}>
                  Overall Sensory Profile
                </h3>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {sensoryProfile.overallProfile}
                  </span>
                  <p className="text-blue-800 text-sm">
                    {sensoryProfile.overallProfile === 'Sensory Seeking' 
                      ? 'Your child tends to seek out sensory experiences and may need more input to feel regulated.'
                      : sensoryProfile.overallProfile === 'Sensory Avoiding'
                      ? 'Your child tends to be sensitive to sensory input and may prefer calmer environments.'
                      : 'Your child shows a mix of sensory seeking and avoiding behaviors in different areas.'
                    }
                  </p>
                </div>
              </div>

              {/* Detailed Results */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Mona Sans, sans-serif' }}>
                  Detailed Results
                </h3>
                <div className="grid gap-3">
                  {sensoryProfile.categories.map((category, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900" style={{ fontFamily: 'Mona Sans, sans-serif' }}>
                          {category.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(category.score)}`}>
                            {getScoreLabel(category.score)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {category.score.toFixed(1)}/5
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
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            style={{ fontFamily: 'Mona Sans, sans-serif' }}
          >
            View {profile?.child_name}'s Activities
          </button>
        </div>
      </div>
    </div>
  )
} 