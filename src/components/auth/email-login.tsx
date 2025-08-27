'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/context'

interface EmailLoginProps {
  t: {
    auth: {
      emailRequired: string
      emailInvalid: string
      otpRequired: string
      sendOtp: string
      verifyOtp: string
      otpSent: string
      otpSentDesc: string
      backToEmail: string
      resendOtp: string
      otpExpired: string
      otpInvalid: string
      emailPlaceholder: string
      otpPlaceholder: string
    }
  }
  onSuccess?: () => void
}

export function EmailLogin({ t, onSuccess }: EmailLoginProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countdown, setCountdown] = useState(0)
  
  const { sendEmailOtp, verifyEmailOtp } = useAuth()

  // 倒计时逻辑
  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendOtp = async () => {
    setError('')
    setSuccess('')
    
    if (!email) {
      setError(t.auth.emailRequired)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(t.auth.emailInvalid)
      return
    }

    setLoading(true)
    
    try {
      const result = await sendEmailOtp(email)
      
      if (result.success) {
        setSuccess(t.auth.otpSent)
        setStep('otp')
        startCountdown()
      } else {
        setError(result.error || '发送验证码失败')
      }
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError('')
    setSuccess('')
    
    if (!otp) {
      setError(t.auth.otpRequired)
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      setError('请输入6位数字验证码')
      return
    }

    setLoading(true)
    
    try {
      const result = await verifyEmailOtp(email, otp)
      
      if (result.success) {
        setSuccess('登录成功！')
        onSuccess?.()
      } else {
        if (result.error?.includes('expired')) {
          setError(t.auth.otpExpired)
        } else if (result.error?.includes('invalid')) {
          setError(t.auth.otpInvalid)
        } else {
          setError(result.error || '验证失败')
        }
      }
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setOtp('')
    setError('')
    setSuccess('')
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return
    await handleSendOtp()
  }

  if (step === 'email') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder={t.auth.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl"
            disabled={loading}
          />
        </div>
        
        {error && (
          <div className="text-sm text-red-600 text-center p-2 bg-red-50 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="text-sm text-green-600 text-center p-2 bg-green-50 rounded-lg">
            {success}
          </div>
        )}
        
        <Button
          onClick={handleSendOtp}
          disabled={loading || !email}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>发送中...</span>
            </div>
          ) : (
            t.auth.sendOtp
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {t.auth.otpSent}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {t.auth.otpSentDesc}
        </p>
        <p className="text-sm text-gray-500">
          {email}
        </p>
      </div>
      
      <div className="space-y-2">
        <Input
          type="text"
          placeholder={t.auth.otpPlaceholder}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="h-12 rounded-xl text-center text-lg tracking-widest"
          disabled={loading}
          maxLength={6}
        />
      </div>
      
      {error && (
        <div className="text-sm text-red-600 text-center p-2 bg-red-50 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="text-sm text-green-600 text-center p-2 bg-green-50 rounded-lg">
          {success}
        </div>
      )}
      
      <Button
        onClick={handleVerifyOtp}
        disabled={loading || otp.length !== 6}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>验证中...</span>
          </div>
        ) : (
          t.auth.verifyOtp
        )}
      </Button>
      
      <div className="flex justify-between text-sm">
        <button
          onClick={handleBackToEmail}
          className="text-blue-600 hover:text-blue-700"
          disabled={loading}
        >
          {t.auth.backToEmail}
        </button>
        
        <button
          onClick={handleResendOtp}
          disabled={loading || countdown > 0}
          className="text-blue-600 hover:text-blue-700 disabled:text-gray-400"
        >
          {countdown > 0 ? `${countdown}s后重发` : t.auth.resendOtp}
        </button>
      </div>
    </div>
  )
}
