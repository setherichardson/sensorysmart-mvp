'use client'
import { useState } from 'react'
import Link from 'next/link'
import InstallButton from './components/InstallButton'

interface Question {
  id: number
  text: string
  options: { text: string; score: number }[]
  system: string
}

interface SensoryProfile {
  tactile: number
  auditory: number
  visual: number
  vestibular: number
  proprioceptive: number
  total: number
  profile: string
}

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-black rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            SensorySmart
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Discover your child's unique sensory needs and get personalized activities to help them thrive.
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex items-start space-x-4 text-left">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Personalized Assessment</h3>
              <p className="text-gray-600 text-sm">Quick 15-question evaluation of your child's sensory preferences</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 text-left">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Tailored Activities</h3>
              <p className="text-gray-600 text-sm">Custom sensory breaks designed for your child's specific needs</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 text-left">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Track Progress</h3>
              <p className="text-gray-600 text-sm">Monitor your child's development and adjust activities over time</p>
            </div>
          </div>
        </div>

        <Link
          href="/signup"
          className="w-full bg-black text-white py-4 px-6 rounded-2xl font-medium text-base transition-all duration-200 hover:bg-gray-800 inline-block"
        >
          Get Started
        </Link>

        <InstallButton />

        <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign In
            </Link>
          </p>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Takes about 5 minutes to complete
        </p>
      </div>
    </div>
  )
}