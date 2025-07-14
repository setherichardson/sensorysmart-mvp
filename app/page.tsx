'use client'
import { useState } from 'react'
import Link from 'next/link'
import InstallButton from './components/InstallButton'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#F6F6F6' }}>
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        {/* Mascot icon and Sensorysmart wordmark */}
        <div className="flex flex-col items-center mb-8" style={{ gap: '8px' }}>
          <img 
            src="/mascot.png" 
            alt="Mascot" 
            className="mascot-image"
            style={{ 
              width: '200px',
              height: '200px',
              minWidth: '200px',
              minHeight: '200px',
              maxWidth: '200px',
              maxHeight: '200px',
              display: 'block',
              flexShrink: 0
            }}
          />
          <span className="block text-[26px] font-medium text-[#252225] text-center" style={{ marginTop: 0 }}>Sensorysmart</span>
        </div>
        {/* Headline */}
        <h1 className="text-[32px] leading-[1.1] font-semibold text-[#252225] text-center mb-4 max-w-[320px]">
          Sensory support that fits your child
        </h1>
        {/* Description */}
        <p className="text-[18px] font-normal text-[#6C6C6C] text-center max-w-[320px] mb-8">
          Create your account to get started or sign in to access your personalized activities
        </p>
        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link 
            href="/signup" 
            className="w-full h-12 bg-[#367A87] text-white rounded-[16px] font-semibold text-lg text-center flex items-center justify-center border-none shadow-none hover:bg-[#285e68] transition-colors"
          >
            Sign Up
          </Link>
          <Link 
            href="/login" 
            className="w-full h-12 bg-white text-[#252225] rounded-[16px] font-semibold text-lg text-center flex items-center justify-center border border-[#EEE6E5] hover:bg-[#f3f3f3] transition-colors"
          >
            Sign in
          </Link>
        </div>
        {/* Disclaimer */}
        <div className="mt-6">
          <p className="text-[12px] text-[#6C6C6C] text-center max-w-xs">
            By using Sensorysmart, you agree to our Terms of Use and Privacy policy
          </p>
        </div>
      </div>
    </div>
  )
}