'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  activityId: string
  activityName: string
  activityDate: string
  initialNote?: string
  onSave?: () => void
  activityRating?: string | null
}

export default function NoteModal({
  isOpen,
  onClose,
  activityId,
  activityName,
  activityDate,
  initialNote = '',
  onSave,
  activityRating
}: NoteModalProps) {
  const [note, setNote] = useState(initialNote)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setNote(initialNote)
  }, [initialNote])

  const handleNoteChange = (value: string) => {
    setNote(value)
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('activity_completions')
        .update({ notes: note })
        .eq('id', activityId)

      if (error) {
        console.error('Error saving note:', error)
        alert('Failed to save note. Please try again.')
      } else {
        onSave?.()
        onClose()
      }
    } catch (err) {
      console.error('Error saving note:', err)
      alert('Failed to save note. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    })
  }

  const getRatingDisplay = (rating: string | null) => {
    switch (rating) {
      case 'regulated':
        return {
          emoji: '😌',
          label: 'Regulated',
          color: '#0C3A28',
          background: '#DEFFF2',
          icon: '/Icons/Smile.svg'
        }
      case 'calmer':
        return {
          emoji: '😊',
          label: 'Calmer',
          color: '#12224C',
          background: '#DEE7FF',
          icon: '/Icons/Calmer.svg'
        }
      case 'neutral':
        return {
          emoji: '😐',
          label: 'Neutral',
          color: '#252225',
          background: '#E2E4F6',
          icon: '/Icons/meh.svg'
        }
      case 'distracted':
        return {
          emoji: '😵‍💫',
          label: 'Distracted',
          color: '#563616',
          background: '#FFEDDB',
          icon: '/Icons/Distracted.svg'
        }
      case 'dysregulated':
        return {
          emoji: '😖',
          label: 'Dysregulated',
          color: '#571B1A',
          background: '#FFB0AE',
          icon: '/Icons/Sad.svg'
        }
      case 'worked_well':
        return {
          emoji: '✅',
          label: 'Worked Well',
          color: '#0C3A28',
          background: '#DEFFF2',
          icon: '/Icons/Check.svg'
        }
      case 'didnt_work':
        return {
          emoji: '❌',
          label: "Didn't Work",
          color: '#571B1A',
          background: '#FFB0AE',
          icon: '/Icons/X.svg'
        }
      case 'okay':
        return {
          emoji: '⚠️',
          label: 'Okay',
          color: '#563616',
          background: '#FFEDDB',
          icon: '/Icons/meh.svg'
        }
      default:
        return null
    }
  }

  if (!isOpen) return null

  const ratingDisplay = getRatingDisplay(activityRating || null)

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#ffffff' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '24px', 
        background: '#F6F6F6',
        borderBottom: '1px solid #EEE6E5',
        flexShrink: 0
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 600, 
            color: '#252225', 
            margin: '0 0 8px 0' 
          }}>
            {activityName}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Rating chip */}
            {ratingDisplay && (
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                fontSize: 12, 
                padding: '4px 8px', 
                borderRadius: 12, 
                background: ratingDisplay.background, 
                color: ratingDisplay.color, 
                fontWeight: 600 
              }}>
                <img 
                  src={ratingDisplay.icon} 
                  alt={ratingDisplay.label} 
                  style={{ 
                    width: 14, 
                    height: 14, 
                    marginRight: 4, 
                    filter: 'brightness(0) saturate(100%)', 
                    opacity: 0.8 
                  }} 
                />
                {ratingDisplay.label}
              </div>
            )}
            {/* Time with calendar icon */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: '#252225', 
              fontSize: 14, 
              fontWeight: 500 
            }}>
              <img 
                src="/Icons/Calendar.svg" 
                alt="Calendar" 
                style={{ 
                  width: 16, 
                  height: 16, 
                  marginRight: 6, 
                  filter: 'invert(10%) sepia(6%) saturate(0%) hue-rotate(0deg) brightness(100%)' 
                }} 
              />
              {formatTime(activityDate)}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ 
            background: 'none', 
            border: 'none', 
            padding: '8px', 
            cursor: 'pointer',
            color: '#252225',
            borderRadius: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#EEE6E5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <textarea
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder="Add your notes about this activity..."
          style={{ 
            width: '100%', 
            flex: 1,
            padding: '16px',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '16px',
            fontFamily: 'inherit',
            color: '#252225',
            background: 'transparent',
            minHeight: 0
          }}
        />
        <style jsx>{`
          textarea::placeholder {
            color: #ACACAC;
          }
        `}</style>
      </div>

      {/* Footer */}
      <div style={{ 
        padding: '24px', 
        borderTop: '1px solid #EEE6E5',
        background: '#ffffff',
        flexShrink: 0
      }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ 
            width: '100%',
            padding: '16px',
            background: '#367A87',
            color: '#ffffff',
            border: 'none',
            borderRadius: '16px',
            fontWeight: 600,
            fontSize: '16px',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!saving) {
              e.currentTarget.style.background = '#2A5F6B'
            }
          }}
          onMouseLeave={(e) => {
            if (!saving) {
              e.currentTarget.style.background = '#367A87'
            }
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
} 