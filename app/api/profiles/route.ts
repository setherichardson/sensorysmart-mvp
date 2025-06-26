import { NextRequest, NextResponse } from 'next/server'
import { profileService, createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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
    
    const profileData = {
      parent_name: body.parentName,
      email: user.email || '',
      child_name: body.childName,
      child_age: body.childAge,
    }

    const profile = await profileService.createProfile(user.id, profileData)
    
    return NextResponse.json({ 
      success: true, 
      profile,
      message: 'Profile created successfully' 
    })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create profile' 
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