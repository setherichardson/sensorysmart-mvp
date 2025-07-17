'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Activity, ActivityStep } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ActivityStoryProps {
  activityId: string
  onComplete: (rating?: string) => void
  onClose: () => void
  activityData?: Activity // Pass activity data from parent
  childName?: string // Add childName prop
}

interface ActivityStepWithProgress {
  id: number
  step_number: number
  title: string
  description: string
  duration_seconds: number | null
  completed: boolean
}

// Hardcoded activity steps for fallback
const getHardcodedSteps = (activityId: string): ActivityStepWithProgress[] => {
  switch (activityId) {
    case 'wall-pushups':
      return [
        { id: 1, step_number: 1, title: 'Position', description: 'Stand facing a wall', duration_seconds: null, completed: false },
        { id: 2, step_number: 2, title: 'Place Hands', description: 'Place your hands on the wall at shoulder height', duration_seconds: null, completed: false },
        { id: 3, step_number: 3, title: 'Step Back', description: 'Step back so your arms are straight', duration_seconds: null, completed: false },
        { id: 4, step_number: 4, title: 'Push', description: 'Bend your elbows and lean toward the wall', duration_seconds: 30, completed: false },
        { id: 5, step_number: 5, title: 'Return', description: 'Push back to the starting position', duration_seconds: null, completed: false },
        { id: 6, step_number: 6, title: 'Repeat', description: 'Repeat 5 times', duration_seconds: null, completed: false }
      ]
    case 'bear-hugs':
      return [
        { id: 1, step_number: 1, title: 'Position', description: 'Stand or sit comfortably', duration_seconds: null, completed: false },
        { id: 2, step_number: 2, title: 'Wrap Arms', description: 'Wrap arms around yourself', duration_seconds: null, completed: false },
        { id: 3, step_number: 3, title: 'Apply Pressure', description: 'Apply firm, even pressure', duration_seconds: 10, completed: false },
        { id: 4, step_number: 4, title: 'Hold', description: 'Hold for 10 seconds', duration_seconds: 10, completed: false },
        { id: 5, step_number: 5, title: 'Release', description: 'Release slowly', duration_seconds: null, completed: false },
        { id: 6, step_number: 6, title: 'Repeat', description: 'Repeat 3 times', duration_seconds: null, completed: false }
      ]
    case 'chair-pushups':
      return [
        { id: 1, step_number: 1, title: 'Sit', description: 'Sit in a chair with armrests', duration_seconds: null, completed: false },
        { id: 2, step_number: 2, title: 'Place Hands', description: 'Place hands on armrests', duration_seconds: null, completed: false },
        { id: 3, step_number: 3, title: 'Lift', description: 'Lift your body slightly off the chair', duration_seconds: 3, completed: false },
        { id: 4, step_number: 4, title: 'Hold', description: 'Hold for 3 seconds', duration_seconds: 3, completed: false },
        { id: 5, step_number: 5, title: 'Lower', description: 'Lower back down slowly', duration_seconds: null, completed: false },
        { id: 6, step_number: 6, title: 'Repeat', description: 'Repeat 5 times', duration_seconds: null, completed: false }
      ]
    case 'slow-spinning':
      return [
        { id: 1, step_number: 1, title: 'Position', description: 'Stand in an open space', duration_seconds: null, completed: false },
        { id: 2, step_number: 2, title: 'Extend Arms', description: 'Extend arms out to sides', duration_seconds: null, completed: false },
        { id: 3, step_number: 3, title: 'Spin', description: 'Turn slowly in one direction', duration_seconds: 30, completed: false },
        { id: 4, step_number: 4, title: 'Complete Rotations', description: 'Complete 3 full rotations', duration_seconds: null, completed: false },
        { id: 5, step_number: 5, title: 'Wait', description: 'Stop and wait 10 seconds', duration_seconds: 10, completed: false },
        { id: 6, step_number: 6, title: 'Reverse', description: 'Repeat in opposite direction', duration_seconds: null, completed: false }
      ]
    case 'resistance-band-pull':
      return [
        { id: 1, step_number: 1, title: 'Hold Band', description: 'Hold the resistance band with both hands', duration_seconds: null, completed: false },
        { id: 2, step_number: 2, title: 'Extend Arms', description: 'Extend your arms straight out', duration_seconds: null, completed: false },
        { id: 3, step_number: 3, title: 'Pull Apart', description: 'Pull the band apart slowly', duration_seconds: 20, completed: false },
        { id: 4, step_number: 4, title: 'Hold', description: 'Hold the stretch for 5 seconds', duration_seconds: 5, completed: false },
        { id: 5, step_number: 5, title: 'Release', description: 'Slowly release the tension', duration_seconds: null, completed: false },
        { id: 6, step_number: 6, title: 'Repeat', description: 'Repeat 8 times', duration_seconds: null, completed: false }
      ]
    case 'weighted-lap-pad':
      return [
        { id: 1, step_number: 1, title: 'Sit Comfortably', description: 'Sit in a comfortable chair', duration_seconds: null, completed: false },
        { id: 2, step_number: 2, title: 'Place Pad', description: 'Place the weighted pad on your lap', duration_seconds: null, completed: false },
        { id: 3, step_number: 3, title: 'Adjust', description: 'Adjust the pad so it feels comfortable', duration_seconds: null, completed: false },
        { id: 4, step_number: 4, title: 'Relax', description: 'Sit quietly and feel the gentle pressure', duration_seconds: 300, completed: false },
        { id: 5, step_number: 5, title: 'Breathe', description: 'Take slow, deep breaths', duration_seconds: null, completed: false },
        { id: 6, step_number: 6, title: 'Complete', description: 'Remove the pad when ready', duration_seconds: null, completed: false }
      ]
    case 'rocking-chair':
      return [
        { id: 1, step_number: 1, title: 'Sit', description: 'Sit in a rocking chair', duration_seconds: null, completed: false },
        { id: 2, step_number: 2, title: 'Get Comfortable', description: 'Find a comfortable position', duration_seconds: null, completed: false },
        { id: 3, step_number: 3, title: 'Start Rocking', description: 'Begin gentle rocking motion', duration_seconds: null, completed: false },
        { id: 4, step_number: 4, title: 'Rock Slowly', description: 'Rock slowly and rhythmically', duration_seconds: 180, completed: false },
        { id: 5, step_number: 5, title: 'Breathe', description: 'Focus on your breathing', duration_seconds: null, completed: false },
        { id: 6, step_number: 6, title: 'Stop', description: 'Gradually stop rocking', duration_seconds: null, completed: false }
      ]
    case 'texture-exploration':
      return [
        { id: 1, step_number: 1, title: 'Gather Materials', description: 'Collect different textured items', duration_seconds: null, completed: false },
        { id: 2, step_number: 2, title: 'Touch First', description: 'Touch the first texture with your fingertips', duration_seconds: 10, completed: false },
        { id: 3, step_number: 3, title: 'Describe', description: 'Describe how it feels', duration_seconds: null, completed: false },
        { id: 4, step_number: 4, title: 'Explore More', description: 'Try different textures', duration_seconds: 120, completed: false },
        { id: 5, step_number: 5, title: 'Compare', description: 'Compare how different textures feel', duration_seconds: null, completed: false },
        { id: 6, step_number: 6, title: 'Clean Up', description: 'Put materials away', duration_seconds: null, completed: false }
      ]
    case 'finger-painting':
      return [
        { id: 1, step_number: 1, title: 'Set Up', description: 'Cover the table with paper', duration_seconds: null, completed: false },
        { id: 2, step_number: 2, title: 'Get Paint', description: 'Pour paint onto the paper', duration_seconds: null, completed: false },
        { id: 3, step_number: 3, title: 'Touch Paint', description: 'Touch the paint with your fingers', duration_seconds: 10, completed: false },
        { id: 4, step_number: 4, title: 'Paint', description: 'Create pictures with your fingers', duration_seconds: 300, completed: false },
        { id: 5, step_number: 5, title: 'Explore', description: 'Try different colors and movements', duration_seconds: null, completed: false },
        { id: 6, step_number: 6, title: 'Clean Up', description: 'Wash hands and clean up', duration_seconds: null, completed: false }
      ]
    case 'quiet-time':
      return [
        { id: 1, step_number: 1, title: 'Find Space', description: 'Find a quiet, comfortable space', duration_seconds: null, completed: false },
        { id: 2, step_number: 2, title: 'Sit Comfortably', description: 'Sit or lie down comfortably', duration_seconds: null, completed: false },
        { id: 3, step_number: 3, title: 'Close Eyes', description: 'Close your eyes gently', duration_seconds: null, completed: false },
        { id: 4, step_number: 4, title: 'Listen', description: 'Listen to the quiet sounds around you', duration_seconds: 180, completed: false },
        { id: 5, step_number: 5, title: 'Breathe', description: 'Take slow, deep breaths', duration_seconds: null, completed: false },
        { id: 6, step_number: 6, title: 'Open Eyes', description: 'Open your eyes slowly', duration_seconds: null, completed: false }
      ]
    case 'rhythm-clapping':
      return [
        { id: 1, step_number: 1, title: 'Get Ready', description: 'Sit comfortably with hands ready', duration_seconds: null, completed: false },
        { id: 2, step_number: 2, title: 'Start Simple', description: 'Clap a simple rhythm', duration_seconds: 30, completed: false },
        { id: 3, step_number: 3, title: 'Follow Pattern', description: 'Follow a pattern: clap-clap-pause', duration_seconds: 60, completed: false },
        { id: 4, step_number: 4, title: 'Try Different', description: 'Try different rhythm patterns', duration_seconds: 90, completed: false },
        { id: 5, step_number: 5, title: 'Get Creative', description: 'Create your own rhythm', duration_seconds: null, completed: false },
        { id: 6, step_number: 6, title: 'Finish', description: 'End with a big clap', duration_seconds: null, completed: false }
      ]
    case 'visual-tracking':
      return [
        { id: 1, step_number: 1, title: 'Find Object', description: 'Find a small object to track', duration_seconds: null, completed: false },
        { id: 2, step_number: 2, title: 'Hold Object', description: 'Hold the object at arm\'s length', duration_seconds: null, completed: false },
        { id: 3, step_number: 3, title: 'Move Slowly', description: 'Move the object slowly left and right', duration_seconds: 60, completed: false },
        { id: 4, step_number: 4, title: 'Up and Down', description: 'Move the object up and down', duration_seconds: 60, completed: false },
        { id: 5, step_number: 5, title: 'Circles', description: 'Move the object in circles', duration_seconds: 60, completed: false },
        { id: 6, step_number: 6, title: 'Complete', description: 'Put the object away', duration_seconds: null, completed: false }
      ]
    case 'dim-lighting':
      return [
        { id: 1, step_number: 1, title: 'Find Space', description: 'Find a room where you can dim the lights', duration_seconds: null, completed: false },
        { id: 2, step_number: 2, title: 'Dim Lights', description: 'Turn down the lights or close curtains', duration_seconds: null, completed: false },
        { id: 3, step_number: 3, title: 'Sit Comfortably', description: 'Sit or lie down comfortably', duration_seconds: null, completed: false },
        { id: 4, step_number: 4, title: 'Relax', description: 'Relax in the dim lighting', duration_seconds: 300, completed: false },
        { id: 5, step_number: 5, title: 'Breathe', description: 'Take slow, deep breaths', duration_seconds: null, completed: false },
        { id: 6, step_number: 6, title: 'Gradually Brighten', description: 'Slowly turn lights back up', duration_seconds: null, completed: false }
      ]
    case 'body-scan':
      return [
        { id: 1, step_number: 1, title: 'Lie Down', description: 'Lie down comfortably on your back', duration_seconds: null, completed: false },
        { id: 2, step_number: 2, title: 'Close Eyes', description: 'Close your eyes gently', duration_seconds: null, completed: false },
        { id: 3, step_number: 3, title: 'Focus on Toes', description: 'Focus your attention on your toes', duration_seconds: 30, completed: false },
        { id: 4, step_number: 4, title: 'Scan Up', description: 'Slowly scan up your body', duration_seconds: 120, completed: false },
        { id: 5, step_number: 5, title: 'Notice Sensations', description: 'Notice any sensations in each part', duration_seconds: null, completed: false },
        { id: 6, step_number: 6, title: 'Complete', description: 'Open your eyes slowly', duration_seconds: null, completed: false }
      ]
    case 'hunger-thirst-check':
      return [
        { id: 1, step_number: 1, title: 'Pause', description: 'Take a moment to pause', duration_seconds: null, completed: false },
        { id: 2, step_number: 2, title: 'Check Stomach', description: 'Notice how your stomach feels', duration_seconds: 10, completed: false },
        { id: 3, step_number: 3, title: 'Check Throat', description: 'Notice how your throat feels', duration_seconds: 10, completed: false },
        { id: 4, step_number: 4, title: 'Ask Yourself', description: 'Ask: Am I hungry or thirsty?', duration_seconds: 30, completed: false },
        { id: 5, step_number: 5, title: 'Decide', description: 'Decide if you need food or water', duration_seconds: null, completed: false },
        { id: 6, step_number: 6, title: 'Act', description: 'Get what you need', duration_seconds: null, completed: false }
      ]
    default:
      return [
        { id: 1, step_number: 1, title: 'Get Ready', description: 'Find a comfortable position', duration_seconds: null, completed: false },
        { id: 2, step_number: 2, title: 'Begin', description: 'Start the activity', duration_seconds: 30, completed: false },
        { id: 3, step_number: 3, title: 'Complete', description: 'Finish the activity', duration_seconds: null, completed: false }
      ]
  }
}

