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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center mb-12">
          {/* Replace icon with attached image */}
          <img src="/mascot.png" alt="Mascot" className="w-32 h-32 mb-6" />
          <h1 className="text-[36px] leading-[39px] font-semibold text-gray-900 text-center mb-4">
            Sensory support that fits your child
          </h1>
          <p className="text-[18px] font-medium text-[#6C6C6C] text-center max-w-xl mb-8">
            Create your account to get started or sign in to access your personalized activities
          </p>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <Link 
              href="/signup" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-lg text-center hover:bg-blue-700 transition-colors border border-blue-600"
            >
              Sign Up
            </Link>
            <Link 
              href="/login" 
              className="inline-block bg-white text-[#1A1A1A] px-6 py-3 rounded-lg font-semibold text-lg text-center border border-[#EEE6E5] hover:bg-gray-50 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}