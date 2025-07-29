'use client'

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Plus, MapPin, Users, Clock, Settings, Target, Calculator, Timer, Globe, Lock, ChevronDown } from 'lucide-react';
import { PracticeCard } from '@/components/ui/practice-card';
import { useAuth } from '@/lib/auth/context';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PAGINATION_CONFIG } from '@/lib/pagination-config';

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
  rewards: string[];
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
  t: any;
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

  // 获取计算类型标签
  const getCalculationTypeLabel = (type: string) => {
    const labels = {
      'add': '加法',
      'sub': '减法',
      'addsub': '加减法'
    };
    return labels[type as keyof typeof labels] || type;
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
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1 text-gray-400" />
                            <span>完成次数: {practice.stats.completed_attempts}</span>
                          </div>
                          {practice.test_mode === 'timed' && practice.time_limit && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-blue-500" />
                              <span>{practice.time_limit}分钟限时</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/${locale}/practice/${practice.slug}`}>
                            <button className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors">
                              开始练习
                            </button>
                          </Link>
                          <Link href={`/${locale}/practice/${practice.slug}/edit`}>
                            <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors">
                              <Settings className="w-4 h-4 mr-1" />
                              管理
                            </button>
                          </Link>
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
                    className="px-6 py-3 text-gray-600 border-gray-300 hover:bg-gray-50 transition-all duration-200"
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
                    <button className="inline-flex items-center px-4 cursor-pointer py-2 bg-gray-200 opacity-70 hover:opacity-100 text-gray-700 font-medium rounded-lg hover:bg-gray-500 hover:text-white transition-colors">
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
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:w-[540px] p-0">
          {selectedPractice && (
            <>
              <SheetHeader className="p-6 pb-4">
                <div className="flex items-center space-x-3">
                  {selectedPractice.is_public ? (
                    <Globe className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                  <SheetTitle className="text-xl font-bold text-gray-900">
                    {selectedPractice.title}
                  </SheetTitle>
                </div>
              </SheetHeader>

              <div className="px-6 pb-6 space-y-6">
                {/* Practice Card */}
                <div className="flex justify-center">
                  <div className="w-48">
                    <PracticeCard
                      childName={selectedPractice.child_name}
                      difficulty={selectedPractice.difficulty}
                      calculationType={selectedPractice.calculation_type}
                      className="w-full h-48"
                      theme={selectedPractice.selected_theme}
                    />
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 px-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-700">计算难度</span>
                    </div>
                    <span className="text-gray-900 font-medium">
                      {getDifficultyLabel(selectedPractice.difficulty)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-blue-50 py-3 px-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calculator className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-700">计算方式</span>
                    </div>
                    <span className="text-gray-900 font-medium">
                      {getCalculationTypeLabel(selectedPractice.calculation_type)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-green-50 py-3 px-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Timer className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-700">练习方式</span>
                    </div>
                    <span className="text-gray-900 font-medium">
                      {selectedPractice.test_mode === 'normal'
                        ? `普通模式 (${selectedPractice.question_count}题)`
                        : `计时模式 (${selectedPractice.time_limit}分钟)`
                      }
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Stats */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">练习统计</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedPractice.stats.total_attempts}
                      </div>
                      <div className="text-sm text-gray-600">总尝试次数</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedPractice.stats.completed_attempts}
                      </div>
                      <div className="text-sm text-gray-600">完成次数</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedPractice.stats.average_score.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">平均分数</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedPractice.stats.best_score.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">最佳分数</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                {selectedPractice.description && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">练习描述</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedPractice.description}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Link href={`/${locale}/practice/${selectedPractice.slug}`} className="block">
                    <Button className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium">
                      开始练习
                    </Button>
                  </Link>
                  <Link href={`/${locale}/practice/${selectedPractice.slug}/edit`} className="block">
                    <Button variant="outline" className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Settings className="w-4 h-4 mr-2" />
                      管理练习
                    </Button>
                  </Link>
                </div>

                {/* Creation Info */}
                <div className="text-xs text-gray-500 text-center pt-4 border-t">
                  创建于 {new Date(selectedPractice.created_at).toLocaleString('zh-CN')}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}