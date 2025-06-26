'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
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
          <div className="mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              You're Offline
            </h2>
            <p className="text-gray-600 text-base leading-relaxed mb-6">
              No worries! You can still access your previously loaded activities and assessment results.
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-2">What you can do offline:</h3>
            <ul className="text-left text-sm text-gray-600 space-y-1">
              <li>• Review your child's sensory profile</li>
              <li>• Access previously loaded activities</li>
              <li>• Browse the assessment questions</li>
              <li>• Use the timer for activity breaks</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white py-3 px-6 rounded-2xl font-medium text-base transition-all duration-200 hover:bg-gray-800 mb-4"
          >
            Try Again
          </button>
          <p className="text-xs text-gray-500">
            Check your internet connection and try refreshing
          </p>
        </div>
      </div>
    </div>
  )
} 