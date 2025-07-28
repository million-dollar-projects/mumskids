'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/context';
import { messages } from '@/i18n/messages';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export default function LoginPage({ params }: LoginPageProps) {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  
  // 获取语言参数
  const [locale, setLocale] = useState('zh');
  
  useEffect(() => {
    const getLocale = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    getLocale();
  }, [params]);

  const t = messages[locale as keyof typeof messages] || messages.zh;

  useEffect(() => {
    if (user && !loading) {
      // 如果用户已登录，重定向到主页
      router.push(`/${locale}`);
    }
  }, [user, loading, router, locale]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('登录失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">已登录，正在跳转...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image src="/images/littleplus.png" alt="Little Plus" width={80} height={80} />
          </div>
          <CardTitle className="text-2xl font-bold">{t.auth.title}</CardTitle>
          <CardDescription className="text-base">
            {t.auth.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google 登录按钮 */}
          <Button
            onClick={handleGoogleLogin}
            className="w-full h-12 text-lg font-medium"
            variant="outline"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t.auth.googleLogin}
          </Button>

          {/* 分割线 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                或
              </span>
            </div>
          </div>

          {/* 邮箱登录 */}
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              {t.auth.emailLogin} 功能开发中...
            </div>
            <Button
              className="w-full"
              variant="outline"
              disabled
            >
              {t.auth.emailLogin}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              登录即表示您同意我们的服务条款和隐私政策
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 