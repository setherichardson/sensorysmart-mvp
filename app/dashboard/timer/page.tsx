'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// TypeScript declarations for WakeLock API
interface WakeLockSentinel {
  released: boolean
  release(): Promise<void>
}

interface TimerState {
  isRunning: boolean
  isPaused: boolean
  isComplete: boolean
  timeRemaining: number
  totalTime: number
  taskName: string
}

const PRESET_TIMES = [5, 10, 15, 20, 30, 45, 60]

export default function TimerPage() {
  const router = useRouter()
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    isComplete: false,
    timeRemaining: 0,
    totalTime: 0,
    taskName: ''
  })
  
  const [selectedTime, setSelectedTime] = useState(10)
  const [customTime, setCustomTime] = useState('')
  const [taskName, setTaskName] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Initialize audio context
  useEffect(() => {
    // Create audio context on first user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
    }

    // Initialize on any user interaction
    const handleUserInteraction = () => {
      initAudio()
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }

    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('touchstart', handleUserInteraction)

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }
  }, [])

  // Timer logic
  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused && timerState.timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1
          
          if (newTimeRemaining <= 0) {
            // Timer complete
            playChime()
            
            return {
              ...prev,
              isRunning: false,
              isComplete: true,
              timeRemaining: 0
            }
          }
          
          return {
            ...prev,
            timeRemaining: newTimeRemaining
          }
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState.isRunning, timerState.isPaused, timerState.timeRemaining, isMuted])

  // Wake lock to prevent screen sleep
  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused && 'wakeLock' in navigator) {
      (navigator as any).wakeLock?.request('screen').then((lock: WakeLockSentinel) => {
        wakeLockRef.current = lock
      }).catch(console.error)
    } else if (wakeLockRef.current) {
      wakeLockRef.current.release()
      wakeLockRef.current = null
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release()
      }
    }
  }, [timerState.isRunning, timerState.isPaused])

  // Save timer state to localStorage
  useEffect(() => {
    if (timerState.isRunning || timerState.isPaused) {
      localStorage.setItem('timerState', JSON.stringify(timerState))
    } else {
      localStorage.removeItem('timerState')
    }
  }, [timerState])

  // Load timer state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('timerState')
    if (savedState) {
      const parsed = JSON.parse(savedState)
      if (parsed.isRunning || parsed.isPaused) {
        setTimerState(parsed)
      }
    }
  }, [])

  // Play chime when timer completes
  useEffect(() => {
    if (timerState.isComplete) {
      playChime()
    }
  }, [timerState.isComplete])

  // Function to play gentle chime sound
  const playChime = async () => {
    console.log('🎵 Attempting to play chime...')
    console.log('🔇 Is muted:', isMuted)
    
    if (!audioContextRef.current || isMuted) {
      console.log('❌ Audio context not available or muted')
      return
    }

    try {
      const audioContext = audioContextRef.current
      console.log('🎧 Audio context state:', audioContext.state)
      
      // Resume audio context if suspended (required by modern browsers)
      if (audioContext.state === 'suspended') {
        console.log('⏸️ Resuming suspended audio context...')
        await audioContext.resume()
        console.log('✅ Audio context resumed, new state:', audioContext.state)
      }

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Set up gentle chime sound
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // Start at 800Hz
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1) // Rise to 1200Hz
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.3) // Fall to 600Hz

      // Set volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05) // Gentle rise
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2) // Gentle fall

      // Start and stop
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 2)

      console.log('🎵 Chime started successfully')

      // Clean up
      oscillator.onended = () => {
        console.log('🎵 Chime finished')
        oscillator.disconnect()
        gainNode.disconnect()
      }
    } catch (error) {
      console.error('❌ Error playing chime:', error)
    }
  }

  const startTimer = () => {
    const timeInSeconds = selectedTime * 60
    setTimerState({
      isRunning: true,
      isPaused: false,
      isComplete: false,
      timeRemaining: timeInSeconds,
      totalTime: timeInSeconds,
      taskName: taskName.trim()
    })
  }

  const pauseTimer = () => {
    setTimerState(prev => ({ ...prev, isPaused: true }))
  }

  const resumeTimer = () => {
    setTimerState(prev => ({ ...prev, isPaused: false }))
  }

  const stopTimer = () => {
    setTimerState({
      isRunning: false,
      isPaused: false,
      isComplete: false,
      timeRemaining: 0,
      totalTime: 0,
      taskName: ''
    })
  }

  const restartTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      isComplete: false,
      timeRemaining: prev.totalTime
    }))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    if (timerState.totalTime === 0) return 0
    return ((timerState.totalTime - timerState.timeRemaining) / timerState.totalTime) * 100
  }

  // Setup Screen
  if (!timerState.isRunning && !timerState.isPaused && !timerState.isComplete) {
    return (
      <div className="timer-container">
        <div className="timer-wrapper">
          {/* Header */}
          <div className="timer-header">
            <div className="timer-header-nav">
              <Link href="/dashboard/today" className="timer-back-button">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
            </div>
            <h1 className="timer-title">Timer</h1>
          </div>

          {/* Setup Content */}
          <div className="timer-setup">
            <div className="time-selector">
              <h2 className="time-selector-title">Choose Time</h2>
              
              {/* Preset Times */}
              <div className="preset-times">
                {PRESET_TIMES.map(time => (
                  <button
                    key={time}
                    className={`preset-time ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time} min
                  </button>
                ))}
              </div>

              {/* Custom Time */}
              <div className="custom-time">
                <label htmlFor="customTime" className="custom-time-label">
                  Custom time (minutes):
                </label>
                <input
                  id="customTime"
                  type="number"
                  min="1"
                  max="120"
                  value={customTime}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    setCustomTime(e.target.value)
                    if (value > 0 && value <= 120) {
                      setSelectedTime(value)
                    }
                  }}
                  className="custom-time-input"
                  placeholder="Enter minutes"
                />
              </div>
            </div>

            {/* Task Name */}
            <div className="task-name-section">
              <label htmlFor="taskName" className="task-name-label">
                Task name (optional):
              </label>
              <input
                id="taskName"
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="task-name-input"
                placeholder="e.g., Clean up toys"
                maxLength={50}
              />
            </div>

            {/* Start Button */}
            <button
              className="start-timer-button"
              onClick={startTimer}
              disabled={selectedTime <= 0}
            >
              Start Timer
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Active Timer Display
  if (timerState.isRunning || timerState.isPaused) {
    return (
      <div className="timer-container">
        <div className="timer-wrapper">
          {/* Header */}
          <div className="timer-header">
            <div className="timer-header-nav">
              <Link href="/dashboard/today" className="timer-back-button">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
            </div>
            <h1 className="timer-title">Timer</h1>
          </div>

          {/* Timer Display */}
          <div className="timer-display">
            {/* Task Name */}
            {timerState.taskName && (
              <div className="timer-task-name">{timerState.taskName}</div>
            )}

            {/* Progress Circle */}
            <div className="timer-progress-container">
              <div className="timer-progress-circle">
                <svg className="timer-progress-svg" viewBox="0 0 200 200">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    className="timer-progress-bg"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    className="timer-progress-fill"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 80}`,
                      strokeDashoffset: `${2 * Math.PI * 80 * (1 - getProgressPercentage() / 100)}`
                    }}
                  />
                </svg>
                <div className="timer-time-display">
                  {formatTime(timerState.timeRemaining)}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="timer-status">
              {timerState.isPaused ? 'Paused' : 'Running'}
            </div>

            {/* Controls */}
            <div className="timer-controls">
              {timerState.isPaused ? (
                <button className="timer-resume-button" onClick={resumeTimer}>
                  Resume
                </button>
              ) : (
                <button className="timer-pause-button" onClick={pauseTimer}>
                  Pause
                </button>
              )}
              <button className="timer-stop-button" onClick={stopTimer}>
                Stop
              </button>
            </div>

            {/* Audio Controls */}
            <div className="audio-controls">
              <button
                className="audio-toggle-button"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
              
              {/* Test Audio Button */}
              <button
                className="test-audio-button"
                onClick={() => {
                  console.log('🧪 Test audio button clicked')
                  playChime()
                }}
                title="Test audio"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Completion Screen
  if (timerState.isComplete) {
    return (
      <div className="timer-container">
        <div className="timer-wrapper">
          {/* Header */}
          <div className="timer-header">
            <div className="timer-header-nav">
              <Link href="/dashboard/today" className="timer-back-button">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
            </div>
            <h1 className="timer-title">Timer Complete!</h1>
          </div>

          {/* Completion Content */}
          <div className="timer-completion">
            <div className="completion-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {timerState.taskName && (
              <div className="completion-task-name">{timerState.taskName}</div>
            )}

            <div className="completion-message">
              Great job! Time's up.
            </div>

            <div className="completion-actions">
              <button className="restart-timer-button" onClick={restartTimer}>
                Restart Timer
              </button>
              <Link href="/dashboard/timer" className="new-timer-button">
                New Timer
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
} 