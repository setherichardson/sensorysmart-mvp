'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Activity } from '@/lib/supabase/client'

interface ActivityCard {
  id: string
  title: string
  description: string
  duration: string
  materials: string[]
  steps: string[]
  category: string
}

interface BehaviorIssue {
  id: string
  title: string
  description: string
  activities: string[]
  icon: string
  activityCards: ActivityCard[]
}

interface BehaviorHelpModalProps {
  isOpen: boolean
  onClose: () => void
  user?: any
  assessment?: any
}

const behaviorIssues: BehaviorIssue[] = [
  {
    id: 'restaurant',
    title: 'Acting up in restaurants',
    description: 'Your child is having trouble sitting still or being quiet in restaurants',
    activities: [
      'Deep pressure hugs before entering',
      'Fidget toys or stress balls',
      'Heavy work activities (carrying items)',
      'Deep breathing exercises'
    ],
    icon: '🍽️',
    activityCards: []
  },
  {
    id: 'bedtime',
    title: 'Bedtime struggles',
    description: 'Your child has trouble settling down for sleep',
    activities: [
      'Gentle rocking or swinging',
      'Weighted blanket or heavy pillows',
      'Calming sensory activities',
      'Deep pressure massage'
    ],
    icon: '😴',
    activityCards: []
  },
  {
    id: 'transitions',
    title: 'Difficulty with transitions',
    description: 'Your child struggles when switching between activities',
    activities: [
      'Visual timers and schedules',
      'Warning signals (5-minute warnings)',
      'Transition objects or comfort items',
      'Movement breaks between activities'
    ],
    icon: '⏰',
    activityCards: []
  },
  {
    id: 'focus',
    title: 'Trouble focusing',
    description: 'Your child has difficulty maintaining attention',
    activities: [
      'Movement breaks every 15-20 minutes',
      'Fidget tools for hands',
      'Heavy work activities',
      'Visual supports and timers'
    ],
    icon: '🎯',
    activityCards: []
  },
  {
    id: 'meltdowns',
    title: 'Sensory meltdowns',
    description: 'Your child becomes overwhelmed and has meltdowns',
    activities: [
      'Create a calm-down space',
      'Deep pressure activities',
      'Slow, rhythmic movements',
      'Sensory tools for regulation'
    ],
    icon: '😤',
    activityCards: []
  }
]

