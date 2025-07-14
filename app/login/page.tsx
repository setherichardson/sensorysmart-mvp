'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard/today'
  const message = searchParams.get('message')

  // Check for success message on component mount
  useEffect(() => {
    if (message === 'password-reset-success') {
      setSuccessMessage('Password reset successfully! You can now sign in with your new password.')
    }
  }, [message])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Check if user has completed onboarding
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single()

          if (profile) {
            // User has profile, redirect to intended destination
            router.push(redirectTo)
          } else {
            // User needs to complete onboarding
            router.push('/onboarding')
          }
        } catch (profileError) {
          // Profile doesn't exist, redirect to onboarding
          router.push('/onboarding')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#F6F6F6' }}>
      <div className="mx-auto w-full max-w-md px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-[#6C6C6C] hover:text-[#252225]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-medium text-[#252225] mb-2">
            Welcome Back
          </h1>
          <p className="text-[18px] text-[#6C6C6C] font-normal">
            Sign in to continue your sensory journey
          </p>
        </div>

        {/* Login Form */}
        <div className="mb-6">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600 text-sm">{successMessage}</p>
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
                className="w-full px-4 py-3 bg-white border border-[#EEE6E5] rounded-[16px] focus:ring-2 focus:ring-[#367A87] focus:border-transparent text-[#252225] placeholder-[#6C6C6C]"
                placeholder="Enter your email"
                required
                disabled={loading}
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
                className="w-full px-4 py-3 bg-white border border-[#EEE6E5] rounded-[16px] focus:ring-2 focus:ring-[#367A87] focus:border-transparent text-[#252225] placeholder-[#6C6C6C]"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#367A87] text-white rounded-[16px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-4">
            <Link
              href="/forgot-password"
              className="text-[#367A87] hover:text-[#2A5F6A] text-sm"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-[18px] text-[#6C6C6C] font-normal">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#367A87] hover:text-[#2A5F6A] font-medium">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen" style={{ background: '#F6F6F6' }}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#367A87]"></div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
} 