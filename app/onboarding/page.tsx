'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function OnboardingPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [parentName, setParentName] = useState('')
  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // User not authenticated, redirect to signup
        router.push('/signup')
        return
      }

      // Check if user already has a profile
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile && !error) {
          // User already has profile, redirect to dashboard
          router.push('/dashboard/today')
          return
        }
      } catch (err) {
        // Profile doesn't exist, continue with onboarding
      }

      setUser(user)
      setLoading(false)
    }

    getCurrentUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setSubmitting(true)
    setError('')

    try {
      console.log('Creating profile for user:', user.id)
      console.log('Profile data:', { parentName, childName, childAge, email: user.email })

      // Create profile via API route
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentName: parentName,
          email: user.email || '',
          childName: childName,
          childAge: childAge,
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error('API error:', result)
        setError(`Failed to create profile: ${result.error || 'Unknown error'}`)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to SensorySmart!
          </h1>
          <p className="text-gray-600">
            Let's create your child's profile to get started
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Signed in as: {user.email}
          </div>
        </div>

        {/* Profile Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name (Parent/Caregiver)
              </label>
              <input
                type="text"
                id="parentName"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Enter your name"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-2">
                Child's Name
              </label>
              <input
                type="text"
                id="childName"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Enter your child's name"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="childAge" className="block text-sm font-medium text-gray-700 mb-2">
                Child's Age
              </label>
              <select
                id="childAge"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                required
                disabled={submitting}
              >
                <option value="">Select age range</option>
                <option value="2-3 years">2-3 years</option>
                <option value="4-5 years">4-5 years</option>
                <option value="6-7 years">6-7 years</option>
                <option value="8-10 years">8-10 years</option>
                <option value="11-13 years">11-13 years</option>
                <option value="14+ years">14+ years</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full gradient-btn text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Sign out and use a different account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 