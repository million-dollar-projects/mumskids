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
          is_public: boolean
          difficulty: 'within10' | 'within20' | 'within50' | 'within100'
          question_count: number
          metadata: Json
          child_info: Json
          stats: Json
        }
        Insert: {
          id?: string
          slug?: string
          created_at?: string
          updated_at?: string
          created_by: string
          is_public: boolean
          difficulty: 'within10' | 'within20' | 'within50' | 'within100'
          question_count: number
          metadata: Json
          child_info: Json
          stats: Json
        }
        Update: {
          id?: string
          slug?: string
          created_at?: string
          updated_at?: string
          created_by?: string
          is_public?: boolean
          difficulty?: 'within10' | 'within20' | 'within50' | 'within100'
          question_count?: number
          metadata?: Json
          child_info?: Json
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