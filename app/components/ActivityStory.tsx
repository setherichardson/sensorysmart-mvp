'use client'
import { useState, useEffect } from 'react'

interface ActivityStep {
  id: number
  instruction: string
}

interface ActivityStoryProps {
  activityTitle: string
  steps: ActivityStep[]
  isOpen: boolean
  onClose: () => void
  onComplete?: (durationMinutes?: number) => void
}

export default function ActivityStory({ activityTitle, steps, isOpen, onClose, onComplete }: ActivityStoryProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)

  // Reset to first step when story opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setStartTime(new Date())
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Activity completed
      const durationMinutes = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 60000) : undefined
      onComplete?.(durationMinutes)
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      handleNext()
    } else {
      handlePrevious()
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevious()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentStep, steps.length])

  console.log('ActivityStory render:', { isOpen, activityTitle, steps: steps.length, currentStep })
  
  if (!isOpen) {
    console.log('ActivityStory not rendering - isOpen is false')
    return null
  }

  return (
    <div className="activity-story-overlay">
      <div className="activity-story-container">
        {/* Header */}
        <div className="activity-story-header">
          <button onClick={onClose} className="activity-story-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="activity-story-title">{activityTitle}</h2>
          <div className="activity-story-progress">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`activity-story-dot ${index === currentStep ? 'active' : ''} ${
                  index < currentStep ? 'completed' : ''
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div 
          className="activity-story-content"
          onClick={() => handleNext()}
        >
          <div className="activity-story-step">
            <div className="activity-story-instruction">
              {steps[currentStep].instruction}
            </div>
            <div className="activity-story-counter">
              {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>

        {/* Navigation hints */}
        <div className="activity-story-hints">
          <div className="activity-story-hint">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </div>
          <div className="activity-story-hint">
            <span>Next</span>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
} 