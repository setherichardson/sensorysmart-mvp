'use client'

import { useState } from 'react'

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
    activityCards: [
      {
        id: 'restaurant-1',
        title: 'Table Push-Ups',
        description: 'Gentle pressure activities to help your child feel grounded',
        duration: '2-3 minutes',
        materials: ['Table or chair'],
        steps: [
          'Have your child place their hands flat on the table',
          'Ask them to push down gently for 10 seconds',
          'Release and repeat 3-5 times',
          'This provides deep pressure input'
        ],
        category: 'proprioceptive'
      },
      {
        id: 'restaurant-2',
        title: 'Fidget Toy Play',
        description: 'Quiet sensory activities to keep hands busy',
        duration: '5-10 minutes',
        materials: ['Stress ball, fidget spinner, or small toy'],
        steps: [
          'Give your child a small fidget toy',
          'Let them explore it quietly',
          'Encourage gentle manipulation',
          'Use as needed throughout the meal'
        ],
        category: 'tactile'
      },
      {
        id: 'restaurant-3',
        title: 'Deep Breathing',
        description: 'Calming breathing exercise for overstimulation',
        duration: '1-2 minutes',
        materials: ['None'],
        steps: [
          'Have your child take a deep breath in for 4 counts',
          'Hold for 4 counts',
          'Exhale slowly for 4 counts',
          'Repeat 3-5 times'
        ],
        category: 'calming'
      }
    ]
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
    activityCards: [
      {
        id: 'bedtime-1',
        title: 'Gentle Back Massage',
        description: 'Deep pressure massage to promote relaxation',
        duration: '5-10 minutes',
        materials: ['None'],
        steps: [
          'Have your child lie on their stomach',
          'Use firm, slow strokes on their back',
          'Focus on shoulders and back muscles',
          'Use deep pressure but not painful pressure'
        ],
        category: 'proprioceptive'
      },
      {
        id: 'bedtime-2',
        title: 'Weighted Blanket Time',
        description: 'Deep pressure input for calming',
        duration: '10-15 minutes',
        materials: ['Weighted blanket or heavy pillows'],
        steps: [
          'Place weighted blanket over your child',
          'Ensure it covers their body evenly',
          'Let them relax under the pressure',
          'Remove if they become uncomfortable'
        ],
        category: 'proprioceptive'
      },
      {
        id: 'bedtime-3',
        title: 'Calming Hand Squeezes',
        description: 'Gentle pressure activities for hands',
        duration: '3-5 minutes',
        materials: ['None'],
        steps: [
          'Have your child squeeze their hands into fists',
          'Hold for 5 seconds, then release',
          'Repeat 5-10 times',
          'This provides proprioceptive input'
        ],
        category: 'proprioceptive'
      }
    ]
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
    activityCards: [
      {
        id: 'transitions-1',
        title: 'Transition Dance',
        description: 'Fun movement activity to help with transitions',
        duration: '2-3 minutes',
        materials: ['Music (optional)'],
        steps: [
          'Play upbeat music or create rhythm',
          'Have your child dance or move around',
          'Gradually slow down the movement',
          'End with a calming activity'
        ],
        category: 'movement'
      },
      {
        id: 'transitions-2',
        title: 'Heavy Work Break',
        description: 'Proprioceptive input to help with transitions',
        duration: '3-5 minutes',
        materials: ['None'],
        steps: [
          'Have your child do wall push-ups',
          'Or carry heavy books/items',
          'Jump in place 10 times',
          'Then transition to the next activity'
        ],
        category: 'proprioceptive'
      },
      {
        id: 'transitions-3',
        title: 'Transition Object',
        description: 'Using a comfort item during transitions',
        duration: 'As needed',
        materials: ['Small toy or comfort item'],
        steps: [
          'Give your child a small comfort item',
          'Let them hold it during the transition',
          'Use it as a bridge between activities',
          'Return it when settled in new activity'
        ],
        category: 'calming'
      }
    ]
  },
  {
    id: 'focus',
    title: 'Trouble focusing',
    description: 'Your child has difficulty paying attention or staying on task',
    activities: [
      'Fidget tools and sensory toys',
      'Movement breaks every 15-20 minutes',
      'Chewing gum or crunchy snacks',
      'Seat cushions or stability balls'
    ],
    icon: '🎯',
    activityCards: [
      {
        id: 'focus-1',
        title: 'Movement Break',
        description: 'Quick movement to help refocus',
        duration: '2-3 minutes',
        materials: ['None'],
        steps: [
          'Have your child stand up and stretch',
          'Do 10 jumping jacks',
          'March in place for 30 seconds',
          'Return to task with renewed focus'
        ],
        category: 'movement'
      },
      {
        id: 'focus-2',
        title: 'Fidget Tool Time',
        description: 'Sensory tools to help maintain focus',
        duration: 'As needed',
        materials: ['Fidget spinner, stress ball, or putty'],
        steps: [
          'Give your child a fidget tool',
          'Let them use it while working',
          'Monitor that it helps, not distracts',
          'Use as needed throughout tasks'
        ],
        category: 'tactile'
      },
      {
        id: 'focus-3',
        title: 'Chair Push-Ups',
        description: 'Seated proprioceptive activity',
        duration: '1-2 minutes',
        materials: ['Chair'],
        steps: [
          'Have your child place hands on chair seat',
          'Lift their bottom off the chair',
          'Hold for 5 seconds, then sit back down',
          'Repeat 5-10 times'
        ],
        category: 'proprioceptive'
      }
    ]
  },
  {
    id: 'anxiety',
    title: 'Anxiety or nervousness',
    description: 'Your child is feeling worried or overwhelmed',
    activities: [
      'Deep breathing exercises',
      'Progressive muscle relaxation',
      'Calming sensory activities',
      'Heavy work and proprioceptive input'
    ],
    icon: '😰',
    activityCards: [
      {
        id: 'anxiety-1',
        title: 'Box Breathing',
        description: 'Calming breathing technique',
        duration: '2-3 minutes',
        materials: ['None'],
        steps: [
          'Breathe in for 4 counts',
          'Hold for 4 counts',
          'Breathe out for 4 counts',
          'Hold for 4 counts, then repeat'
        ],
        category: 'calming'
      },
      {
        id: 'anxiety-2',
        title: 'Progressive Muscle Relaxation',
        description: 'Tensing and relaxing muscles for calm',
        duration: '5-10 minutes',
        materials: ['None'],
        steps: [
          'Start with toes, tense for 5 seconds',
          'Release and feel the relaxation',
          'Move up through each muscle group',
          'End with full body relaxation'
        ],
        category: 'calming'
      },
      {
        id: 'anxiety-3',
        title: 'Heavy Work Activities',
        description: 'Proprioceptive input for calming',
        duration: '5-10 minutes',
        materials: ['None'],
        steps: [
          'Have your child push against a wall',
          'Or carry heavy books/items',
          'Do jumping jacks or wall push-ups',
          'This provides grounding input'
        ],
        category: 'proprioceptive'
      }
    ]
  },
  {
    id: 'meltdowns',
    title: 'Meltdowns or tantrums',
    description: 'Your child is having emotional outbursts',
    activities: [
      'Quiet space with sensory tools',
      'Deep pressure activities',
      'Calming music or white noise',
      'Structured routine and predictability'
    ],
    icon: '😤',
    activityCards: [
      {
        id: 'meltdowns-1',
        title: 'Calm Down Corner',
        description: 'Quiet space with sensory tools',
        duration: '5-15 minutes',
        materials: ['Soft pillows, blankets, sensory toys'],
        steps: [
          'Create a quiet, comfortable space',
          'Include soft pillows and blankets',
          'Add calming sensory toys',
          'Let your child use it when needed'
        ],
        category: 'calming'
      },
      {
        id: 'meltdowns-2',
        title: 'Deep Pressure Hug',
        description: 'Gentle but firm pressure for calming',
        duration: '1-2 minutes',
        materials: ['None'],
        steps: [
          'Give your child a firm but gentle hug',
          'Apply steady pressure to their back',
          'Hold for 30-60 seconds',
          'Release slowly and check their response'
        ],
        category: 'proprioceptive'
      },
      {
        id: 'meltdowns-3',
        title: 'Calming Sensory Tools',
        description: 'Using sensory tools for regulation',
        duration: 'As needed',
        materials: ['Stress ball, putty, or soft toy'],
        steps: [
          'Offer a soft sensory toy',
          'Let them squeeze or manipulate it',
          'Encourage slow, gentle movements',
          'Use until they feel calmer'
        ],
        category: 'tactile'
      }
    ]
  }
]

