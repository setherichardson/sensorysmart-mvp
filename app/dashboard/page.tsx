'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Assessment } from '@/lib/supabase/client'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)

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

        // Get latest assessment (optional - user might not have taken it yet)
        const { data: assessmentData } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single()

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-black text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold">Welcome, {profile.parent_name}!</h1>
              <p className="text-gray-300 text-sm mt-1">
                {profile.child_name}'s Sensorysmart Dashboard
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-gray-300 hover:text-white transition-colors"
              title="Sign Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="p-6">
          {assessment ? (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-2xl mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Sensory Profile: {assessment.results.profile}
              </h2>
              <p className="text-sm text-gray-600">
                Personalized activities and recommendations based on {profile.child_name}'s assessment
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Complete Your Assessment
              </h2>
              <p className="text-sm text-gray-600">
                Take the sensory assessment to get personalized activities for {profile.child_name}
              </p>
              <Link
                href="/onboarding/assessment"
                className="inline-block mt-3 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Start Assessment
              </Link>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            
            <Link href="/dashboard/today" className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-left hover:border-gray-300 transition-colors block">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Start Sensory Break</h4>
                  <p className="text-sm text-gray-500">Personalized activities for {profile.child_name}</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/coach" className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-left hover:border-gray-300 transition-colors block">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Chat with Coach</h4>
                  <p className="text-sm text-gray-500">Get personalized guidance and tips</p>
                </div>
              </div>
            </Link>

            <button className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-left hover:border-gray-300 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">View Progress</h4>
                  <p className="text-sm text-gray-500">Track {profile.child_name}'s sensory development</p>
                </div>
              </div>
            </button>
          </div>

          {/* Trial Status */}
          {profile.subscription_status === 'trialing' && (
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Free Trial Active</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    You're currently in your 7-day free trial. Enjoy full access to all features!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Profile Status */}
          <div className="mt-8 p-4 bg-green-50 rounded-2xl border border-green-200">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-green-900">Profile Created!</h4>
                <p className="text-sm text-green-700 mt-1">
                  {assessment
                    ? "You've successfully completed the Sensorysmart assessment. Your personalized experience is now ready."
                    : "Complete the sensory assessment to unlock personalized activities."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 