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
  sendEmailOtp: (email: string) => Promise<{ success: boolean; error?: string }>
  verifyEmailOtp: (email: string, token: string) => Promise<{ success: boolean; error?: string }>
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

  const sendEmailOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || '发送验证码失败' }
      }

      return { success: true }
    } catch (error) {
      console.error('发送邮箱验证码失败:', error)
      return { success: false, error: '网络错误，请稍后重试' }
    }
  }

  const verifyEmailOtp = async (email: string, token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || '验证失败' }
      }

      // 验证成功后，刷新会话状态
      const supabase = getSupabaseClient()
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      }

      return { success: true }
    } catch (error) {
      console.error('验证邮箱验证码失败:', error)
      return { success: false, error: '网络错误，请稍后重试' }
    }
  }

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
    sendEmailOtp,
    verifyEmailOtp,
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