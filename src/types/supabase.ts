export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      practices: {
        Row: {
          id: string
          slug: string
          created_at: string
          updated_at: string
          created_by: string
          title: string
          description: string
          child_name: string
          gender: 'boy' | 'girl'
          difficulty: 'within10' | 'within20' | 'within50' | 'within100'
          calculation_type: 'add' | 'sub' | 'addsub'
          test_mode: 'normal' | 'timed'
          question_count: number | null
          time_limit: number | null
          is_public: boolean
          selected_theme: string
          reward_distribution_mode: 'random' | 'choice'
          rewards: Json
          stats: Json
        }
        Insert: {
          id?: string
          slug?: string
          created_at?: string
          updated_at?: string
          created_by: string
          title: string
          description?: string
          child_name: string
          gender: 'boy' | 'girl'
          difficulty: 'within10' | 'within20' | 'within50' | 'within100'
          calculation_type: 'add' | 'sub' | 'addsub'
          test_mode?: 'normal' | 'timed'
          question_count?: number | null
          time_limit?: number | null
          is_public?: boolean
          selected_theme?: string
          reward_distribution_mode?: 'random' | 'choice'
          rewards?: Json
          stats?: Json
        }
        Update: {
          id?: string
          slug?: string
          created_at?: string
          updated_at?: string
          created_by?: string
          title?: string
          description?: string
          child_name?: string
          gender?: 'boy' | 'girl'
          difficulty?: 'within10' | 'within20' | 'within50' | 'within100'
          calculation_type?: 'add' | 'sub' | 'addsub'
          test_mode?: 'normal' | 'timed'
          question_count?: number | null
          time_limit?: number | null
          is_public?: boolean
          selected_theme?: string
          reward_distribution_mode?: 'random' | 'choice'
          rewards?: Json
          stats?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_practice_slug: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 