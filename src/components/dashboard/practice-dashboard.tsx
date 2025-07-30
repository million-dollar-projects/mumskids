'use client'

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Plus, MapPin, Clock, Settings, ChevronDown } from 'lucide-react';
import { PracticeCard } from '@/components/ui/practice-card';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { PAGINATION_CONFIG } from '@/lib/pagination-config';
import { PracticeDetailSheet } from './practice-detail-sheet';

interface RewardCondition {
  mode?: 'normal' | 'timed';
  minCorrect?: number;
  maxErrorRate?: number;
  targetCorrect?: number;
  maxTime?: number;
}

interface Reward {
  id?: string;
  text: string;
  emoji?: string;
}

interface Practice {
  id: string;
  slug: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  title: string;
  description: string;
  child_name: string;
  gender: 'boy' | 'girl';
  difficulty: 'within10' | 'within20' | 'within50' | 'within100';
  calculation_type: 'add' | 'sub' | 'addsub';
  test_mode: 'normal' | 'timed';
  question_count: number | null;
  time_limit: number | null;
  is_public: boolean;
  selected_theme: string;
  reward_distribution_mode: 'random' | 'choice';
  rewards: (string | Reward)[];
  reward_condition?: RewardCondition | null;
  stats: {
    total_attempts: number;
    completed_attempts: number;
    average_score: number;
    best_score: number;
    best_time: number | null;
  };
}

interface PracticeDashboardProps {
  locale: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: Record<string, any>; // 使用 Record<string, any> 来处理嵌套对象
}

export function PracticeDashboard({ locale, t }: PracticeDashboardProps) {
  const { user } = useAuth();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [practicesLoading, setPracticesLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const lastFetchRef = useRef<{ userId: string | undefined, tab: string } | null>(null);
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    hasMore: false,
    totalCount: 0
  });

  // 获取练习列表
  const fetchPractices = useCallback(async (type: 'my' | 'public', page: number = 1, append: boolean = false) => {
    if (!user && type === 'my') return;

    if (page === 1) {
      setPracticesLoading(true);
      setIsTabChanging(false);
    } else {
      setLoadingMore(true);
    }

    try {
      const queryParams = new URLSearchParams();
      if (type === 'my') {
        queryParams.set('type', 'user');
        queryParams.set('userId', user!.id);
      } else {
        queryParams.set('type', 'public');
      }
      queryParams.set('page', page.toString());
      queryParams.set('limit', PAGINATION_CONFIG.PRACTICES_PER_PAGE.toString());

      const response = await fetch(`/api/practices?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch practices');
      }

      const result = await response.json();

      if (append && page > 1) {
        setPractices(prev => [...prev, ...result.data]);
      } else {
        setPractices(result.data);
      }

      setPagination({
        page: result.pagination.page,
        hasMore: result.pagination.hasMore,
        totalCount: result.pagination.totalCount
      });
    } catch (error) {
      console.error('获取练习列表失败:', error);
      if (!append) {
        setPractices([]);
        setPagination({ page: 1, hasMore: false, totalCount: 0 });
      }
    } finally {
      setPracticesLoading(false);
      setLoadingMore(false);
    }
  }, [user?.id]); // 只依赖 user.id 而不是整个 user 对象

  // 加载更多
  const loadMore = useCallback(() => {
    if (!loadingMore && pagination.hasMore) {
      fetchPractices(activeTab, pagination.page + 1, true);
    }
  }, [fetchPractices, activeTab, pagination.page, pagination.hasMore, loadingMore]);

  // 当用户登录状态改变或标签页切换时获取练习
  useEffect(() => {
    if (user?.id) {
      // 检查是否需要重新获取数据
      const currentFetch = { userId: user.id, tab: activeTab };
      const lastFetch = lastFetchRef.current;

      if (!lastFetch || lastFetch.userId !== currentFetch.userId || lastFetch.tab !== currentFetch.tab) {
        lastFetchRef.current = currentFetch;
        // 重置分页状态
        setPagination({ page: 1, hasMore: false, totalCount: 0 });
        fetchPractices(activeTab, 1, false);
      }
    }
  }, [user?.id, activeTab, fetchPractices]);

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
      const practiceToDelete = practices.find(p => p.id === practiceId);
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

      // 从本地状态中移除已删除的练习
      setPractices(prev => prev.filter(p => p.id !== practiceId));

      // 更新总数
      setPagination(prev => ({
        ...prev,
        totalCount: prev.totalCount - 1
      }));

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
          {!practicesLoading && practices.length > 0 && (
            <div className="animate-in fade-in-0 duration-300">
              <div className="space-y-4">
                {practices.map((practice) => (
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
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
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
                        <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                          <Link target="_blank" href={`/${locale}/practice/${practice.slug}`}>
                            <button className="px-4 py-1 bg-gray-800 text-white rounded font-medium hover:bg-gray-700 transition-colors cursor-pointer">
                              开始练习
                            </button>
                          </Link>
                          <button
                            onClick={() => handlePracticeClick(practice)}
                            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors cursor-pointer"
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            查看详细
                          </button>
                        </div>
                      </div>

                      {/* Right side - Theme Icon */}
                      <div className="ml-6">
                        {getThemeIcon(practice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {pagination.hasMore && (
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
                        加载更多 ({pagination.totalCount - practices.length} 个剩余)
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Total Count Info */}
              {pagination.totalCount > 0 && (
                <div className="text-center mt-4 text-sm text-gray-500">
                  显示 {practices.length} / {pagination.totalCount} 个练习
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!practicesLoading && practices.length === 0 && (
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