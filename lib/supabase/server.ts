import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './client'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.warn('Could not set cookies in server component:', error)
          }
        },
      },
    }
  )
}

// Admin client for server-side operations
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // Admin client doesn't need cookies
        },
      },
    }
  )
}

// Service functions for database operations
export const profileService = {
  // Create profile after authentication signup
  async createProfile(userId: string, data: Omit<Database['public']['Tables']['profiles']['Insert'], 'id'>) {
    // Use admin client for profile creation to bypass RLS
    const supabase = createAdminClient()
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({ ...data, id: userId })
      .select()
      .single()
    
    if (error) throw error
    return profile
  },

  // Get profile by user ID
  async getProfile(userId: string) {
    const supabase = await createClient()
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return profile
  },

  // Update profile
  async updateProfile(userId: string, updates: Database['public']['Tables']['profiles']['Update']) {
    const supabase = await createClient()
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return profile
  }
}

export const assessmentService = {
  // Save assessment results
  async saveAssessment(data: Database['public']['Tables']['assessments']['Insert']) {
    const supabase = await createClient()
    
    const { data: assessment, error } = await supabase
      .from('assessments')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return assessment
  },

  // Get latest assessment for user
  async getLatestAssessment(userId: string) {
    const supabase = await createClient()
    
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error) throw error
    return assessment
  },

  // Get all assessments for user (for history/tracking)
  async getUserAssessments(userId: string) {
    const supabase = createAdminClient()
    
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
    
    if (error) throw error
    return assessments
  }
}

export const activityService = {
  // Log activity completion
  async logActivityCompletion(data: Database['public']['Tables']['activity_completions']['Insert']) {
    const supabase = createAdminClient()
    
    const { data: completion, error } = await supabase
      .from('activity_completions')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return completion
  },

  // Get activity history for user
  async getActivityHistory(userId: string, limit = 50) {
    const supabase = createAdminClient()
    
    const { data: completions, error } = await supabase
      .from('activity_completions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return completions
  },

  // Get activity analytics
  async getActivityAnalytics(userId: string) {
    const supabase = createAdminClient()
    
    const { data: completions, error } = await supabase
      .from('activity_completions')
      .select('activity_name, activity_type, rating')
      .eq('user_id', userId)
    
    if (error) throw error

    // Calculate analytics
    const totalActivities = completions.length
    const workedCount = completions.filter(c => c.rating === 'worked').length
    const successRate = totalActivities > 0 ? (workedCount / totalActivities) * 100 : 0

    // Group by activity type
    const typeAnalytics = completions.reduce((acc, completion) => {
      const type = completion.activity_type
      if (!acc[type]) {
        acc[type] = { total: 0, worked: 0, successRate: 0 }
      }
      acc[type].total++
      if (completion.rating === 'worked') {
        acc[type].worked++
      }
      acc[type].successRate = (acc[type].worked / acc[type].total) * 100
      return acc
    }, {} as Record<string, { total: number; worked: number; successRate: number }>)

    // Most effective activities
    const activityAnalytics = completions.reduce((acc, completion) => {
      const name = completion.activity_name
      if (!acc[name]) {
        acc[name] = { total: 0, worked: 0, successRate: 0 }
      }
      acc[name].total++
      if (completion.rating === 'worked') {
        acc[name].worked++
      }
      acc[name].successRate = (acc[name].worked / acc[name].total) * 100
      return acc
    }, {} as Record<string, { total: number; worked: number; successRate: number }>)

    return {
      totalActivities,
      successRate,
      typeAnalytics,
      activityAnalytics,
      recentCompletions: completions.slice(0, 10)
    }
  }
}

export const chatService = {
  // Save chat message
  async saveMessage(data: Database['public']['Tables']['chat_messages']['Insert']) {
    const supabase = createAdminClient()
    
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return message
  },

  // Get chat history for user
  async getChatHistory(userId: string) {
    const supabase = createAdminClient()
    
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return messages
  }
} 