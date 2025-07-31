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

import { Practice, Reward, RewardCondition } from '@/types/practice';
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
        className="w-32 h-32"
        size="small"
        theme={practice.selected_theme}
      />
    );
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', {
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
      return '今天';
    }

    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
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
      // 找到要删除的练习
      let practiceToDelete: Practice | undefined;
      if (practicesData?.pages) {
        for (const page of practicesData.pages) {
          const found = (page as any)?.data?.find((p: Practice) => p.id === practiceId);
          if (found) {
            practiceToDelete = found;
            break;
          }
        }
      }
      
      if (!practiceToDelete) {
        console.error('Practice not found');
        return;
      }

      // 调用删除API
      const response = await fetch(`/api/practices/${practiceToDelete.slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete practice');
      }

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
    const labels = {
      'within10': '10以内',
      'within20': '20以内',
      'within50': '50以内',
      'within100': '100以内'
    };
    return labels[difficulty as keyof typeof labels] || difficulty;
  };

  return (
    <div className="min-h-screen">
      <Header locale={locale} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">练习</h1>
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
              我的练习
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
              公开练习
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
                    <div className="ml-6">
                      <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
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
                            <span>难度: {getDifficultyLabel(practice.difficulty)}</span>
                          </div>
                          {practice.test_mode === 'timed' && practice.time_limit && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-blue-500" />
                              <span>{practice.time_limit}分钟限时</span>
                            </div>
                          )}
                          {practice.test_mode === 'normal' && practice.question_count && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-green-500" />
                              <span>{practice.question_count}道题目</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 sm:space-x-3" onClick={(e) => e.stopPropagation()}>
                          <Link target="_blank" href={`/${locale}/practice/${practice.slug}`}>
                            <button className="px-2 py-1 sm:px-4 text-sm sm:text-base bg-gray-800 text-white rounded font-medium hover:bg-gray-700 transition-colors cursor-pointer">
                              开始练习
                            </button>
                          </Link>
                          <button
                            onClick={() => handlePracticeClick(practice)}
                            className="flex items-center px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 font-medium transition-colors cursor-pointer"
                          >
                            <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden sm:inline">查看详细</span>
                            <span className="sm:hidden">详细</span>
                          </button>
                        </div>
                      </div>

                      {/* Right side - Theme Icon */}
                      <div className="ml-6">
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
                        加载中...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        加载更多 ({(practicesData?.pages[practicesData.pages.length - 1] as PaginatedResponse<Practice>)?.pagination.totalCount - practicesData?.pages.reduce((total: number, page: unknown) => total + (page as PaginatedResponse<Practice>).data.length, 0)} 个剩余)
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Total Count Info */}
              {(practicesData?.pages[0] as PaginatedResponse<Practice>)?.pagination.totalCount > 0 && (
                <div className="text-center mt-4 text-sm text-gray-500">
                  显示 {practicesData?.pages.reduce((total: number, page: unknown) => total + (page as PaginatedResponse<Practice>).data.length, 0)} / {(practicesData?.pages[0] as PaginatedResponse<Practice>)?.pagination.totalCount} 个练习
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
                  {activeTab === 'my' ? '还没有数学练习' : '暂无公开练习'}
                </h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  {activeTab === 'my'
                    ? '为孩子创建第一个数学练习，让学习变得更有趣！'
                    : '目前还没有公开的练习，快去创建一个分享给大家吧！'
                  }
                </p>
                {activeTab === 'my' && (
                  <Link href={`/${locale}/practice/create`}>
                    <button className="inline-flex items-center px-4 cursor-pointer py-1 bg-gray-200 opacity-70 hover:opacity-100 text-gray-700 font-medium rounded-lg hover:bg-gray-500 hover:text-white transition-colors">
                      <Plus className="w-5 h-5 mr-2" />
                      创建练习
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