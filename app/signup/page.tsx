'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { analytics } from '@/lib/analytics'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Track page view
  useEffect(() => {
    analytics.pageView('signup');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      console.log('Starting signup process...')
      
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        console.error('Signup error:', error)
        setError(error.message)
        return
      }

      if (data.user) {
        console.log('Signup successful, user:', data.user.id, data.user.email)
        
        // Track successful signup
        analytics.signup('email');
        
        // Wait for the session to be established
        console.log('Waiting for session to be established...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Double-check the session is established
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          console.error('Session not established after signup')
          setError('Authentication failed. Please try again.')
          return
        }
        
        console.log('Session confirmed, redirecting to onboarding...')
        router.push('/onboarding')
      } else {
        setError('Signup failed. Please try again.')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
            Get started with Sensory Smart
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#252225] mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-[16px] focus:ring-2 focus:ring-[#367A87] focus:border-transparent text-[#252225] bg-white"
              style={{ borderColor: '#EEE6E5' }}
              placeholder="Enter your email"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#252225] mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-[16px] focus:ring-2 focus:ring-[#367A87] focus:border-transparent text-[#252225] bg-white"
              style={{ borderColor: '#EEE6E5' }}
              placeholder="Create a password"
              required
              disabled={submitting}
              minLength={6}
            />
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
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <p className="text-[#6C6C6C] text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-[#367A87] hover:text-[#2A5F6B] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 