export default function ActivityStory({ activityId, onComplete, onClose, activityData, childName }: ActivityStoryProps) {
  const [activity, setActivity] = useState<Activity | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<ActivityStepWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [timer, setTimer] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  // Add a new state for the rating
  const [showRating, setShowRating] = useState(false)
  const [selectedRating, setSelectedRating] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const router = useRouter();

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
            // Step completed, but don't auto-advance to rating
            // Just stop the timer and wait for user to manually advance
            return null
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer, isPaused, currentStep, steps.length])

  const loadActivity = async () => {
    try {
      setLoading(true)
      
      // If activityData is provided, use it directly
      if (activityData) {
        console.log('Using provided activity data:', activityData)
        setActivity(activityData)
        
        // Check if this activity has embedded steps (like behavior activities)
        if (activityData.steps && Array.isArray(activityData.steps) && activityData.steps.length > 0) {
          console.log('Using embedded steps from provided activity data:', activityData.steps)
          const embeddedSteps: ActivityStepWithProgress[] = activityData.steps.map((step: any, index: number) => ({
            id: index + 1,
            step_number: step.step_number || index + 1,
            title: step.title,
            description: step.description,
            duration_seconds: step.duration_seconds,
            completed: false
          }))
          console.log('Converted embedded steps:', embeddedSteps)
          setSteps(embeddedSteps)
        } else {
          // Fallback to hardcoded steps if no embedded steps
          console.log('No embedded steps found, using hardcoded steps')
          const hardcodedSteps = getHardcodedSteps(activityId)
          setSteps(hardcodedSteps)
        }
        setLoading(false)
        return
      }
      
      // Try to get activity details from database
      const { data: dbActivityData, error: activityError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single()

      if (activityError) {
        console.log('Activity not found in database, using hardcoded data')
        // Use hardcoded activity data
        const hardcodedActivity: Activity = {
          id: activityId,
          title: getActivityTitle(activityId),
          description: getActivityDescription(activityId),
          context: getActivityContext(activityId),
          duration_minutes: 5,
          difficulty: 'beginner',
          activity_type: 'proprioceptive',
          sensory_systems: ['proprioceptive'],
          behavior_fit: 'seeking',
          benefits: ['Provides sensory input', 'Helps with regulation'],
          when_to_use: 'When seeking sensory input',
          materials_needed: [],
          steps: [],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setActivity(hardcodedActivity)
        
        // Use hardcoded steps
        const hardcodedSteps = getHardcodedSteps(activityId)
        setSteps(hardcodedSteps)
        setLoading(false)
        return
      }

      setActivity(dbActivityData)

      // Check if this activity has embedded steps (like behavior activities)
      if (dbActivityData.steps && Array.isArray(dbActivityData.steps) && dbActivityData.steps.length > 0) {
        console.log('Using embedded steps from activity data')
        const embeddedSteps: ActivityStepWithProgress[] = dbActivityData.steps.map((step: any, index: number) => ({
          id: index + 1,
          step_number: step.step_number || index + 1,
          title: step.title,
          description: step.description,
          duration_seconds: step.duration_seconds,
          completed: false
        }))
        setSteps(embeddedSteps)
      } else {
        // Get activity steps from database
        const { data: stepsData, error: stepsError } = await supabase
          .from('activity_steps')
          .select('*')
          .eq('activity_id', activityId)
          .order('step_number')

        if (stepsError) {
          console.log('Steps not found in database, using hardcoded steps')
          // Use hardcoded steps
          const hardcodedSteps = getHardcodedSteps(activityId)
          setSteps(hardcodedSteps)
        } else {
          // Convert steps to include progress tracking
          const stepsWithProgress = stepsData.map(step => ({
            ...step,
            completed: false
          }))
          setSteps(stepsWithProgress)
        }
      }
    } catch (error) {
      console.log('Activity not found in database, using hardcoded data')
      // Fallback to hardcoded data
      const hardcodedActivity: Activity = {
        id: activityId,
        title: getActivityTitle(activityId),
        description: getActivityDescription(activityId),
        context: getActivityContext(activityId),
        duration_minutes: 5,
        difficulty: 'beginner',
        activity_type: 'proprioceptive',
        sensory_systems: ['proprioceptive'],
        behavior_fit: 'seeking',
        benefits: ['Provides sensory input', 'Helps with regulation'],
        when_to_use: 'When seeking sensory input',
        materials_needed: [],
        steps: [],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setActivity(hardcodedActivity)
      const hardcodedSteps = getHardcodedSteps(activityId)
      setSteps(hardcodedSteps)
    } finally {
      setLoading(false)
    }
  }

  // Helper functions for hardcoded activity data
  const getActivityTitle = (id: string): string => {
    const titles: { [key: string]: string } = {
      'wall-pushups': 'Wall Push-ups',
      'bear-hugs': 'Bear Hugs',
      'chair-pushups': 'Chair Push-ups',
      'slow-spinning': 'Slow Spinning',
      'resistance-band-pull': 'Resistance Band Pull',
      'weighted-lap-pad': 'Weighted Lap Pad',
      'rocking-chair': 'Rocking Chair',
      'texture-exploration': 'Texture Exploration',
      'finger-painting': 'Finger Painting',
      'quiet-time': 'Quiet Time',
      'rhythm-clapping': 'Rhythm Clapping',
      'visual-tracking': 'Visual Tracking',
      'dim-lighting': 'Dim Lighting Time',
      'body-scan': 'Body Scan',
      'hunger-thirst-check': 'Hunger & Thirst Check'
    }
    return titles[id] || 'Activity'
  }

  const getActivityContext = (id: string): string => {
    const contexts: { [key: string]: string } = {
      'wall-pushups': 'Great for morning regulation',
      'bear-hugs': 'Great for transitions',
      'chair-pushups': 'Good for focus during seated work',
      'slow-spinning': 'Good for vestibular seeking',
      'resistance-band-pull': 'Perfect before lunch to help focus',
      'weighted-lap-pad': 'Ideal for afternoon energy',
      'rocking-chair': 'Calming vestibular input',
      'texture-exploration': 'Good for tactile integration',
      'finger-painting': 'Messy play for tactile seekers',
      'quiet-time': 'For auditory sensitivity',
      'rhythm-clapping': 'Good for auditory seekers',
      'visual-tracking': 'For visual processing',
      'dim-lighting': 'For visual sensitivity',
      'body-scan': 'For interoception awareness',
      'hunger-thirst-check': 'For interoception awareness'
    }
    return contexts[id] || 'Good for regulation'
  }

  const getActivityDuration = (id: string): string => {
    const durations: { [key: string]: string } = {
      'wall-pushups': '2-3 minutes',
      'bear-hugs': '1-2 minutes',
      'chair-pushups': '1-2 minutes',
      'slow-spinning': '2-3 minutes',
      'resistance-band-pull': '3-5 minutes',
      'weighted-lap-pad': '10-15 minutes',
      'rocking-chair': '5-10 minutes',
      'texture-exploration': '5-10 minutes',
      'finger-painting': '10-15 minutes',
      'quiet-time': '5-10 minutes',
      'rhythm-clapping': '3-5 minutes',
      'visual-tracking': '3-5 minutes',
      'dim-lighting': '5-10 minutes',
      'body-scan': '3-5 minutes',
      'hunger-thirst-check': '1-2 minutes'
    }
    return durations[id] || '5 minutes'
  }

  const getActivityDescription = (id: string): string => {
    const descriptions: { [key: string]: string } = {
      'wall-pushups': 'Deep pressure input through pushing against a wall',
      'bear-hugs': 'Firm, deep pressure hugs',
      'chair-pushups': 'Lifting body from chair using arm strength',
      'slow-spinning': 'Gentle spinning in a chair or standing',
      'resistance-band-pull': 'Pulling resistance band for muscle input',
      'weighted-lap-pad': 'Gentle pressure from weighted pad on lap',
      'rocking-chair': 'Gentle rocking motion',
      'texture-exploration': 'Exploring different textures with hands',
      'finger-painting': 'Painting with fingers for tactile input',
      'quiet-time': 'Time in a quiet space with noise reduction',
      'rhythm-clapping': 'Clapping to rhythms and patterns',
      'visual-tracking': 'Following objects with eyes',
      'dim-lighting': 'Time in reduced lighting',
      'body-scan': 'Mindful awareness of body sensations',
      'hunger-thirst-check': 'Checking internal body signals'
    }
    return descriptions[id] || 'A sensory activity to help with regulation'
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

  // Instead of showRating state, treat the rating screen as the last step in the stepper

  // Update handleNextStep to advance to the rating screen as the last step
  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Back button logic for rating screen
  const handleBackFromRating = () => {
    setCurrentStep(currentStep - 1)
  }

  // Handle rating selection and completion
  const handleRating = async (rating: string) => {
    setSelectedRating(rating)
    setSaving(true)
    try {
      // Save completion with rating
      if (onComplete) {
        await onComplete(rating)
      }
      setSaving(false)
      // Close the modal and stay on the current page
      onClose()
    } catch (err) {
      setSaving(false)
      console.log('Error saving activity completion, but continuing')
      // Still close the modal even if there's an error
      onClose()
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{
        width: '100vw', height: '100vh',
        background: 'radial-gradient(ellipse at 80% 10%, #E0FFFF 40%, #F6F6F6 100%), radial-gradient(ellipse at 20% 90%, #B2F7EF 40%, #F6F6F6 100%), linear-gradient(to bottom, #F6F6F6 0%, #F6F6F6 100%)',
      }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-center text-gray-600">Loading activity...</p>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{
        width: '100vw', height: '100vh',
        background: 'radial-gradient(ellipse at 80% 10%, #E0FFFF 40%, #F6F6F6 100%), radial-gradient(ellipse at 20% 90%, #B2F7EF 40%, #F6F6F6 100%), linear-gradient(to bottom, #F6F6F6 0%, #F6F6F6 100%)',
      }}>
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

  // Render logic
  // If currentStep === steps.length, show the rating screen as the final step
  // Remove showRating and currentStep === steps.length logic

  // In the render, on the last step, show the rating buttons instead of the Next/Complete button
  const isLastStep = currentStep === steps.length - 1

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  // On the last step, show only the label, rating buttons, and Previous button at the bottom left
  if (isLastStep) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{
        width: '100vw', height: '100vh',
        background: 'radial-gradient(ellipse at 80% 10%, #E0FFFF 40%, #F6F6F6 100%), radial-gradient(ellipse at 20% 90%, #B2F7EF 40%, #F6F6F6 100%), linear-gradient(to bottom, #F6F6F6 0%, #F6F6F6 100%)',
      }}>
        {/* Top bar: Child name, close button, duration */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 24px 0 24px', width: '100%', maxWidth: 480, margin: '0 auto' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{activity.title}</div>
            <div style={{ fontSize: 12, color: '#6C6C6C', marginTop: 4, display: 'flex', alignItems: 'center' }}>
              <img src="/Icons/Timer.svg" alt="Timer" style={{ width: 16, height: 16, marginRight: 6 }} />
              {activity?.duration_minutes ? `${activity.duration_minutes} min` : ''}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: 28, color: '#252225', cursor: 'pointer', padding: 0 }}>
            <img src="/Icons/X.svg" alt="Close" style={{ width: 28, height: 28 }} />
          </button>
        </div>
        {/* Main content: label and ratings */}
        <div style={{ paddingTop: 24, paddingLeft: 24, paddingRight: 24, maxWidth: 480, margin: '0 auto', width: '100%' }}>
          <div style={{ fontWeight: 600, fontSize: 32, color: '#252225', marginBottom: 32, lineHeight: 1.3 }}>
            {`You're done! How is ${childName || 'your child'} after completing this activity?`}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => handleRating('dysregulated')} disabled={saving} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px', 
              fontSize: '16px', 
              fontWeight: 500, 
              background: '#fff', 
              color: '#252225', 
              border: '1px solid #EEE6E5', 
              borderRadius: 16, 
              cursor: 'pointer', 
              opacity: saving ? 0.6 : 1 
            }}>
              <img src="/Icons/Sad.svg" alt="Dysregulated" style={{ width: 24, height: 24, marginRight: 12 }} /> {saving ? 'Saving...' : 'Dysregulated'}
            </button>
            <button onClick={() => handleRating('distracted')} disabled={saving} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px', 
              fontSize: '16px', 
              fontWeight: 500, 
              background: '#fff', 
              color: '#252225', 
              border: '1px solid #EEE6E5', 
              borderRadius: 16, 
              cursor: 'pointer', 
              opacity: saving ? 0.6 : 1 
            }}>
              <img src="/Icons/Distracted.svg" alt="Distracted" style={{ width: 24, height: 24, marginRight: 12 }} /> {saving ? 'Saving...' : 'Distracted'}
            </button>
            <button onClick={() => handleRating('neutral')} disabled={saving} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px', 
              fontSize: '16px', 
              fontWeight: 500, 
              background: '#fff', 
              color: '#252225', 
              border: '1px solid #EEE6E5', 
              borderRadius: 16, 
              cursor: 'pointer', 
              opacity: saving ? 0.6 : 1 
            }}>
              <img src="/Icons/meh.svg" alt="Neutral" style={{ width: 24, height: 24, marginRight: 12 }} /> {saving ? 'Saving...' : 'Neutral'}
            </button>
            <button onClick={() => handleRating('calmer')} disabled={saving} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px', 
              fontSize: '16px', 
              fontWeight: 500, 
              background: '#fff', 
              color: '#252225', 
              border: '1px solid #EEE6E5', 
              borderRadius: 16, 
              cursor: 'pointer', 
              opacity: saving ? 0.6 : 1 
            }}>
              <img src="/Icons/Calmer.svg" alt="Calmer" style={{ width: 24, height: 24, marginRight: 12 }} /> {saving ? 'Saving...' : 'Calmer'}
            </button>
            <button onClick={() => handleRating('regulated')} disabled={saving} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px', 
              fontSize: '16px', 
              fontWeight: 500, 
              background: '#fff', 
              color: '#252225', 
              border: '1px solid #EEE6E5', 
              borderRadius: 16, 
              cursor: 'pointer', 
              opacity: saving ? 0.6 : 1 
            }}>
              <img src="/Icons/Smile.svg" alt="Regulated" style={{ width: 24, height: 24, marginRight: 12 }} /> {saving ? 'Saving...' : 'Regulated'}
            </button>
          </div>
        </div>
        {/* Previous button at the bottom left */}
        <div style={{ position: 'absolute', left: 24, bottom: 32 }}>
          {currentStep > 0 && (
            <button onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))} style={{ padding: '16px 32px', background: '#fff', color: '#252225', border: '1px solid #EEE6E5', borderRadius: 16, fontWeight: 600, fontSize: 16 }}>Previous</button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{
      width: '100vw', height: '100vh',
      background: 'radial-gradient(ellipse at 80% 10%, #E0FFFF 40%, #F6F6F6 100%), radial-gradient(ellipse at 20% 90%, #B2F7EF 40%, #F6F6F6 100%), linear-gradient(to bottom, #F6F6F6 0%, #F6F6F6 100%)',
    }}>
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: 24, right: 24, zIndex: 10, background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 9999, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px 0 rgba(44, 62, 80, 0.10)' }}
        aria-label="Close"
      >
        <svg className="w-6 h-6" fill="none" stroke="#252225" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Title and Duration */}
      <div style={{ position: 'absolute', top: 48, left: 24, right: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#252225', fontFamily: 'inherit', marginBottom: 8, textAlign: 'left' }}>{activity.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: '#6C6C6C', fontWeight: 500, textAlign: 'left' }}>
          <svg style={{ width: 16, height: 16, marginRight: 4 }} fill="none" stroke="#6C6C6C" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
          </svg>
          {activity.duration_minutes} min
        </div>
      </div>

      {/* Step Count and Description */}
      <div style={{
        position: 'absolute',
        top: '33%',
        left: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}>
        <div style={{ fontSize: 12, color: '#6C6C6C', fontWeight: 500, marginBottom: 8 }}>
          Step {currentStep + 1} of {steps.length}
        </div>
        {currentStepData && (
          <div style={{ fontSize: 32, fontWeight: 500, color: '#252225', textAlign: 'left', lineHeight: 1.2 }}>
            {currentStepData.description}
          </div>
        )}
        {/* Timer display */}
        {timer !== null && timer > 0 && (
          <div style={{ marginTop: 16, fontSize: 18, color: '#367A87', fontWeight: 600 }}>
            {formatTime(timer)}
          </div>
        )}

      </div>

      {/* Navigation or Rating Buttons */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '24px 24px calc(24px + env(safe-area-inset-bottom))',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', gap: 8, maxWidth: 480, margin: '0 auto' }}>
          {currentStep > 0 && (
            <button onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))} style={{ flex: 1, padding: '16px 0', background: '#fff', color: '#252225', border: '1px solid #EEE6E5', borderRadius: 16, fontWeight: 600, fontSize: 16 }}>Previous</button>
          )}
          {/* On last step, show rating buttons instead of Next/Complete */}
          {isLastStep ? (
            <div style={{ width: '100%' }}>
              <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>How'd {childName || 'your child'} do?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button onClick={() => handleRating('dysregulated')} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '16px 0', 
                  fontSize: '16px', 
                  fontWeight: 500, 
                  background: '#fff', 
                  color: '#252225', 
                  border: '1px solid #EEE6E5', 
                  borderRadius: 16, 
                  cursor: 'pointer' 
                }}><span style={{ fontSize: 20, marginRight: 12 }}>☹️</span> Dysregulated</button>
                <button onClick={() => handleRating('distracted')} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '16px 0', 
                  fontSize: '16px', 
                  fontWeight: 500, 
                  background: '#fff', 
                  color: '#252225', 
                  border: '1px solid #EEE6E5', 
                  borderRadius: 16, 
                  cursor: 'pointer' 
                }}><span style={{ fontSize: 20, marginRight: 12 }}>🙁</span> Distracted</button>
                <button onClick={() => handleRating('neutral')} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '16px 0', 
                  fontSize: '16px', 
                  fontWeight: 500, 
                  background: '#fff', 
                  color: '#252225', 
                  border: '1px solid #EEE6E5', 
                  borderRadius: 16, 
                  cursor: 'pointer' 
                }}><span style={{ fontSize: 20, marginRight: 12 }}>😐</span> Neutral</button>
                <button onClick={() => handleRating('calmer')} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '16px 0', 
                  fontSize: '16px', 
                  fontWeight: 500, 
                  background: '#fff', 
                  color: '#252225', 
                  border: '1px solid #EEE6E5', 
                  borderRadius: 16, 
                  cursor: 'pointer' 
                }}><span style={{ fontSize: 20, marginRight: 12 }}>🙂</span> Calmer</button>
                <button onClick={() => handleRating('regulated')} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '16px 0', 
                  fontSize: '16px', 
                  fontWeight: 500, 
                  background: '#fff', 
                  color: '#252225', 
                  border: '1px solid #EEE6E5', 
                  borderRadius: 16, 
                  cursor: 'pointer' 
                }}><span style={{ fontSize: 20, marginRight: 12 }}>😊</span> Regulated</button>
              </div>
            </div>
          ) : (
            <button onClick={handleNextStep} style={{ flex: 1, padding: '16px 0', background: '#367A87', color: '#fff', border: 'none', borderRadius: 16, fontWeight: 600, fontSize: 16 }}>Next Step</button>
          )}
        </div>
      </div>
    </div>
  )
} 

// Add this style object at the top of the file
const ratingBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  fontSize: 22,
  fontWeight: 500,
  background: '#fff',
  border: 'none',
  borderRadius: 32,
  padding: '16px 32px',
  marginBottom: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  cursor: 'pointer',
  transition: 'background 0.2s',
} 