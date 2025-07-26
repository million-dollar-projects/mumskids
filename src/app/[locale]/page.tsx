'use client'

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { messages } from '@/i18n/messages';
import { useAuth } from '@/lib/auth/context';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function HomePage({ params }: PageProps) {
  const { user, loading, signOut } = useAuth();
  const [locale, setLocale] = useState('zh');
  
  useEffect(() => {
    const getLocale = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    getLocale();
  }, [params]);

  const t = messages[locale as keyof typeof messages] || messages.zh;

  return (
    <div className="child-container min-h-screen flex flex-col">
      {/* 头部导航 */}
      <header className="py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-primary">
            {t.auth.title}
          </h1>
          <div className="flex items-center gap-4">
            {/* 语言切换 */}
            <div className="flex gap-2">
              <Link href="/zh">
                <Button variant="outline" size="sm">中文</Button>
              </Link>
              <Link href="/en">
                <Button variant="outline" size="sm">English</Button>
              </Link>
            </div>
            
            {/* 用户状态 */}
            {loading ? (
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.user_metadata?.avatar_url && (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="用户头像"
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                >
                  {t.nav.logout}
                </Button>
              </div>
            ) : (
              <Link href={`/${locale}/auth/login`}>
                <Button size="sm">
                  {t.nav.login}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="flex-1 flex flex-col items-center justify-center py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            {t.auth.subtitle}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            让孩子在快乐中学习数学，通过简单的加减法练习建立数学信心！
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
          <Card className="child-card hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧮</span>
              </div>
              <CardTitle className="text-lg">{t.practice.create}</CardTitle>
              <CardDescription className="text-sm">
                创建个性化的数学练习，设置难度和奖励机制
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="child-card hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <CardTitle className="text-lg">{t.practice.browse}</CardTitle>
              <CardDescription className="text-sm">
                浏览其他人创建的练习，找到适合的题目
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="child-card hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <CardTitle className="text-lg">奖励系统</CardTitle>
              <CardDescription className="text-sm">
                完成练习获得奖励，激励孩子持续学习
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* 行动按钮 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={`/${locale}/auth/login`}>
            <Button size="lg" className="w-full sm:w-auto">
              {t.nav.login}
            </Button>
          </Link>
          <Link href={`/${locale}/practice`}>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              {t.practice.browse}
            </Button>
          </Link>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="py-6 text-center text-muted-foreground">
        <p className="text-sm">
          © 2024 儿童数学练习系统 - 让学习更有趣
        </p>
      </footer>
    </div>
  );
} 