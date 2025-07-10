'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Activity, ActivityStep } from '@/lib/supabase/client'

interface ActivityStoryProps {
  activityId: string
  onComplete: () => void
  onClose: () => void
}

interface ActivityStepWithProgress extends ActivityStep {
  completed: boolean
}

export default function ActivityStory({ activityId, onComplete, onClose }: ActivityStoryProps) {
  const [activity, setActivity] = useState<Activity | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<ActivityStepWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [timer, setTimer] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    loadActivity()
  }, [activityId])

  useEffect(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      const step = steps[currentStep]
      if (step.duration_seconds) {
        setTimer(step.duration_seconds)
        setIsPaused(false)
      }
    }
  }, [currentStep, steps])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (timer !== null && timer > 0 && !isPaused) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev === null || prev <= 1) {
            // Step completed, move to next
            setTimeout(() => {
              if (currentStep < steps.length - 1) {
                setCurrentStep(prev => prev + 1)
              } else {
                // All steps completed
                onComplete()
              }
            }, 1000)
            return null
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer, isPaused, currentStep, steps.length, onComplete])

  const loadActivity = async () => {
    try {
      setLoading(true)
      
      // Get activity details
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single()

      if (activityError) {
        console.error('Error loading activity:', activityError)
        return
      }

      setActivity(activityData)

      // Get activity steps
      const { data: stepsData, error: stepsError } = await supabase
        .from('activity_steps')
        .select('*')
        .eq('activity_id', activityId)
        .order('step_number')

      if (stepsError) {
        console.error('Error loading steps:', stepsError)
        return
      }

      // Convert steps to include progress tracking
      const stepsWithProgress = stepsData.map(step => ({
        ...step,
        completed: false
      }))

      setSteps(stepsWithProgress)
    } catch (error) {
      console.error('Error loading activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStepComplete = () => {
    if (currentStep < steps.length) {
      // Mark current step as completed
      setSteps(prev => prev.map((step, index) => 
        index === currentStep ? { ...step, completed: true } : step
      ))
      
      // Move to next step
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        // All steps completed
        onComplete()
      }
    }
  }

  const handlePauseResume = () => {
    setIsPaused(prev => !prev)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-center text-gray-600">Loading activity...</p>
        </div>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <p className="text-center text-red-600">Activity not found</p>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{activity.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step */}
        {currentStepData && (
          <div className="mb-6">
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Step {currentStepData.step_number}: {currentStepData.title}
              </h3>
              <p className="text-blue-800 mb-4">{currentStepData.description}</p>
              
              {/* Timer */}
              {currentStepData.duration_seconds && timer !== null && (
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatTime(timer)}
                  </div>
                  <button
                    onClick={handlePauseResume}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                </div>
              )}
            </div>

            {/* Step Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Previous
              </button>
              
              <button
                onClick={handleStepComplete}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {currentStep === steps.length - 1 ? 'Complete Activity' : 'Next Step'}
              </button>
            </div>
          </div>
        )}

        {/* Activity Info */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Duration:</span> {activity.duration_minutes} minutes
            </div>
            <div>
              <span className="font-semibold">Difficulty:</span> {activity.difficulty}
            </div>
            <div>
              <span className="font-semibold">Type:</span> {activity.activity_type}
            </div>
            <div>
              <span className="font-semibold">Systems:</span> {activity.sensory_systems.join(', ')}
            </div>
          </div>
          
          <div className="mt-4">
            <span className="font-semibold">Benefits:</span>
            <ul className="list-disc list-inside mt-1 text-sm text-gray-600">
              {activity.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 