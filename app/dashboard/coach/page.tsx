'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Assessment, ChatMessage } from '@/lib/supabase/client'
import { analytics } from '@/lib/analytics'

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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [dailyUsage, setDailyUsage] = useState({ used: 0, limit: 15 })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const suggestedTopics = [
    "My child is melting down at the store - help!",
    "Why does my child hit when overwhelmed?",
    "My child won't settle down for bed",
    "Help with picky eating and textures"
  ]

  // Track page view
  useEffect(() => {
    analytics.pageView('dashboard-coach');
  }, []);

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

        // Load today's usage
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const { data: todayMessages, error: usageError } = await supabase
          .from('chat_messages')
          .select('id')
          .eq('user_id', user.id)
          .eq('message_type', 'user')
          .gte('created_at', today.toISOString())
        
        if (!usageError && todayMessages) {
          setDailyUsage({ used: todayMessages.length, limit: 15 })
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
    // Scroll to bottom of chat when a new assistant message is added (most recent response)
    if (messages.length > 0 && messages[messages.length - 1].type === 'assistant') {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages])

  // Handle keyboard visibility
  useEffect(() => {
    const handleFocus = () => setIsKeyboardVisible(true)
    const handleBlur = () => setIsKeyboardVisible(false)

    const input = inputRef.current
    if (input) {
      input.addEventListener('focus', handleFocus)
      input.addEventListener('blur', handleBlur)
    }

    return () => {
      if (input) {
        input.removeEventListener('focus', handleFocus)
        input.removeEventListener('blur', handleBlur)
      }
    }
  }, [])

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
        const errorData = await response.json()
        
        // Handle rate limit error specifically
        if (response.status === 429) {
          return errorData.message || 'Limit reached. Check back tomorrow.'
        }
        
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

    const userMessage = content.trim()
    setInputValue('')
    
    // Track chat started if this is the first message
    if (messages.length === 0) {
      analytics.coachChatStarted();
    }
    
    // Track message sent
    analytics.coachMessageSent();
    
    // Add user message immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)
    
    // Save user message
    await saveMessage(userMessage, 'user')
    
    try {
      // Get AI response
      const aiResponse = await getChatGPTResponse(userMessage)
      
      // Add AI response
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMsg])
      
      // Save AI response
      await saveMessage(aiResponse, 'assistant')
      
      // Update usage count
      setDailyUsage(prev => ({ ...prev, used: prev.used + 1 }))
      
    } catch (error) {
      console.error('Error in chat:', error)
      
      // Add error message
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
    setIsChatModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputValue)
    setIsChatModalOpen(true)
  }

  const handleRefresh = () => {
    setMessages([])
    setIsChatMode(false)
    setVisibleSuggestions([])
    setTimeout(() => {
      showSuggestionsWithDelay()
    }, 100)
  }

  const handleCloseChat = () => {
    setIsChatModalOpen(false)
    setInputValue('')
  }

  const formatMessageContent = (content: string) => {
    // Parse markdown-like formatting
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
    
    return formatted
  }

  const parseInlineMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
  }

  if (loading) {
    return (
      <div className="coach-container" style={{ background: '#F6F6F6' }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading coach...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect
  }

  return (
    <div className="coach-container" style={{ background: '#F6F6F6' }}>
      <div className="coach-wrapper">
        {/* Header - Always visible */}
        <div className="coach-header">
          <div className="coach-header-nav" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <img src="/Icons/sensory-coach.png" alt="Sensory Coach Mascot" style={{ width: 48, height: 48 }} />
              <h1 className="coach-title" style={{ fontSize: 18, fontWeight: 600, color: '#252225', margin: 0, lineHeight: 1, letterSpacing: '-0.5px' }}>Sensory Coach</h1>
            </div>
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
          {/* Suggestions - Show when not in chat modal */}
          {!isChatModalOpen && (
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
          )}

          {/* Chat Input - Show when not in chat modal */}
          {!isChatModalOpen && (
            <div className={`chat-input-container ${isKeyboardVisible ? 'keyboard-visible' : ''}`}>
              {/* Limit reached message - only show when limit is hit */}
              {dailyUsage.used >= dailyUsage.limit && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  padding: '8px 16px',
                  marginBottom: '8px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#DC2626'
                }}>
                  <span>Limit reached. Check back tomorrow.</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="chat-input-wrapper">
                <div className="chat-input-field">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={dailyUsage.used >= dailyUsage.limit ? "Daily limit reached" : "Ask coach a question..."}
                    className="chat-input"
                    disabled={isTyping || dailyUsage.used >= dailyUsage.limit}
                    rows={1}
                    style={{ alignItems: 'center', display: 'flex', paddingTop: 10, paddingBottom: 10 }}
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
                    disabled={!inputValue.trim() || isTyping || dailyUsage.used >= dailyUsage.limit}
                    className="chat-send-button"
                    style={{
                      background: !inputValue.trim() || isTyping || dailyUsage.used >= dailyUsage.limit ? '#AFCACF' : '#367A87',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(44,62,80,0.10)'
                    }}
                  >
                    <img src="/Icons/Arrow-up.svg" alt="Send" style={{ width: 20, height: 20, filter: 'brightness(0) invert(1)' }} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Navigation - Always visible */}
        <div className="bottom-nav">
          <div className="bottom-nav-wrapper">
            <div className="bottom-nav-container">
              {/* Today Tab */}
              <Link href="/dashboard/today" className="nav-tab">
                <div className="nav-tab-content nav-tab-inactive">
                  <div className="nav-tab-icon">
                    <img src="/Icons/Calendar-Default.svg" alt="Today" style={{ width: 28, height: 28 }} />
                  </div>
                  <span className="nav-tab-label-inactive hig-caption-1">Today</span>
                </div>
              </Link>

              {/* Coach Tab - Active */}
              <Link href="/dashboard/coach" className="nav-tab">
                <div className="nav-tab-content nav-tab-active">
                  <div className="nav-tab-icon">
                    <img src="/Icons/Chat-Active.svg" alt="Coach" style={{ width: 28, height: 28 }} />
                  </div>
                  <span className="nav-tab-label-active hig-caption-1">Coach</span>
                </div>
              </Link>

              {/* Journal Tab */}
              <Link href="/dashboard/journal" className="nav-tab">
                <div className="nav-tab-content nav-tab-inactive">
                  <div className="nav-tab-icon">
                    <img src="/Icons/Journal-Default.svg" alt="Journal" style={{ width: 28, height: 28 }} />
                  </div>
                  <span className="nav-tab-label-inactive hig-caption-1">Journal</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {isChatModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#ffffff' }}>
          {/* Modal Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '24px', 
            background: '#F6F6F6',
            borderBottom: '1px solid #EEE6E5',
            flexShrink: 0
          }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <img src="/Icons/sensory-coach.png" alt="Sensory Coach Mascot" style={{ width: 48, height: 48 }} />
              <h1 style={{ fontSize: 18, fontWeight: 600, color: '#252225', margin: 0, lineHeight: 1, letterSpacing: '-0.5px' }}>Sensory Coach</h1>
            </div>
            <button
              onClick={handleCloseChat}
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

          {/* Modal Content */}
          <div style={{ 
            flex: 1, 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Chat Messages */}
            <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
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
                      <div 
                        className="message-text"
                        dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                      />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Thinking Animation */}
              {isTyping && (
                <div className="message-assistant">
                  <div className="thinking-bubble">
                    <div className="thinking-content">
                      <span className="thinking-text">Coach is thinking...</span>
                      <div className="thinking-dots">
                        <div className="thinking-dot"></div>
                        <div className="thinking-dot"></div>
                        <div className="thinking-dot"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} style={{ marginBottom: 28 }} />
            </div>

            {/* Chat Input in Modal */}
            <div className={`chat-input-container modal-chat ${isKeyboardVisible ? 'keyboard-visible' : ''}`}>
              {/* Limit reached message in modal - only show when limit is hit */}
              {dailyUsage.used >= dailyUsage.limit && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  padding: '8px 16px',
                  marginBottom: '8px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#DC2626'
                }}>
                  <span>Limit reached. Check back tomorrow.</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="chat-input-wrapper">
                <div className="chat-input-field">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={dailyUsage.used >= dailyUsage.limit ? "Daily limit reached" : "Ask coach a question..."}
                    className="chat-input"
                    disabled={isTyping || dailyUsage.used >= dailyUsage.limit}
                    rows={1}
                    style={{ alignItems: 'center', display: 'flex', paddingTop: 10, paddingBottom: 10 }}
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
                    disabled={!inputValue.trim() || isTyping || dailyUsage.used >= dailyUsage.limit}
                    className="chat-send-button"
                    style={{
                      background: !inputValue.trim() || isTyping || dailyUsage.used >= dailyUsage.limit ? '#AFCACF' : '#367A87',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(44,62,80,0.10)'
                    }}
                  >
                    <img src="/Icons/Arrow-up.svg" alt="Send" style={{ width: 20, height: 20, filter: 'brightness(0) invert(1)' }} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 