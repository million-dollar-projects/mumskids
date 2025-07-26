'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseConfigured, setSupabaseConfigured] = useState(false)
  
  // 尝试创建Supabase客户端
  const getSupabaseClient = () => {
    try {
      return createClient()
    } catch (error) {
      return null
    }
  }

  useEffect(() => {
    const supabase = getSupabaseClient()
    
    if (!supabase) {
      console.warn('Supabase not configured. Authentication features will be disabled.')
      setSupabaseConfigured(false)
      setLoading(false)
      return
    }
    
    setSupabaseConfigured(true)

    // 获取初始会话
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.error('Supabase not configured')
      return
    }
    
    // 获取当前语言，默认为中文
    const currentLocale = window.location.pathname.split('/')[1] || 'zh'
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${currentLocale}/auth/callback`
      }
    })
    if (error) {
      console.error('Google登录失败:', error.message)
    }
  }

  const signOut = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.error('Supabase not configured')
      return
    }
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('登出失败:', error.message)
    }
  }

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 