export default function BehaviorHelpModal({ isOpen, onClose, user, assessment }: BehaviorHelpModalProps) {
  const [selectedIssue, setSelectedIssue] = useState<BehaviorIssue | null>(null)
  const [personalizedActivities, setPersonalizedActivities] = useState<Activity[]>([])
  const [loadingActivities, setLoadingActivities] = useState(false)

  console.log('🔍 BehaviorHelpModal props:', { isOpen, user: !!user, assessment: !!assessment })
  console.log('📊 Assessment data:', assessment)

  if (!isOpen) return null

  const handleIssueSelect = async (issue: BehaviorIssue) => {
    setSelectedIssue(issue)
    await loadPersonalizedActivities(issue)
  }

  const handleBack = () => {
    setSelectedIssue(null)
    setPersonalizedActivities([])
  }

  const loadPersonalizedActivities = async (issue: BehaviorIssue) => {
    console.log('🔍 Loading personalized activities for issue:', issue.id)
    console.log('📊 Assessment data:', assessment)
    
    if (!assessment?.results) {
      console.log('❌ No assessment results available')
      setLoadingActivities(false)
      return
    }

    setLoadingActivities(true)
    try {
      const results = assessment.results as any
      const behaviorScores = results.behaviorScores || {}
      
      console.log('🎯 Behavior scores:', behaviorScores)

      // Get activities from database
      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      console.log('📦 Database activities:', activities?.length || 0)
      console.log('❌ Database error:', error)

      if (error || !activities || activities.length === 0) {
        console.log('📚 No database activities available, using fallback library')
        
        // Use fallback activities from the activity library
        const fallbackActivities: Activity[] = [
          {
            id: '1',
            title: 'Deep Pressure Hug',
            description: 'A calming activity that provides deep pressure input',
            context: 'Before transitions',
            duration_minutes: 3,
            activity_type: 'proprioceptive',
            sensory_systems: ['proprioceptive'],
            behavior_fit: 'seeking',
            difficulty: 'beginner',
            materials_needed: ['None'],
            steps: [],
            benefits: ['Calming', 'Regulation'],
            when_to_use: 'Before challenging situations',
            variations: [],
            age_range: '3-12',
            environment: 'indoor',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Wall Push-Ups',
            description: 'Heavy work activity for proprioceptive input',
            context: 'When overstimulated',
            duration_minutes: 5,
            activity_type: 'heavy-work',
            sensory_systems: ['proprioceptive'],
            behavior_fit: 'seeking',
            difficulty: 'beginner',
            materials_needed: ['Wall'],
            steps: [],
            benefits: ['Calming', 'Focus'],
            when_to_use: 'When needing regulation',
            variations: [],
            age_range: '4-12',
            environment: 'indoor',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Quiet Time with Weighted Blanket',
            description: 'Calming activity with deep pressure',
            context: 'After overstimulation',
            duration_minutes: 10,
            activity_type: 'calming',
            sensory_systems: ['proprioceptive'],
            behavior_fit: 'avoiding',
            difficulty: 'beginner',
            materials_needed: ['Weighted blanket'],
            steps: [],
            benefits: ['Calming', 'Regulation'],
            when_to_use: 'When overwhelmed',
            variations: [],
            age_range: '3-12',
            environment: 'indoor',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        
        console.log('📚 Using fallback activities:', fallbackActivities.length)
        setPersonalizedActivities(fallbackActivities)
      } else {
        console.log('✅ Using database activities:', activities.length)
        
        // Filter activities based on the specific issue
        let filteredActivities = activities
        
        // Apply issue-specific filtering
        if (issue.id === 'restaurant') {
          filteredActivities = activities.filter(activity => 
            activity.activity_type === 'proprioceptive' || 
            activity.activity_type === 'calming' ||
            activity.behavior_fit === 'seeking'
          )
        } else if (issue.id === 'bedtime') {
          filteredActivities = activities.filter(activity => 
            activity.activity_type === 'calming' || 
            activity.activity_type === 'proprioceptive'
          )
        } else if (issue.id === 'transitions') {
          filteredActivities = activities.filter(activity => 
            activity.activity_type === 'proprioceptive' || 
            activity.activity_type === 'heavy-work'
          )
        } else if (issue.id === 'focus') {
          filteredActivities = activities.filter(activity => 
            activity.activity_type === 'heavy-work' || 
            activity.activity_type === 'proprioceptive'
          )
        } else if (issue.id === 'meltdowns') {
          filteredActivities = activities.filter(activity => 
            activity.activity_type === 'calming' || 
            activity.activity_type === 'proprioceptive'
          )
        }
        
        // Score activities based on assessment results
        const scoredActivities = filteredActivities.map(activity => {
          let score = 0
          
          // Score based on behavior fit
          if (behaviorScores.seeking && activity.behavior_fit === 'seeking') {
            score += 3
          }
          if (behaviorScores.avoiding && activity.behavior_fit === 'avoiding') {
            score += 3
          }
          
          // Score based on challenging sensory systems
          const challengingSystems = getChallengingSystems(results)
          if (challengingSystems.some(system => 
            activity.sensory_systems.includes(system)
          )) {
            score += 2
          }
          
          // Score based on difficulty level
          if (activity.difficulty === 'beginner') {
            score += 1
          }
          
          return { ...activity, score }
        })
        
        // Sort by score and take top 3
        const topActivities = scoredActivities
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
        
        console.log('🎯 Top scored activities:', topActivities)
        setPersonalizedActivities(topActivities)
      }
    } catch (error) {
      console.error('❌ Error loading personalized activities:', error)
    } finally {
      setLoadingActivities(false)
    }
  }

  const getDominantBehavior = (behaviorScores: any) => {
    if (!behaviorScores) return 'seeking'
    
    const seeking = behaviorScores.seeking || 0
    const avoiding = behaviorScores.avoiding || 0
    
    return seeking > avoiding ? 'seeking' : 'avoiding'
  }

  const getChallengingSystems = (results: any) => {
    const challengingSystems: string[] = []
    
    if (results.sensoryScores) {
      const scores = results.sensoryScores
      if (scores.proprioceptive > 3) challengingSystems.push('proprioceptive')
      if (scores.vestibular > 3) challengingSystems.push('vestibular')
      if (scores.tactile > 3) challengingSystems.push('tactile')
      if (scores.auditory > 3) challengingSystems.push('auditory')
      if (scores.visual > 3) challengingSystems.push('visual')
    }
    
    return challengingSystems
  }

  const handleStartActivity = (activity: Activity) => {
    // This would open the activity modal
    console.log('🎯 Starting activity:', activity.title)
    // For now, just close the modal
    onClose()
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#F6F6F6',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        background: '#F6F6F6'
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <h2 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#252225',
            margin: 0,
            flex: 1,
            textAlign: selectedIssue ? 'center' : 'left'
          }}>
            {selectedIssue ? selectedIssue.title : 'Behavior Support'}
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#6B7280',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#E5E7EB'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {!selectedIssue ? (
          // Issue selection view
          <div style={{ maxWidth: '100%', margin: '0 auto' }}>
            <p style={{ 
              color: '#6B7280', 
              fontSize: 14, 
              marginBottom: 16,
              lineHeight: 1.4
            }}>
              Select a common issue to get quick activity suggestions:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {behaviorIssues.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => handleIssueSelect(issue)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '16px',
                    border: '1px solid #EEE6E5',
                    borderRadius: 16,
                    background: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#367A87'
                    e.currentTarget.style.background = '#F0F9FF'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#EEE6E5'
                    e.currentTarget.style.background = '#fff'
                  }}
                >
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{issue.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontWeight: 600, 
                      color: '#252225', 
                      marginBottom: 4,
                      fontSize: 16,
                      lineHeight: 1.3
                    }}>
                      {issue.title}
                    </h3>
                    <p style={{ 
                      fontSize: 14, 
                      color: '#6B7280',
                      lineHeight: 1.4,
                      margin: 0
                    }}>
                      {issue.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Issue detail view
          <div style={{ maxWidth: '100%', margin: '0 auto' }}>
            <div style={{
              background: '#fff',
              borderRadius: 24,
              border: '1px solid #EEE6E5',
              padding: '16px',
              marginBottom: 16
            }}>
              <h4 style={{ 
                fontWeight: 600, 
                color: '#252225', 
                marginBottom: 8,
                fontSize: 16
              }}>
                Quick Activities to Try:
              </h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {selectedIssue.activities.map((activity, index) => (
                  <li key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 8,
                    marginBottom: 8,
                    fontSize: 14,
                    color: '#6C6C6C',
                    lineHeight: 1.4
                  }}>
                    <span style={{ color: '#6C6C6C', fontSize: 14, marginTop: 2 }}>•</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{
              background: '#fff',
              borderRadius: 24,
              border: '1px solid #EEE6E5',
              padding: '16px',
              marginBottom: 16
            }}>
              <h4 style={{ 
                fontWeight: 600, 
                color: '#252225', 
                marginBottom: 8,
                fontSize: 16
              }}>
                Pro Tips:
              </h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                <li style={{ fontSize: 14, color: '#6C6C6C', marginBottom: 8, lineHeight: 1.4 }}>• Start with one activity and observe the response</li>
                <li style={{ fontSize: 14, color: '#6C6C6C', marginBottom: 8, lineHeight: 1.4 }}>• Be consistent with the timing and approach</li>
                <li style={{ fontSize: 14, color: '#6C6C6C', marginBottom: 8, lineHeight: 1.4 }}>• Adjust activities based on your child's preferences</li>
                <li style={{ fontSize: 14, color: '#6C6C6C', lineHeight: 1.4 }}>• Consider the environment and available tools</li>
              </ul>
            </div>

            <div style={{ paddingTop: 16 }}>
              <h4 style={{ 
                fontWeight: 600, 
                color: '#252225', 
                marginBottom: 12,
                fontSize: 16
              }}>
                Ready to try an activity?
              </h4>
              {loadingActivities ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>
                  Loading personalized activities...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {personalizedActivities.map((activity) => (
                    <div key={activity.id} style={{ 
                      borderRadius: 24, 
                      background: '#fff', 
                      boxShadow: '0 2px 8px 0 rgba(44, 62, 80, 0.06)', 
                      padding: '16px',
                      border: '1px solid #EEE6E5'
                    }}>
                      <h3 style={{ 
                        color: '#252225', 
                        fontWeight: 600, 
                        fontSize: 18,
                        margin: '0 0 8px 0',
                        lineHeight: 1.3
                      }}>
                        {activity.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <img src="/Icons/target.svg" alt="target" style={{ width: 18, height: 18, marginRight: 8, color: '#3D3A3D' }} />
                        <span style={{ color: '#252225', fontSize: 15, fontWeight: 400 }}>{activity.context}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                        <svg fill="none" stroke="#3D3A3D" viewBox="0 0 24 24" style={{ width: 16, height: 16, marginRight: 4 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span style={{ color: '#252225', fontSize: 15 }}>{activity.duration_minutes} min</span>
                      </div>
                      <button 
                        onClick={() => handleStartActivity(activity)}
                        style={{ 
                          height: 40, 
                          width: '100%', 
                          background: '#fff', 
                          color: '#252225', 
                          fontWeight: 600, 
                          borderRadius: 16, 
                          fontSize: 16, 
                          border: '1px solid #EEE6E5',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#367A87'
                          e.currentTarget.style.background = '#F0F9FF'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#EEE6E5'
                          e.currentTarget.style.background = '#fff'
                        }}
                      >
                        Start activity
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 