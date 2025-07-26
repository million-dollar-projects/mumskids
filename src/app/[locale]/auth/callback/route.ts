import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 如果存在 "next" 参数，则重定向到那里，否则重定向到当前语言的首页
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // 原始主机
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      // 从URL中提取语言参数
      const pathSegments = request.nextUrl.pathname.split('/')
      const locale = pathSegments[1] // 获取locale参数 (zh 或 en)
      
      if (isLocalEnv) {
        // 在本地开发环境中重定向到本地主机
        return NextResponse.redirect(`${origin}/${locale}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}/${locale}${next}`)
      } else {
        return NextResponse.redirect(`${origin}/${locale}${next}`)
      }
    }
  }

  // 如果认证失败，重定向到错误页面
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
} 