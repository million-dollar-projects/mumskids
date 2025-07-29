'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { messages } from '@/i18n/messages';
import { useAuth } from '@/lib/auth/context';

interface PracticePageProps {
  params: Promise<{ locale: string }>;
}

export default function PracticePage({ params }: PracticePageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
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
    // 如果用户已登录或认证状态加载完成，重定向到首页
    // 因为首页已经显示了练习列表
    if (!loading) {
      router.replace(`/${locale}`);
    }
  }, [loading, locale, router]);

  // 显示加载状态
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">{t.common.loading}</p>
      </div>
    </div>
  );
} 