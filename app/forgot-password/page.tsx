'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
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
                Check Your Email
              </h2>
              <p className="text-[18px] text-[#6C6C6C] font-normal mb-4">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-[#6C6C6C]">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href="/login"
                className="w-full h-12 bg-[#367A87] text-white rounded-[16px] font-semibold inline-block text-center flex items-center justify-center"
              >
                Back to Sign In
              </Link>
              
              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                className="w-full h-12 bg-white border border-[#EEE6E5] text-[#252225] rounded-[16px] font-semibold"
              >
                Send another email
              </button>
            </div>
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
            Reset Password
          </h1>
          <p className="text-[18px] text-[#6C6C6C] font-normal">
            Enter your email address and we'll send you a link to reset your password
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
              <label htmlFor="email" className="block text-sm font-medium text-[#252225] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#EEE6E5] rounded-[16px] focus:ring-2 focus:ring-[#367A87] focus:border-transparent text-[#252225] placeholder-[#6C6C6C]"
                placeholder="Enter your email address"
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
                  Sending...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen" style={{ background: '#F6F6F6' }}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#367A87]"></div>
        </div>
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  )
} 