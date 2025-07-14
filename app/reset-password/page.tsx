'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we have the necessary tokens in the URL
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (!accessToken || !refreshToken) {
      setError('Invalid reset link. Please request a new password reset.')
      return
    }

    // Set the session with the tokens from the URL
    const setSession = async () => {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (error) {
        setError('Invalid or expired reset link. Please request a new password reset.')
      }
    }

    setSession()
  }, [searchParams])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login?message=password-reset-success')
      }, 2000)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen" style={{ background: '#F6F6F6' }}>
        <div className="mx-auto w-full max-w-md px-4 py-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-[28px] font-medium text-[#252225] mb-2">
                Password Reset Successfully
              </h2>
              <p className="text-[18px] text-[#6C6C6C] font-normal">
                Your password has been updated. You'll be redirected to sign in shortly.
              </p>
            </div>

            <Link
              href="/login"
              className="w-full h-12 bg-[#367A87] text-white rounded-[16px] font-semibold inline-block text-center flex items-center justify-center"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#F6F6F6' }}>
      <div className="mx-auto w-full max-w-md px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center text-[#6C6C6C] hover:text-[#252225]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-medium text-[#252225] mb-2">
            Set New Password
          </h1>
          <p className="text-[18px] text-[#6C6C6C] font-normal">
            Enter your new password below
          </p>
        </div>

        {/* Reset Form */}
        <div className="mb-6">
          <form onSubmit={handleResetPassword} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#252225] mb-2">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#EEE6E5] rounded-[16px] focus:ring-2 focus:ring-[#367A87] focus:border-transparent text-[#252225] placeholder-[#6C6C6C]"
                placeholder="Enter your new password"
                required
                disabled={loading}
                minLength={6}
              />
              <p className="text-xs text-[#6C6C6C] mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#252225] mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#EEE6E5] rounded-[16px] focus:ring-2 focus:ring-[#367A87] focus:border-transparent text-[#252225] placeholder-[#6C6C6C]"
                placeholder="Confirm your new password"
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
                  Updating Password...
                </div>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen" style={{ background: '#F6F6F6' }}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#367A87]"></div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
} 