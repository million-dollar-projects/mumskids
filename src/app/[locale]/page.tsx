'use client'

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { messages } from '@/i18n/messages';
import { useAuth } from '@/lib/auth/context';
import { PhoneMockup } from '@/components/ui/phone-mockup';
import { UserAvatarDropdown } from '@/components/ui/user-avatar-dropdown';
import { BookOpen, Telescope, Search, Plus, Star, Bell, X, Globe } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function HomePage({ params }: PageProps) {
  const { user, loading } = useAuth();
  const [locale, setLocale] = useState('zh');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getLocale = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    getLocale();
  }, [params]);

  // 点击外部关闭通知弹窗
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const t = messages[locale as keyof typeof messages] || messages.zh;

  // 如果正在加载认证状态，显示加载页面
  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50">
        {/* 简化的头部 */}
        <header className="bg-purple-50">
          <div className="max-w-[820px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex-shrink-0">
                  <Star className="w-6 h-6 text-purple-600" fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 加载状态 */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  // 如果用户已登录，显示活动管理页面
  if (user) {
    return (
      <div className="bg-purple-50 min-h-screen">
        {/* Header */}
        <header className="bg-purple-50 relative">
          <div className="max-w-[820px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              {/* Left section with navigation */}
              <nav className="flex space-x-4">
                <a href="#" className="flex items-center space-x-2 text-sm/5 text-gray-900 font-bold">
                  <BookOpen className="w-5 h-5" />
                  <span>练习</span>
                </a>
                <a href="#" className="flex items-center space-x-2 text-sm/5 text-[#1315175c] font-bold hover:opacity-80">
                  <Telescope className="w-5 h-5" />
                  <span>我的练习</span>
                </a>
                <a href="#" className="flex items-center space-x-2 text-sm/5 text-[#1315175c] font-bold hover:opacity-80">
                  <Globe className="w-5 h-5" />
                  <span>发现</span>
                </a>
              </nav>
            </div>
          </div>

          {/* Right section - positioned absolutely to the right */}
          <div className="absolute right-4 sm:right-6 lg:right-8 top-0 h-16 flex items-center space-x-2">
            <button className="text-gray-700 hover:text-gray-900 font-medium text-sm/5">创建练习</button>

            <button className="text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100 transition-colors">
              <Search className="w-5 h-5" />
            </button>

            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {/* 未读通知小红点 */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* 通知弹窗 */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">

                  {/* 空状态内容 */}
                  <div className="py-16 px-8 text-center">
                    {/* 月亮和星星图标 */}
                    <div className="mb-6 flex justify-center">
                      <div className="relative">
                        {/* 月亮 */}
                        <div className="w-12 h-12 rounded-full bg-gray-300 relative">
                          <div className="absolute top-1 right-1 w-8 h-8 rounded-full bg-white"></div>
                        </div>
                        {/* 星星 */}
                        <div className="absolute -top-1 -right-1">
                          <Star className="w-6 h-6 text-gray-400 fill-current" />
                        </div>
                      </div>
                    </div>

                    {/* 主要文字 */}
                    <h3 className="text-xl font-medium text-gray-700 mb-3">这里很安静</h3>

                    {/* 副标题 */}
                    <p className="text-gray-500 text-sm">创建练习并分享给好友。</p>
                  </div>
                </div>
              )}
            </div>

            <UserAvatarDropdown user={user} />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[820px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">练习</h1>
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">我的练习</button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">公开练习</button>
            </div>
          </div>

          {/* Empty State */}
          <div className="py-16">
            <div className="text-center">
              {/* Empty State Icon */}
              <div className="mx-auto w-48 h-48 mb-8 relative">
                <div className="w-full h-full bg-white border border-gray-200 shadow-lg opacity-50 rounded-2xl flex items-center justify-center relative">
                  {/* Math symbols */}
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-3xl font-bold text-gray-400">1</span>
                    <span className="text-3xl text-gray-300">+</span>
                    <span className="text-3xl font-bold text-gray-400">1</span>
                    <span className="text-3xl text-gray-300">=</span>
                    <span className="text-3xl font-bold text-gray-300">?</span>
                  </div>
                  {/* Zero indicator */}
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200">
                    <span className="text-3xl font-bold text-gray-400">0</span>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-400 mb-4">还没有数学练习</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">为孩子创建第一个数学练习，让学习变得更有趣！</p>
              <button className="inline-flex items-center px-4  cursor-pointer py-1 bg-gray-200 opacity-70 hover:opacity-100 text-gray-700 font-medium rounded-lg hover:bg-gray-500 hover:text-white transition-colors">
                <Plus className="w-5 h-5 mr-2" />
                创建练习
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16">
          <div className="max-w-[820px] mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-8">
              {/* Left links */}
              <div className="flex space-x-6">
                <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">发现</a>
                <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">定价</a>
                <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">帮助</a>
              </div>
              {/* Social icons */}
              <div className="flex space-x-6">

                <a href="#" className="text-gray-400 hover:text-gray-500 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
            {/* Bottom link */}
            <div className="text-center">
              <a href="#" className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-sm font-medium transition-all duration-300 hover:scale-105">
                使用 LittlePlus 开始练习 →
              </a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // 未登录用户的着陆页
  return (
    <div className="min-h-screen landing-bg">
      {/* 头部导航 */}
      <header className="py-6 px-6">
        <div className="max-w-[820px] mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-primary-black">
            {t.landing.brand}
          </div>
          <div className="flex items-center gap-4">
            {/* 语言切换 */}
            <div className="flex gap-2">
              <Link href="/zh">
                <Button variant="ghost" size="sm" className="text-tertiary-gray">中文</Button>
              </Link>
              <Link href="/en">
                <Button variant="ghost" size="sm" className="text-tertiary-gray">English</Button>
              </Link>
            </div>

            {/* 探索活动链接 */}
            <Link href={`/${locale}/events`}>
              <Button variant="ghost" size="sm" className="text-secondary-gray">
                {t.landing.exploreEvents}
              </Button>
            </Link>

            {/* 登录按钮 */}
            {loading ? (
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            ) : (
              <Link href={`/${locale}/auth/login`}>
                <Button size="sm" className="btn-primary-black">
                  {t.nav.login}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="px-6">
        <div className="max-w-[820px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
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

              <div>
                <Link href={`/${locale}/auth/login`}>
                  <Button
                    size="lg"
                    className="btn-primary-black px-8 py-4 text-lg font-medium"
                  >
                    {t.landing.cta}
                  </Button>
                </Link>
              </div>
            </div>

            {/* 右侧3D手机展示 */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* 背景圆形装饰 */}
                <div className="absolute inset-0 circle-bg rounded-full transform scale-110 opacity-60 animate-pulse-slow"></div>

                {/* 手机容器 */}
                <div className="relative z-10 transform rotate-12 hover:rotate-6 transition-transform duration-500 animate-float">
                  {/* 使用SVG手机组件 */}
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

      {/* 页脚 */}
      <footer className="py-12 px-6 border-t border-gray-100 mt-20">
        <div className="max-w-[820px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="text-xl font-bold text-primary-black">
              {t.landing.brand}
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <Link href="/terms" className="hover:text-gray-700 transition-colors">
                {t.landing.footer.support}
              </Link>
              <Link href="/privacy" className="hover:text-gray-700 transition-colors">
                {t.landing.footer.privacy}
              </Link>
              <Link href="/help" className="hover:text-gray-700 transition-colors">
                {t.landing.footer.security}
              </Link>
              <div className="flex gap-6">
                <span className="text-gray-400 hover:text-gray-500 cursor-pointer transition-colors">📧</span>
                <span className="text-gray-400 hover:text-gray-500 cursor-pointer transition-colors">👤</span>
                <span className="text-gray-400 hover:text-gray-500 cursor-pointer transition-colors">✕</span>
                <span className="text-gray-400 hover:text-gray-500 cursor-pointer transition-colors">📷</span>
              </div>
            </div>
          </div>
          {/* Bottom link */}
          <div className="text-center">
            <a href="#" className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors">
              使用 Luna 主卡制作问卷 →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}