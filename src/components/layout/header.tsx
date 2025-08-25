'use client'

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserAvatarDropdown } from '@/components/ui/user-avatar-dropdown';
import { Star, Bell } from 'lucide-react';
import Image from 'next/image';
import { messages } from '@/i18n/messages';
import { useAuth } from '@/lib/auth/context';

interface HeaderProps {
  locale: string;
  variant?: 'landing' | 'authenticated';
  backgroundClass?: string;
  isFixed?: boolean;
}

export function Header({ locale, variant = 'authenticated', backgroundClass = 'bg-transparent', isFixed = false }: HeaderProps) {
  const { user, loading } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // 统一的header样式类
  const getHeaderClasses = () => {
    return `transition-all duration-300 ${isFixed ? 'fixed top-0 left-0 right-0 z-50' : 'relative'} ${isFixed && isScrolled ? 'bg-white/20 backdrop-blur-sm' : backgroundClass
      }`;
  };

  // 统一的样式对象
  const getHeaderStyle = () => {
    return isFixed ? { paddingTop: 'env(safe-area-inset-top)' } : {};
  };

  const t = messages[locale as keyof typeof messages] || messages.zh;

  // 监听滚动事件
  useEffect(() => {
    if (!isFixed) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFixed]);

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

  // 着陆页头部
  if (variant === 'landing') {
    return (
      <header className={getHeaderClasses()} style={getHeaderStyle()}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <Link href={`/${locale}`} className="text-sm font-bold text-primary-black flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Image src="/images/plus.png" alt="Plus" width={20} height={20} className="w-5 h-5 transition-transform duration-300 hover:rotate-180" />
              <span>{t.landing.brand}</span>
            </Link>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* 语言切换 */}
              <div className="flex gap-1 sm:gap-2">
                <Link href="/zh">
                  <Button variant="ghost" size="sm" className="text-tertiary-gray cursor-pointer text-xs sm:text-sm px-2 sm:px-3">
                    中文
                  </Button>
                </Link>
                <Link href="/en">
                  <Button variant="ghost" size="sm" className="text-tertiary-gray cursor-pointer text-xs sm:text-sm px-2 sm:px-3">
                    English
                  </Button>
                </Link>
              </div>

              {/* 登录按钮 */}
              {loading ? (
                <div className="w-6 h-6 sm:w-8 sm:h-8 animate-spin rounded border-1 border-primary border-t-transparent"></div>
              ) : (
                <Link href={`/${locale}/auth/login`}>
                  <Button size="sm" className="btn-primary-black cursor-pointer text-xs sm:text-sm px-3 sm:px-4 py-1 rounded">
                    {t.nav.login}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // 加载状态头部
  if (loading) {
    return (
      <header className={getHeaderClasses()} style={getHeaderStyle()}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* 左侧品牌区域骨架 */}
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* 右侧导航和用户区域骨架 */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* 导航按钮骨架 */}
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* 移动端导航按钮骨架 */}
              <div className="flex sm:hidden items-center space-x-1">
                <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* 通知按钮骨架 */}
              <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse"></div>

              {/* 用户头像骨架 */}
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // 已认证用户头部
  if (user) {
    return (
      <header className={getHeaderClasses()} style={getHeaderStyle()}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-12">
            {/* Left section with navigation */}
            <nav className="flex items-center">
              <Link href={`/${locale}`} className="flex items-center space-x-2 text-sm font-bold text-gray-900 cursor-pointer">
                <Image
                  src="/images/plus.png"
                  alt="Plus"
                  width={20}
                  height={20}
                  className="w-5 h-5 transition-transform duration-300 hover:rotate-180"
                />
                <span>LittlePlus</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Right section - positioned absolutely to the browser window edge */}
        <div className="absolute right-4 sm:right-6 lg:right-8 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 sm:space-x-2">
              <Link href={`/${locale}/discover`}>
                <button className="text-gray-700 hover:text-gray-900 font-medium text-xs sm:text-sm cursor-pointer px-2 sm:px-3 py-1 rounded-md hover:bg-gray-100 transition-colors">
                  <span className="hidden sm:inline">发现</span>
                  <span className="sm:hidden">发现</span>
                </button>
              </Link>

              <Link href={`/${locale}/practice/create`}>
                <button className="text-gray-700 hover:text-gray-900 font-medium text-xs sm:text-sm cursor-pointer px-2 sm:px-3 py-1 rounded-md hover:bg-gray-100 transition-colors">
                  <span className="hidden sm:inline">创建练习</span>
                  <span className="sm:hidden">创建</span>
                </button>
              </Link>

              <Link href={`/${locale}/practice/a4/create`}>
                <button className="text-gray-700 hover:text-gray-900 font-medium text-xs sm:text-sm cursor-pointer px-2 sm:px-3 py-1 rounded-md hover:bg-gray-100 transition-colors">
                  <span className="hidden sm:inline">A4 打印</span>
                  <span className="sm:hidden">A4</span>
                </button>
              </Link>

              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-gray-600 hover:text-gray-900 p-1.5 sm:p-2 rounded-md hover:bg-gray-100 transition-colors relative cursor-pointer"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  {/* 未读通知小红点 */}
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 bg-red-500 rounded-full hidden"></span>
                </button>

                {/* 通知弹窗 */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {/* 空状态内容 */}
                    <div className="py-12 sm:py-16 px-6 sm:px-8 text-center">
                      {/* 月亮和星星图标 */}
                      <div className="mb-4 sm:mb-6 flex justify-center">
                        <div className="relative">
                          {/* 月亮 */}
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 relative">
                            <div className="absolute top-1 right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white"></div>
                          </div>
                          {/* 星星 */}
                          <div className="absolute -top-1 -right-1">
                            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 fill-current" />
                          </div>
                        </div>
                      </div>

                      {/* 主要文字 */}
                      <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-2 sm:mb-3">这里很安静</h3>

                      {/* 副标题 */}
                      <p className="text-gray-500 text-xs sm:text-sm">创建练习并分享给好友。</p>
                    </div>
                  </div>
                )}
              </div>

              {user && <UserAvatarDropdown user={user} />}
        </div>
      </header>
    );
  }

  return null;
}