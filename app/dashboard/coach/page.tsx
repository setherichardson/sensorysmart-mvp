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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestedTopics = [
    "Suggest a new calming activity",
    "How to adapt a sensory break for car rides", 
    "Planning sensory strategies for vacation"
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
        const { data: chatData } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (chatData) {
          const formattedMessages: Message[] = chatData.map(msg => ({
            id: msg.id,
            type: msg.message_type as 'user' | 'assistant',
            content: msg.content,
            timestamp: new Date(msg.created_at)
          }))
          setMessages(formattedMessages)
        }

        setUser(user)
        setProfile(profileData)
        setAssessment(assessmentData)
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

  const generateMockResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    const childName = profile?.child_name || 'your child'
    const sensoryProfile = assessment?.results?.profile || 'sensory'
    
    if (lowerMessage.includes('calming') || lowerMessage.includes('calm')) {
      return `I recommend deep pressure activities like bear hugs or weighted blankets to help calm an overwhelmed sensory system.

Key benefits:
1. Activates proprioceptive system
2. Releases calming hormones
3. Creates feeling of security

You might also try creating a quiet corner with soft lighting and comfort items for ${childName} to retreat to when feeling overwhelmed.`
    }
    
    if (lowerMessage.includes('car') || lowerMessage.includes('travel')) {
      return `For car rides, I suggest preparing a sensory travel kit with these items:

Key strategies:
1. Weighted lap pad for calming pressure
2. Noise-canceling headphones for auditory sensitivity
3. Fidget toys for tactile input
4. Snacks with different textures for oral sensory needs

Start with short practice trips to help ${childName} get used to the sensory travel routine.`
    }
    
    if (lowerMessage.includes('vacation') || lowerMessage.includes('travel') || lowerMessage.includes('trip')) {
      return `Planning ahead is key for successful sensory-friendly vacations:

Preparation strategies:
1. Research sensory-friendly spaces at your destination
2. Pack familiar comfort items and sensory tools
3. Plan for regular sensory breaks in your itinerary
4. Prepare ${childName} with pictures and stories about the trip

Consider bringing a portable sensory kit with weighted items, fidgets, and noise-reducing headphones.`
    }

    if (lowerMessage.includes('meltdown') || lowerMessage.includes('overwhelmed')) {
      return `When ${childName} is overwhelmed, try this approach:

Immediate response:
1. Lower your voice and speak slowly
2. Reduce environmental stimuli (lights, sounds)
3. Offer deep pressure input if they're receptive
4. Give them space to regulate

Remember, meltdowns are a sign of an overwhelmed nervous system, not defiance. Focus on co-regulation and safety first.`
    }

    // Default response
    return `That's a great question about sensory support for ${childName}. Based on their ${sensoryProfile} profile, I'd recommend focusing on activities that match their specific needs.

General strategies:
1. Observe what sensory inputs your child seeks or avoids
2. Create a predictable routine with sensory breaks
3. Have a toolkit of go-to sensory activities ready
4. Remember that sensory needs can change throughout the day

Would you like me to suggest specific activities based on any particular sensory system or situation you're dealing with?`
  }

  const saveMessage = async (content: string, type: 'user' | 'assistant') => {
    if (!user) return

    try {
      await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          message_type: type,
          content: content
        })
    } catch (err) {
      console.error('Error saving message:', err)
      // Continue even if save fails - don't interrupt user experience
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Save user message to database
    await saveMessage(content.trim(), 'user')

    // Simulate API delay
    setTimeout(async () => {
      const responseContent = generateMockResponse(content)
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseContent,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantResponse])
      setIsTyping(false)

      // Save assistant response to database
      await saveMessage(responseContent, 'assistant')
    }, 1500)
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  const formatMessageContent = (content: string) => {
    const lines = content.split('\n')
    return lines.map((line, index) => {
      if (line.startsWith('Key benefits:') || line.startsWith('Key strategies:') || line.startsWith('Preparation strategies:') || line.startsWith('Immediate response:') || line.startsWith('General strategies:')) {
        return (
          <div key={index} className="message-benefits">
            <div className="message-benefits-title">{line}</div>
          </div>
        )
      } else if (line.match(/^\d+\./)) {
        const [number, ...rest] = line.split('.')
        return (
          <div key={index} className="message-benefit-item">
            <span className="message-benefit-number">{number}.</span>
            <span>{rest.join('.').trim()}</span>
          </div>
        )
      } else if (line.trim()) {
        return (
          <div key={index} className="message-text">
            {line}
          </div>
        )
      }
      return <div key={index} className="h-2" />
    })
  }

  if (loading) {
    return (
      <div className="coach-container">
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
    <div className="coach-container">
      <div className="coach-wrapper">
        {/* Header */}
        <div className="coach-header">
          <h1 className="coach-title">Sensory Coach</h1>
          <p className="coach-intro">
            Hi {profile.parent_name}! I'm here to help with sensory support for {profile.child_name}. What can I assist you with today?
          </p>
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
          {/* Suggested Topics - Only show if no messages */}
          {messages.length === 0 && (
            <div className="suggested-topics">
              <div className="suggested-topics-header">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 11a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Suggested topics:
              </div>
              <div className="suggested-topics-list">
                {suggestedTopics.map((topic, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(topic)}
                    className="suggestion-card"
                  >
                    <div className="suggestion-text">{topic}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.length > 0 && (
            <div className="chat-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.type === 'user' ? 'message-user' : 'message-assistant'}
                >
                  <div
                    className={
                      message.type === 'user' 
                        ? 'message-bubble-user' 
                        : 'message-bubble-assistant'
                    }
                  >
                    {formatMessageContent(message.content)}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="message-assistant">
                  <div className="message-bubble-assistant">
                    <div className="typing-indicator">
                      <span>Thinking</span>
                      <div className="typing-indicator-dot"></div>
                      <div className="typing-indicator-dot"></div>
                      <div className="typing-indicator-dot"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="chat-input-container">
          <form onSubmit={handleSubmit} className="chat-input-wrapper">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about sensory strategies..."
              className="chat-input"
              disabled={isTyping}
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
          </form>
        </div>

        {/* Bottom Navigation */}
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
                  <span className="nav-tab-label-inactive">Today</span>
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
                  <span className="nav-tab-label-active">Coach</span>
                </div>
              </Link>

              {/* Behaviors Tab */}
              <Link href="/dashboard/behaviors" className="nav-tab">
                <div className="nav-tab-content nav-tab-inactive">
                  <div className="nav-tab-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="nav-tab-label-inactive">Behaviors</span>
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
                  <span className="nav-tab-label-inactive">Journal</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 