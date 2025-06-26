import { createBrowserClient } from '@supabase/ssr'

// Client-side Supabase client (for React components)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Complete TypeScript interfaces for all database tables
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          parent_name: string
          email: string
          child_name: string
          child_age: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string // This will be the auth user ID
          parent_name: string
          email: string
          child_name: string
          child_age: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_name?: string
          email?: string
          child_name?: string
          child_age?: string
          created_at?: string
          updated_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          user_id: string
          responses: Record<number, number> // Question ID -> Score
          results: {
            tactile: number
            auditory: number
            visual: number
            vestibular: number
            proprioceptive: number
            total: number
            profile: string
          }
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          responses: Record<number, number>
          results: {
            tactile: number
            auditory: number
            visual: number
            vestibular: number
            proprioceptive: number
            total: number
            profile: string
          }
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          responses?: Record<number, number>
          results?: {
            tactile: number
            auditory: number
            visual: number
            vestibular: number
            proprioceptive: number
            total: number
            profile: string
          }
          completed_at?: string
          created_at?: string
        }
      }
      activity_completions: {
        Row: {
          id: string
          user_id: string
          activity_name: string
          activity_type: 'proprioceptive' | 'vestibular' | 'tactile' | 'heavy-work' | 'calming'
          rating: 'worked' | 'didnt_work' | 'neutral'
          duration_minutes: number | null
          notes: string | null
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_name: string
          activity_type: 'proprioceptive' | 'vestibular' | 'tactile' | 'heavy-work' | 'calming'
          rating: 'worked' | 'didnt_work' | 'neutral'
          duration_minutes?: number | null
          notes?: string | null
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_name?: string
          activity_type?: 'proprioceptive' | 'vestibular' | 'tactile' | 'heavy-work' | 'calming'
          rating?: 'worked' | 'didnt_work' | 'neutral'
          duration_minutes?: number | null
          notes?: string | null
          completed_at?: string
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          message_type: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message_type: 'user' | 'assistant'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message_type?: 'user' | 'assistant'
          content?: string
          created_at?: string
        }
      }
    }
  }
}

// Helper types for the app
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Assessment = Database['public']['Tables']['assessments']['Row']
export type ActivityCompletion = Database['public']['Tables']['activity_completions']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']

export type SensoryProfile = {
  tactile: number
  auditory: number
  visual: number
  vestibular: number
  proprioceptive: number
  total: number
  profile: string
}

export type OnboardingData = {
  parentName: string
  email: string
  childName: string
  childAge: string
}

export type CompleteAssessmentData = OnboardingData & {
  assessment: Record<number, number>
  sensoryProfile: SensoryProfile
  completedAt: string
} 