'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Assessment, ChatMessage } from '@/lib/supabase/client'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function CoachPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [visibleSuggestions, setVisibleSuggestions] = useState<number[]>([])
  const [isChatMode, setIsChatMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)

  const suggestedTopics = [
    "Managing sensory meltdowns in public",
    "Dealing with aggressive behavior at home",
    `Help ${profile?.child_name || 'my child'} with bedtime routine`,
    "Strategies for mealtime challenges"
  ]

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError || !profileData) {
          router.push('/onboarding')
          return
        }

        // Get latest assessment (optional)
        const { data: assessmentData } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single()

        // Load chat history
        const { data: chatData, error: chatError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (chatError) {
          console.error('Error loading chat history:', chatError)
        } else if (chatData && chatData.length > 0) {
          const formattedMessages: Message[] = chatData.map(msg => ({
            id: msg.id,
            type: msg.message_type as 'user' | 'assistant',
            content: msg.content,
            timestamp: new Date(msg.created_at)
          }))
          setMessages(formattedMessages)
          console.log(`✅ Loaded ${formattedMessages.length} previous messages`)
        } else {
          console.log('📝 No previous chat history found - starting fresh!')
        }

        setUser(user)
        setProfile(profileData)
        setAssessment(assessmentData)
        
        // Show suggestions immediately if no existing chat history
        if (!chatData || chatData.length === 0) {
          setTimeout(() => {
            showSuggestionsWithDelay()
          }, 500)
        }
      } catch (err) {
        console.error('Error loading user data:', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  useEffect(() => {
    // Scroll to bottom when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Show suggestions with staggered delay
  const showSuggestionsWithDelay = () => {
    suggestedTopics.forEach((_, index) => {
      setTimeout(() => {
        setVisibleSuggestions(prev => [...prev, index])
      }, (index + 1) * 200) // 200ms delay between each suggestion
    })
  }

  const getChatGPTResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userId: user?.id,
          childName: profile?.child_name,
          childAge: profile?.child_age,
          sensoryProfile: assessment?.results?.profile,
          assessmentResults: assessment?.results,
          completedAt: assessment?.completed_at
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error('Error getting ChatGPT response:', error)
      return 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.'
    }
  }

  const saveMessage = async (content: string, type: 'user' | 'assistant') => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          content: content,
          message_type: type,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving message:', error)
      }
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return

    // Enter chat mode when sending a message
    setIsChatMode(true)

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      // Get AI response
      const aiResponse = await getChatGPTResponse(content.trim())
      
      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Save assistant message
      await saveMessage(aiResponse, 'assistant')
      
    } catch (error) {
      console.error('Error getting AI response:', error)
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  const handleRefresh = () => {
    // Soft reset - keep database data, just clear current view
    setMessages([])
    setVisibleSuggestions([])
    
    // Show suggestions immediately
    setTimeout(() => {
      showSuggestionsWithDelay()
    }, 500)
  }

  const handleCloseChat = () => {
    setIsChatMode(false)
    setMessages([])
    setVisibleSuggestions([])
    
    // Show suggestions immediately
    setTimeout(() => {
      showSuggestionsWithDelay()
    }, 500)
  }

  const formatMessageContent = (content: string) => {
    const lines = content.split('\n')
    return lines.map((line, index) => {
      if (line.startsWith('Key benefits:') || line.startsWith('Key strategies:') || line.startsWith('Preparation strategies:') || line.startsWith('Immediate response:') || line.startsWith('General strategies:')) {
        // Parse markdown in section headers
        const formattedTitle = parseInlineMarkdown(line)
        return (
          <div key={index} className="message-benefits">
            <div className="message-benefits-title" dangerouslySetInnerHTML={{ __html: formattedTitle }} />
          </div>
        )
      } else if (line.match(/^\d+\./)) {
        const [number, ...rest] = line.split('.')
        const restText = rest.join('.').trim()
        // Parse markdown in numbered list items
        const formattedText = parseInlineMarkdown(restText)
        return (
          <div key={index} className="message-benefit-item">
            <span className="message-benefit-number">{number}.</span>
            <span dangerouslySetInnerHTML={{ __html: formattedText }} />
          </div>
        )
      } else if (line.trim()) {
        // Parse markdown in regular text
        const formattedText = parseInlineMarkdown(line)
        return (
          <div key={index} className="message-text" dangerouslySetInnerHTML={{ __html: formattedText }} />
        )
      }
      return <div key={index} className="h-2" />
    })
  }

  // Helper function to parse inline markdown (bold, italic, etc.)
  const parseInlineMarkdown = (text: string): string => {
    // Simple markdown parsing for basic formatting
    let parsed = text
    
    // Handle **bold** text first (to avoid conflicts with single *)
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Handle __bold__ text (alternative)
    parsed = parsed.replace(/__(.*?)__/g, '<strong>$1</strong>')
    
    // Handle *italic* text (after bold to avoid conflicts)
    parsed = parsed.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
    
    // Handle _italic_ text (alternative)
    parsed = parsed.replace(/_([^_\n]+?)_/g, '<em>$1</em>')
    
    return parsed
  }

  if (loading) {
    return (
      <div className="coach-container">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading coach...</p>
                  </div>

        {/* Bottom Navigation - Hidden in chat mode */}
        {!isChatMode && (
          <div className="bottom-nav">
            <div className="bottom-nav-wrapper">
              <div className="bottom-nav-container">
                {/* Today Tab */}
                <Link href="/dashboard/today" className="nav-tab">
                  <div className="nav-tab-content nav-tab-inactive">
                    <div className="nav-tab-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15l4-4 4 4" />
                      </svg>
                    </div>
                    <span className="nav-tab-label-inactive hig-caption-1">Today</span>
                  </div>
                </Link>

                {/* Coach Tab - Active */}
                <Link href="/dashboard/coach" className="nav-tab">
                  <div className="nav-tab-content nav-tab-active">
                    <div className="nav-tab-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <span className="nav-tab-label-active hig-caption-1">Coach</span>
                  </div>
                </Link>

                {/* Journal Tab */}
                <Link href="/dashboard/journal" className="nav-tab">
                  <div className="nav-tab-content nav-tab-inactive">
                    <div className="nav-tab-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="nav-tab-label-inactive hig-caption-1">Journal</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

  if (!user || !profile) {
    return null // Will redirect
  }

  return (
    <div className="coach-container">
      <div className="coach-wrapper">
        {/* Header */}
        <div className="coach-header">
          <div className="coach-header-nav">
            <h1 className="coach-title">Coach</h1>
            <button
              onClick={isChatMode ? handleCloseChat : handleRefresh}
              className="coach-header-icon"
            >
              {isChatMode ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </button>
          </div>
          {!assessment && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 text-sm">
                Complete your{' '}
                <Link href="/onboarding/assessment" className="underline font-medium">
                  sensory assessment
                </Link>
                {' '}to get more personalized coaching.
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="coach-content">
          {/* Chat Messages - Only show in chat mode */}
          {isChatMode && messages.length > 0 && (
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                  className={message.type === 'user' ? 'message-user' : 'message-assistant'}
                >
                  {message.type === 'user' ? (
                    <div className="message-bubble-user">
                      {formatMessageContent(message.content)}
                    </div>
                  ) : (
                    <div className="message-content-assistant">
                      {message.content ? (
                        formatMessageContent(message.content)
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
              
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Floating Close Button - Show when in chat mode */}
          {isChatMode && (
            <button
              onClick={handleCloseChat}
              className="floating-close-button"
              aria-label="Close chat"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}


        </div>

        {/* Suggestions - Show when not in chat mode */}
        {!isChatMode && (
          <div className="suggestions-container">
            <div className="suggestions-grid">
              {suggestedTopics.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`suggestion-card ${visibleSuggestions.includes(index) ? 'suggestion-visible' : 'suggestion-hidden'}`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className="chat-input-container">
          <form onSubmit={handleSubmit} className="chat-input-wrapper">
            <div className="chat-input-field">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="ask coach a question..."
                className="chat-input"
                disabled={isTyping}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  const scrollHeight = target.scrollHeight;
                  const lineHeight = 24; // approximate line height
                  const maxHeight = lineHeight * 4; // 4 lines max
                  target.style.height = Math.min(scrollHeight, maxHeight) + 'px';
                }}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="chat-send-button"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Navigation - Always visible */}
        <div className="bottom-nav">
          <div className="bottom-nav-wrapper">
            <div className="bottom-nav-container">
              {/* Today Tab */}
              <Link href="/dashboard/today" className="nav-tab">
                <div className="nav-tab-content nav-tab-inactive">
                  <div className="nav-tab-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15l4-4 4 4" />
                    </svg>
                  </div>
                  <span className="nav-tab-label-inactive hig-caption-1">Today</span>
                </div>
              </Link>

              {/* Coach Tab - Active */}
              <Link href="/dashboard/coach" className="nav-tab">
                <div className="nav-tab-content nav-tab-active">
                  <div className="nav-tab-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="nav-tab-label-active hig-caption-1">Coach</span>
                </div>
              </Link>

              {/* Journal Tab */}
              <Link href="/dashboard/journal" className="nav-tab">
                <div className="nav-tab-content nav-tab-inactive">
                  <div className="nav-tab-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="nav-tab-label-inactive hig-caption-1">Journal</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 