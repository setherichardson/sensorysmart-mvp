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

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Sensory Smart
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Personalized sensory activities and AI coaching to help your child thrive
          </p>
        </div>

        {/* PWA Install Card */}
        <div className="max-w-md mx-auto mb-8 bg-white rounded-lg shadow-lg p-6 border border-blue-200">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Add to Home Screen
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            Get quick access to Sensory Smart activities and coaching right from your home screen
          </p>
          <InstallButton />
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">For Parents</h2>
            <p className="text-gray-600 mb-6">
              Get personalized sensory activities and AI coaching to support your child's development
            </p>
            <Link 
              href="/signup" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Already have an account?</h2>
            <p className="text-gray-600 mb-6">
              Sign in to access your personalized dashboard and continue your journey
            </p>
            <Link 
              href="/login" 
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}