import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '邮箱地址不能为空' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 使用 Supabase 发送 OTP 验证码邮件
    // 注意：需要在Supabase控制台配置邮件模板以显示验证码
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        // 不设置 emailRedirectTo 来避免发送魔法链接
        data: {
          // 可以传递额外数据
        }
      },
    })

    if (error) {
      console.error('发送验证码失败:', error.message)
      return NextResponse.json(
        { error: '发送验证码失败，请稍后重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: '验证码已发送到您的邮箱',
      success: true
    })

  } catch (error) {
    console.error('邮箱验证码API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
