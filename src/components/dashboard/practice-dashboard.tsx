'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Plus, MapPin, Clock, Settings, ChevronDown } from 'lucide-react';
import { PracticeCard } from '@/components/ui/practice-card';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { PracticeDetailSheet } from './practice-detail-sheet';
import { usePractices } from '@/lib/hooks/usePractices';
import { useQueryClient } from '@tanstack/react-query';
import { getDifficultyOptions } from '@/lib/practice-config';
import { practiceService } from '@/lib/services/practice-service';

import { Practice } from '@/types/practice';
import { PaginatedResponse } from '@/types/pagination';

interface PracticeDashboardProps {
  locale: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: Record<string, any>; // 使用 Record<string, any> 来处理嵌套对象
}

export function PracticeDashboard({ locale, t }: PracticeDashboardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isTabChanging, setIsTabChanging] = useState(false);
  const {
    data: practicesData,
    isLoading: practicesLoading,
    isFetchingNextPage: loadingMore,
    hasNextPage,
    fetchNextPage,
  } = usePractices(activeTab, user?.id);

  // 当数据加载完成时，重置标签切换状态
  useEffect(() => {
    if (!practicesLoading && isTabChanging) {
      setIsTabChanging(false);
    }
  }, [practicesLoading, isTabChanging]);

  // 加载更多
  const loadMore = () => {
    if (!loadingMore && hasNextPage) {
      fetchNextPage();
    }
  };

  // 获取主题图标
  const getThemeIcon = (practice: Practice) => {
    return (
      <PracticeCard
        childName={practice.child_name}
        difficulty={practice.difficulty}
        calculationType={practice.calculation_type}
        className="w-24 h-24 sm:w-32 sm:h-32"
        size="small"
        theme={practice.selected_theme}
      />
    );
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return t.practice.dashboard.today;
    }

    const weekdays = [
      t.practice.dashboard.weekdays.sunday,
      t.practice.dashboard.weekdays.monday,
      t.practice.dashboard.weekdays.tuesday,
      t.practice.dashboard.weekdays.wednesday,
      t.practice.dashboard.weekdays.thursday,
      t.practice.dashboard.weekdays.friday,
      t.practice.dashboard.weekdays.saturday
    ];
    return weekdays[date.getDay()];
  };

  // 处理点击练习项
  const handlePracticeClick = (practice: Practice) => {
    setSelectedPractice(practice);
    setSheetOpen(true);
  };

  // 处理删除练习
  const handleDeletePractice = async (practiceId: string) => {
    try {
      if (!user?.id) {
        throw new Error('用户未登录');
      }

      // 使用练习服务删除练习
      await practiceService.deletePractice(practiceId, user.id);

      // 通知 React Query 重新获取数据
      queryClient.invalidateQueries({ queryKey: ['practices'] });

      console.log('练习删除成功');
    } catch (error) {
      console.error('删除练习失败:', error);
      // 这里可以添加错误提示，比如使用 toast 或者其他通知方式
      alert('删除失败，请稍后重试');
    }
  };

  // 获取难度标签
  const getDifficultyLabel = (difficulty: string) => {
    const difficultyOptions = getDifficultyOptions(locale);
    const option = difficultyOptions.find(opt => opt.id === difficulty);
    return option?.label || difficulty;
  };

  return (
    <div className="min-h-screen">
      <Header locale={locale} isFixed={true} />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-20">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t.practice.dashboard.pageTitle}</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                if (activeTab !== 'my' && !isTabChanging) {
                  setIsTabChanging(true);
                  setActiveTab('my');
                }
              }}
              disabled={isTabChanging}
              className={`px-4 py-1 cursor-pointer rounded-lg font-medium transition-all duration-200 ${activeTab === 'my'
                ? 'bg-gray-100 text-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
                } ${isTabChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {t.practice.dashboard.myPractices}
            </button>
            <button
              onClick={() => {
                if (activeTab !== 'public' && !isTabChanging) {
                  setIsTabChanging(true);
                  setActiveTab('public');
                }
              }}
              disabled={isTabChanging}
              className={`px-4 py-1 cursor-pointer rounded-lg font-medium transition-all duration-200 ${activeTab === 'public'
                ? 'bg-gray-100 text-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
                } ${isTabChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {t.practice.dashboard.publicPractices}
            </button>
          </div>
        </div>

        {/* Content Container with Fixed Min Height */}
        <div className="min-h-[600px] relative transition-all duration-300">
          {/* Skeleton Loading */}
          {practicesLoading && (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-48 mb-3"></div>
                      <div className="flex space-x-4 mb-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="flex space-x-3">
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="ml-4 sm:ml-6 flex-shrink-0">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Practice List */}
          {!practicesLoading && (practicesData?.pages[0] as PaginatedResponse<Practice>)?.data.length > 0 && (
            <div className="animate-in fade-in-0 duration-300">
              <div className="space-y-4">
                {practicesData?.pages.map((page: unknown) => (page as PaginatedResponse<Practice>).data.map((practice: Practice) => (
                  <div
                    key={practice.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handlePracticeClick(practice)}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left side - Date and Practice Info */}
                      <div className="flex-1">
                        {/* Date and Time */}
                        <div className="text-sm text-gray-500 mb-2">
                          <span className="font-medium">{formatDate(practice.created_at)}</span>
                          <span className="ml-4">{formatTime(practice.created_at)}</span>
                        </div>

                        {/* Practice Title */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {practice.title}
                        </h3>

                        {/* Status Indicators */}
                        <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-orange-500" />
                            <span>{t.practice.dashboard.difficulty} {getDifficultyLabel(practice.difficulty)}</span>
                          </div>
                          {practice.test_mode === 'timed' && practice.time_limit && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-blue-500" />
                              <span>{practice.time_limit}{t.practice.dashboard.timeLimit}</span>
                            </div>
                          )}
                          {practice.test_mode === 'normal' && practice.question_count && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-green-500" />
                              <span>{practice.question_count}{t.practice.dashboard.questions}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 sm:space-x-3" onClick={(e) => e.stopPropagation()}>
                          <Link target="_blank" href={`/${locale}/practice/${practice.slug}`}>
                            <button className="px-2 py-1 sm:px-4 text-sm sm:text-base bg-gray-800 text-white rounded font-medium hover:bg-gray-700 transition-colors cursor-pointer">
                              {t.practice.dashboard.startPractice}
                            </button>
                          </Link>
                          <button
                            onClick={() => handlePracticeClick(practice)}
                            className="flex items-center px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 font-medium transition-colors cursor-pointer"
                          >
                            <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden sm:inline">{t.practice.dashboard.viewDetails}</span>
                            <span className="sm:hidden">{t.practice.dashboard.viewDetailsShort}</span>
                          </button>
                        </div>
                      </div>

                      {/* Right side - Theme Icon */}
                      <div className="ml-4 sm:ml-6 flex-shrink-0">
                        {getThemeIcon(practice)}
                      </div>
                    </div>
                  </div>
                )))}
              </div>

              {/* Load More Button */}
              {hasNextPage && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={loadMore}
                    disabled={loadingMore}
                    variant="outline"
                    className="px-6 py-3 text-gray-600 border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent mr-2"></div>
                        {t.practice.dashboard.loadingMore}
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        {t.practice.dashboard.loadMore} ({((practicesData?.pages[0] as PaginatedResponse<Practice>)?.pagination.totalCount || 0) - (practicesData?.pages?.reduce((total: number, page: unknown) => total + (page as PaginatedResponse<Practice>).data.length, 0) || 0)} {t.practice.dashboard.remaining})
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Total Count Info */}
              {(practicesData?.pages[0] as PaginatedResponse<Practice>)?.pagination.totalCount > 0 && (
                <div className="text-center mt-4 text-sm text-gray-500">
                  {t.practice.dashboard.showing} {(practicesData?.pages?.reduce((total: number, page: unknown) => total + (page as PaginatedResponse<Practice>).data.length, 0) || 0)} {t.practice.dashboard.of} {((practicesData?.pages[0] as PaginatedResponse<Practice>)?.pagination.totalCount || 0)} {t.practice.dashboard.practices}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!practicesLoading && (practicesData?.pages[0] as PaginatedResponse<Practice>)?.data.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center animate-in fade-in-0 duration-300">
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
                <h2 className="text-2xl font-semibold text-gray-400 mb-4">
                  {activeTab === 'my' ? t.practice.dashboard.noMyPractices : t.practice.dashboard.noPublicPractices}
                </h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  {activeTab === 'my'
                    ? t.practice.dashboard.noMyPracticesDesc
                    : t.practice.dashboard.noPublicPracticesDesc
                  }
                </p>
                {activeTab === 'my' && (
                  <Link href={`/${locale}/practice/create`}>
                    <button className="inline-flex items-center px-4 cursor-pointer py-1 bg-gray-200 opacity-70 hover:opacity-100 text-gray-700 font-medium rounded-lg hover:bg-gray-500 hover:text-white transition-colors">
                      <Plus className="w-5 h-5 mr-2" />
                      {t.practice.dashboard.createPractice}
                    </button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer locale={locale} />

      {/* Practice Detail Sheet */}
      <PracticeDetailSheet
        practice={selectedPractice}
        isOpen={sheetOpen}
        onOpenChange={setSheetOpen}
        locale={locale}
        onDelete={handleDeletePractice}
        currentUserId={user?.id}
      />
    </div>
  );
}