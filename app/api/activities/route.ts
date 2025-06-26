import { NextRequest, NextResponse } from 'next/server'
import { activityService, createClient } from '@/lib/supabase/server'

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
    
    const activityData = {
      user_id: user.id,
      activity_name: body.activityName,
      activity_type: body.activityType,
      rating: body.rating || 'neutral',
      duration_minutes: body.durationMinutes || null,
      notes: body.notes || null,
      completed_at: body.completedAt || new Date().toISOString(),
    }

    const completion = await activityService.logActivityCompletion(activityData)
    
    return NextResponse.json({ 
      success: true, 
      data: completion,
      message: 'Activity logged successfully' 
    })
  } catch (error) {
    console.error('Error logging activity:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to log activity' 
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const analytics = searchParams.get('analytics') === 'true'
    
    if (analytics) {
      const analyticsData = await activityService.getActivityAnalytics(user.id)
      return NextResponse.json({ 
        success: true, 
        data: analyticsData 
      })
    } else {
      const completions = await activityService.getActivityHistory(user.id, limit)
      return NextResponse.json({ 
        success: true, 
        data: completions 
      })
    }
  } catch (error) {
    console.error('Error fetching activity data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch activity data' 
      },
      { status: 500 }
    )
  }
} 