export default function BehaviorHelpModal({ isOpen, onClose }: BehaviorHelpModalProps) {
  const [selectedIssue, setSelectedIssue] = useState<BehaviorIssue | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<ActivityCard | null>(null)

  if (!isOpen) return null

  const handleIssueSelect = (issue: BehaviorIssue) => {
    setSelectedIssue(issue)
    setSelectedActivity(null)
  }

  const handleBack = () => {
    if (selectedActivity) {
      setSelectedActivity(null)
    } else {
      setSelectedIssue(null)
    }
  }

  const handleActivitySelect = (activity: ActivityCard) => {
    setSelectedActivity(activity)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedActivity ? selectedActivity.title : 
               selectedIssue ? selectedIssue.title : 
               'Help with a behavior'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {(selectedIssue || selectedActivity) && (
            <button
              onClick={handleBack}
              className="flex items-center text-blue-600 hover:text-blue-700 mt-2 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {selectedActivity ? `Back to ${selectedIssue?.title}` : 'Back to all issues'}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!selectedIssue ? (
            // Issue selection view
            <div className="space-y-4">
              <p className="text-gray-600 text-sm mb-4">
                Select a common issue to get quick activity suggestions:
              </p>
              <div className="grid gap-3">
                {behaviorIssues.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => handleIssueSelect(issue)}
                    className="text-left p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{issue.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{issue.title}</h3>
                        <p className="text-sm text-gray-600">{issue.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : selectedActivity ? (
            // Activity detail view
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedActivity.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{selectedActivity.description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-600">⏱️ {selectedActivity.duration}</span>
                  <span className="text-gray-600">📋 {selectedActivity.category}</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Materials Needed:</h4>
                <ul className="space-y-1">
                  {selectedActivity.materials.map((material, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 text-sm mt-1">•</span>
                      <span className="text-sm text-blue-800">{material}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 rounded-xl p-4 mb-4">
                <h4 className="font-medium text-green-900 mb-2">Steps:</h4>
                <ol className="space-y-2">
                  {selectedActivity.steps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 text-sm font-medium mt-1">{index + 1}.</span>
                      <span className="text-sm text-green-800">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <button
                onClick={() => {
                  // Here you could integrate with the activity system
                  console.log('Starting activity:', selectedActivity.title)
                }}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Start This Activity
              </button>
            </div>
          ) : (
            // Issue detail view with activity cards
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">{selectedIssue.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedIssue.title}</h3>
                  <p className="text-sm text-gray-600">{selectedIssue.description}</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Quick Activities to Try:</h4>
                <ul className="space-y-2">
                  {selectedIssue.activities.map((activity, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 text-sm mt-1">•</span>
                      <span className="text-sm text-blue-800">{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Pro Tips:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Start with one activity and observe the response</li>
                  <li>• Be consistent with the timing and approach</li>
                  <li>• Adjust activities based on your child's preferences</li>
                  <li>• Consider the environment and available tools</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Ready to try an activity?</h4>
                <div className="grid gap-3">
                  {selectedIssue.activityCards.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => handleActivitySelect(activity)}
                      className="text-left p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{activity.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span>⏱️ {activity.duration}</span>
                            <span>📋 {activity.category}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            {selectedIssue ? 'Got it, thanks!' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
} 