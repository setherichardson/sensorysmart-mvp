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
}

export default function NoteModal({
  isOpen,
  onClose,
  activityId,
  activityName,
  activityDate,
  initialNote = '',
  onSave
}: NoteModalProps) {
  const [note, setNote] = useState(initialNote)
  const [saving, setSaving] = useState(false)
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setNote(initialNote)
  }, [initialNote])

  const handleNoteChange = (value: string) => {
    setNote(value)
    
    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }
    
    // Set new timeout for auto-save
    const timeout = setTimeout(() => {
      handleSave(value)
    }, 1000) // 1 second debounce
    
    setAutoSaveTimeout(timeout)
  }

  const handleSave = async (noteContent?: string) => {
    const contentToSave = noteContent ?? note
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('activity_completions')
        .update({ notes: contentToSave })
        .eq('id', activityId)

      if (error) {
        console.error('Error saving note:', error)
        return
      }

      onSave?.()
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleManualSave = async () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }
    await handleSave()
    onClose()
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

  if (!isOpen) return null

  return (
    <div className="note-modal-overlay">
      <div className="note-modal-container">
        {/* Header */}
        <div className="note-modal-header">
          <div className="note-modal-header-content">
            <h2 className="note-modal-title">{activityName}</h2>
            <p className="note-modal-date">{formatDate(activityDate)}</p>
          </div>
          <button onClick={onClose} className="note-modal-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="note-modal-content">
          <textarea
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="Add your notes about this activity..."
            className="note-textarea"
            rows={8}
          />
          
          {saving && (
            <div className="note-saving-indicator">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span>Saving...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="note-modal-footer">
          <button onClick={onClose} className="note-modal-cancel">
            Cancel
          </button>
          <button 
            onClick={handleManualSave}
            disabled={saving}
            className="note-modal-save"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
} 