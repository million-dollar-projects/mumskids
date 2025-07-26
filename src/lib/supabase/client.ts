'use client'

import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key || url.includes('your-project-id') || key.includes('your-anon-key')) {
    throw new Error('请先配置 Supabase 环境变量。请查看 .env.local 文件并填入真实的项目配置。')
  }
  
  return createBrowserClient(url, key)
} 