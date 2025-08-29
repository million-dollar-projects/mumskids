'use client'

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { messages } from '@/i18n/messages';
import { useAuth } from '@/lib/auth/context';
import { PhoneMockup } from '@/components/ui/phone-mockup';
import { PracticeDashboard } from '@/components/dashboard/practice-dashboard';

interface PageProps {
  params: Promise<{ locale: string }>;
}



export default function HomePage({ params }: PageProps) {
  const { user, loading } = useAuth();
  const [locale, setLocale] = useState('zh');

  useEffect(() => {
    const getLocale = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    getLocale();
  }, [params]);



  const t = messages[locale as keyof typeof messages] || messages.zh;

  // 如果正在加载认证状态，显示加载页面
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header locale={locale} />
        {/* 加载状态 */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">{t.common.loading}</p>
          </div>
        </div>
        <Footer locale={locale} />
      </div>
    );
  }

  // 如果用户已登录，显示练习管理页面
  if (user) {
    return <PracticeDashboard locale={locale} t={t} />;
  }

  // 未登录用户的着陆页
  return (
    <div className="min-h-screen landing-bg">
      <Header locale={locale} variant="landing" isFixed={true} />

      {/* 主要内容 */}
      <main className=" pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[60vh] sm:min-h-[80vh]">
            {/* 左侧内容 */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-primary-black leading-tight">
                  {t.landing.title}
                  <br />
                  <span className="gradient-text">{t.landing.subtitle}</span>
                </h1>
                <p className="text-xl text-secondary-gray leading-relaxed max-w-lg">
                  {t.landing.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Link href={`/${locale}/auth/login`}>
                  <Button
                    size="lg"
                    className="btn-primary-black px-4 py-2 text-base font-medium cursor-pointer w-full sm:w-auto"
                  >
                    {t.landing.cta}
                  </Button>
                </Link>

                {/* 或者分隔符图标 */}
                <div className="flex items-center justify-center">
                  <div className="hidden sm:flex flex-col items-center space-y-1">
                    <div className="w-px h-3 bg-gray-300"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                    <div className="w-px h-3 bg-gray-300"></div>
                  </div>
                  <div className="sm:hidden">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                  </div>
                </div>

                <Link href={`/${locale}/discover`}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-4 py-2 text-base font-medium cursor-pointer w-full sm:w-auto border-2 border-primary-black text-primary-black hover:bg-primary-black hover:text-white transition-colors"
                  >
                    {t.landing.exploreEvents}
                  </Button>
                </Link>
              </div>
            </div>

            {/* 右侧3D手机展示 */}
            <div className="justify-center lg:justify-end hidden sm:flex">
              <div className="relative">
                {/* 背景圆形装饰 */}
                <div className="absolute inset-0 circle-bg rounded-full transform scale-110 opacity-60 animate-pulse-slow"></div>

                {/* 手机容器 */}
                <div className="relative z-10 transform sm:rotate-12 hover:rotate-6 transition-transform duration-500 animate-float">
                  <PhoneMockup />
                </div>

                {/* 周围的装饰元素 - 使用新配色 */}
                <div className="absolute top-10 -left-8 w-6 h-6 rounded-full animate-pulse" style={{ backgroundColor: 'var(--gradient-text-start)' }}></div>
                <div className="absolute bottom-20 -right-4 w-8 h-8 rounded-full animate-pulse delay-300" style={{ backgroundColor: 'var(--gradient-text-end)' }}></div>
                <div className="absolute top-1/2 -left-12 w-4 h-4 rounded-full animate-pulse delay-700" style={{ backgroundColor: 'var(--gradient-text-middle)' }}></div>
                <div className="absolute top-1/3 right-8 w-5 h-5 rounded-full animate-bounce delay-500" style={{ backgroundColor: 'var(--circle-bg)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}