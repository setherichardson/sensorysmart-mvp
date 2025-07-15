'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function OnboardingPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [parentName, setParentName] = useState('')
  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      try {
        console.log('Checking user authentication...')
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Auth error:', error)
          router.push('/signup')
          return
        }
        
        if (!user) {
          console.log('No user found, redirecting to signup')
          router.push('/signup')
          return
        }

        console.log('User authenticated successfully:', user.id, user.email)

        // Check if user already has a profile
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profile && !profileError) {
            console.log('User already has profile, redirecting to dashboard')
            router.push('/dashboard/today')
            return
          }
        } catch (err) {
          // Profile doesn't exist, continue with onboarding
          console.log('No existing profile found, continuing with onboarding')
        }

        setUser(user)
        setLoading(false)
      } catch (err) {
        console.error('Error getting user:', err)
        router.push('/signup')
      }
    }

    getCurrentUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('Authentication error. Please try signing in again.')
      return
    }
    
    setSubmitting(true)
    setError('')

    try {
      console.log('Creating profile for user:', user.id)
      console.log('User object:', user)
      console.log('Profile data:', { parentName, childName, childAge, email: user.email })

      // Create profile via API route
      const requestBody = {
        parentName: parentName,
        childName: childName,
        childAge: childAge,
        userId: user.id,
        email: user.email,
      }
      
      console.log('Request body being sent:', requestBody)
      console.log('User ID type:', typeof user.id, 'Value:', user.id)
      
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)
      
      const result = await response.json()
      console.log('Response result:', result)

      if (!response.ok || !result.success) {
        console.error('API error:', result)
        
        // Provide more specific error messages
        if (result.error?.includes('already exists')) {
          setError('An account already exists with this email. Please try signing in instead.')
        } else if (result.error?.includes('Invalid user ID')) {
          setError('Authentication error. Please try refreshing the page and signing in again.')
        } else if (result.error?.includes('User not found')) {
          setError('User not found. Please try signing in again.')
        } else {
          setError(`Failed to create profile: ${result.error || 'Unknown error'}`)
        }
        return
      }

      console.log('Profile created successfully:', result.profile)
      
      // Success! Redirect to assessment
      router.push('/onboarding/assessment')
    } catch (err) {
      console.error('Unexpected error:', err)
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F6F6F6' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#367A87' }}></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F6F6F6' }}>
      <div className="mx-auto w-full max-w-md px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-[#6C6C6C] hover:text-[#252225] mb-6">
            <span className="text-2xl">←</span>
          </Link>
          
          <h1 className="text-[28px] font-medium text-[#252225] mb-2">
            Create your account
          </h1>
          <p className="text-[18px] text-[#6C6C6C]" style={{ lineHeight: 'calc(1.5 - 2px)', letterSpacing: '-0.01em' }}>
            Tell us about your family to personalize your experience
          </p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="parentName" className="block text-sm font-medium text-[#252225] mb-2">
              Your Name (Parent/Caregiver)
            </label>
            <input
              type="text"
              id="parentName"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full px-4 py-3 border rounded-[16px] focus:ring-2 focus:ring-[#367A87] focus:border-transparent text-[#252225] bg-white"
              style={{ borderColor: '#EEE6E5' }}
              placeholder="Enter your name"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="childName" className="block text-sm font-medium text-[#252225] mb-2">
              Child's Name
            </label>
            <input
              type="text"
              id="childName"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="w-full px-4 py-3 border rounded-[16px] focus:ring-2 focus:ring-[#367A87] focus:border-transparent text-[#252225] bg-white"
              style={{ borderColor: '#EEE6E5' }}
              placeholder="Enter your child's name"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="childAge" className="block text-sm font-medium text-[#252225] mb-2">
              Child's Age
            </label>
            <div className="relative">
              <select
                id="childAge"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                className="w-full px-4 py-3 border rounded-[16px] focus:ring-2 focus:ring-[#367A87] focus:border-transparent text-[#252225] bg-white appearance-none pr-10"
                style={{ borderColor: '#EEE6E5' }}
                required
                disabled={submitting}
              >
                <option value="" className="text-[#6C6C6C]">Select age range</option>
                <option value="2-3 years" className="text-[#252225]">2-3 years</option>
                <option value="4-5 years" className="text-[#252225]">4-5 years</option>
                <option value="6-7 years" className="text-[#252225]">6-7 years</option>
                <option value="8-10 years" className="text-[#252225]">8-10 years</option>
                <option value="11-13 years" className="text-[#252225]">11-13 years</option>
                <option value="14+ years" className="text-[#252225]">14+ years</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-[#6C6C6C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-white py-3 px-4 rounded-[16px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: '#367A87',
              height: '48px'
            }}
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Profile...
              </div>
            ) : (
              'Continue to Assessment'
            )}
          </button>
        </form>

        {/* Sign Out Option */}
        <div className="mt-6 text-center">
          <button
            onClick={handleSignOut}
            className="text-[#6C6C6C] hover:text-[#252225] text-sm underline transition-colors"
          >
            Sign out and use a different account
          </button>
        </div>
      </div>
    </div>
  )
} 