import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json(
        { error: '邮箱和验证码不能为空' },
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

    // 验证验证码格式（通常是6位数字）
    const otpRegex = /^\d{6}$/
    if (!otpRegex.test(token)) {
      return NextResponse.json(
        { error: '请输入6位数字验证码' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 使用 Supabase 验证 OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    })

    if (error) {
      console.error('验证码验证失败:', error.message)
      
      // 根据错误类型返回不同的错误信息
      if (error.message.includes('expired')) {
        return NextResponse.json(
          { error: '验证码已过期，请重新获取' },
          { status: 400 }
        )
      } else if (error.message.includes('invalid')) {
        return NextResponse.json(
          { error: '验证码无效，请检查后重试' },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          { error: '验证失败，请稍后重试' },
          { status: 500 }
        )
      }
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: '验证失败，请重新尝试' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: '验证成功',
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at
      }
    })

  } catch (error) {
    console.error('验证码验证API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
