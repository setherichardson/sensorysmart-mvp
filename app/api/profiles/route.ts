import { NextRequest, NextResponse } from 'next/server'
import { profileService, createClient } from '@/lib/supabase/server'

// Ensure environment variables are loaded
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables for Supabase')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  console.log('🌐 OPTIONS request to /api/profiles')
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}

export async function POST(request: NextRequest) {
  console.log('🔍 Profile API POST called')
  console.log('📊 Request method:', request.method)
  console.log('📍 Request URL:', request.url)
  
  try {
    console.log('📝 Parsing request body...')
    const body = await request.json()
    console.log('📋 Request body:', JSON.stringify(body, null, 2))
    
    if (!body.parentName || !body.childName || !body.childAge || !body.userId) {
      console.error('❌ Missing required fields:', { 
        parentName: !!body.parentName, 
        childName: !!body.childName, 
        childAge: !!body.childAge,
        userId: !!body.userId
      })
      return NextResponse.json(
        { success: false, error: 'Missing required fields: parentName, childName, childAge, userId' },
        { status: 400 }
      )
    }
    
    // Validate userId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(body.userId)) {
      console.error('❌ Invalid user ID format:', body.userId)
      return NextResponse.json(
        { success: false, error: 'Invalid user ID format. Please try signing in again.' },
        { status: 400 }
      )
    }
    
    const profileData = {
      parent_name: body.parentName,
      email: body.email || '',
      child_name: body.childName,
      child_age: body.childAge,
    }
    
    console.log('🗃️ Profile data to create:', JSON.stringify(profileData, null, 2))
    console.log('👤 User ID:', body.userId)

    console.log('💾 Creating profile in database...')
    const profile = await profileService.createProfile(body.userId, profileData)
    
    console.log('✅ Profile created successfully:', profile.id)
    
    return NextResponse.json({ 
      success: true, 
      profile,
      message: 'Profile created successfully' 
    })
  } catch (error: any) {
    console.error('❌ Detailed error in profile creation:', error)
    console.error('Error name:', error?.name)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    
    // Check if it's a Supabase/Postgres error
    if (error?.code) {
      console.error('Database error code:', error.code)
      console.error('Database error details:', error.details)
      console.error('Database error hint:', error.hint)
      
      // Provide more specific error messages based on error codes
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { 
            success: false, 
            error: 'A profile already exists for this user. Please try signing in instead.',
            details: error.message,
            code: error.code
          },
          { status: 409 }
        )
      } else if (error.code === '23503') { // Foreign key violation
        return NextResponse.json(
          { 
            success: false, 
            error: 'User not found. Please try signing in again.',
            details: error.message,
            code: error.code
          },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create profile. Please try again.',
        details: error?.message || 'Unknown error',
        code: error?.code || 'UNKNOWN'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profile = await profileService.getProfile(user.id)
    
    return NextResponse.json({ 
      success: true, 
      profile 
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch profile' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updates = {
      parent_name: body.parentName,
      child_name: body.childName,
      child_age: body.childAge,
    }

    const profile = await profileService.updateProfile(user.id, updates)
    
    return NextResponse.json({ 
      success: true, 
      profile,
      message: 'Profile updated successfully' 
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update profile' 
      },
      { status: 500 }
    )
  }
} 