'use client'

import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, Users, Trophy, Target } from 'lucide-react';
import { PracticeCard } from '@/components/ui/practice-card';
import { Button } from '@/components/ui/button';
import { usePractices } from '@/lib/hooks/usePractices';
import { getDifficultyOptions } from '@/lib/practice-config';
import { Practice } from '@/types/practice';
import { PaginatedResponse } from '@/types/pagination';
import Link from 'next/link';

interface DiscoverPracticesProps {
  locale: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: Record<string, any>;
}

export function DiscoverPractices({ locale, t }: DiscoverPracticesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: practicesData,
    isLoading: practicesLoading,
    isFetchingNextPage: loadingMore,
    hasNextPage,
    fetchNextPage,
  } = usePractices('public');

  const difficultyOptions = getDifficultyOptions(locale);

  // 过滤练习
  const filteredPractices = useMemo(() => {
    if (!practicesData?.pages) return [];

    const allPractices = practicesData.pages.flatMap((page: unknown) =>
      (page as PaginatedResponse<Practice>).data
    );

    return allPractices.filter((practice: Practice) => {
      const matchesSearch = practice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        practice.child_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = selectedDifficulty === 'all' || practice.difficulty === selectedDifficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [practicesData, searchQuery, selectedDifficulty]);

  // 加载更多
  const loadMore = () => {
    if (!loadingMore && hasNextPage) {
      fetchNextPage();
    }
  };

  // 获取难度标签
  const getDifficultyLabel = (difficulty: string) => {
    const option = difficultyOptions.find(opt => opt.id === difficulty);
    return option?.label || difficulty;
  };

  // 格式化统计数据
  const formatStats = (practice: Practice) => {
    const stats = practice.stats;
    if (!stats || stats.total_attempts === 0) {
      return { attempts: 0, bestScore: null, averageScore: null };
    }

    return {
      attempts: stats.total_attempts,
      bestScore: stats.best_score,
      averageScore: Math.round(stats.average_score)
    };
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

  return (
    <div className="space-y-6">
      {/* Results Count */}
      {!practicesLoading && filteredPractices.length > 0 && (
        <div className="text-sm text-gray-600">
          找到 {filteredPractices.length} 个练习
        </div>
      )}

      {/* Loading State */}
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
      {!practicesLoading && filteredPractices.length > 0 && (
        <div className="animate-in fade-in-0 duration-300">
          <div className="space-y-4">
            {filteredPractices.map((practice: Practice) => {
              const stats = formatStats(practice);

              return (
                <div
                  key={practice.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    {/* Left side - Practice Info */}
                    <div className="flex-1">
                      {/* Creator and Date */}
                      <div className="text-sm text-gray-500 mb-2">
                        <span className="font-medium">{t.discover.createdBy} {practice.child_name}</span>
                        <span className="ml-4">{formatDate(practice.created_at)}</span>
                      </div>

                      {/* Practice Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {practice.title}
                      </h3>

                      {/* Description */}
                      {practice.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {practice.description}
                        </p>
                      )}

                      {/* Status Indicators */}
                      <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium text-xs">
                            {getDifficultyLabel(practice.difficulty)}
                          </span>
                        </div>
                        {practice.test_mode === 'timed' && practice.time_limit && (
                          <div className="flex items-center">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium text-xs">
                              {practice.time_limit}分钟限时
                            </span>
                          </div>
                        )}
                        {practice.test_mode === 'normal' && practice.question_count && (
                          <div className="flex items-center">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium text-xs">
                              {practice.question_count}道题目
                            </span>
                          </div>
                        )}
                        {/* Stats */}
                        {stats.attempts > 0 && (
                          <>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1 text-gray-400" />
                              <span>{stats.attempts}次练习</span>
                            </div>
                            {stats.bestScore !== null && (
                              <div className="flex items-center">
                                <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                                <span>最佳: {stats.bestScore}%</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Mobile Status Indicators */}
                      <div className="sm:hidden flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium text-xs">
                          {getDifficultyLabel(practice.difficulty)}
                        </span>
                        {practice.test_mode === 'timed' && practice.time_limit && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium text-xs">
                            {practice.time_limit}分钟
                          </span>
                        )}
                        {practice.test_mode === 'normal' && practice.question_count && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium text-xs">
                            {practice.question_count}题
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Link href={`/${locale}/practice/${practice.slug}`} target="_blank">
                          <button className="px-2 py-1 sm:px-4 text-sm sm:text-base bg-gray-800 text-white rounded font-medium hover:bg-gray-700 transition-colors cursor-pointer">
                            开始练习
                          </button>
                        </Link>
                      </div>
                    </div>

                    {/* Right side - Theme Icon */}
                    <div className="ml-6">
                      <PracticeCard
                        childName={practice.child_name}
                        difficulty={practice.difficulty}
                        calculationType={practice.calculation_type}
                        className="w-32 h-32"
                        size="small"
                        theme={practice.selected_theme}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Load More Button */}
      {!practicesLoading && hasNextPage && filteredPractices.length > 0 && (
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
                加载更多
              </>
            )}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!practicesLoading && filteredPractices.length === 0 && (
        <div className="text-center py-16">
          <div className="mx-auto w-48 h-48 mb-8 relative">
            <div className="w-full h-full bg-white border border-gray-200 shadow-lg opacity-50 rounded-2xl flex items-center justify-center relative">
              {/* Math symbols */}
              <div className="flex items-center justify-center space-x-3">
                <span className="text-3xl font-bold text-gray-400">?</span>
                <span className="text-3xl text-gray-300">+</span>
                <span className="text-3xl font-bold text-gray-400">?</span>
                <span className="text-3xl text-gray-300">=</span>
                <span className="text-3xl font-bold text-gray-300">?</span>
              </div>
              {/* Search icon */}
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-400 mb-4">
            {searchQuery || selectedDifficulty !== 'all' ? '没有找到匹配的练习' : t.discover.noResults}
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            {searchQuery || selectedDifficulty !== 'all'
              ? '尝试调整搜索条件或筛选器'
              : t.discover.noResultsDesc
            }
          </p>
          {(!searchQuery && selectedDifficulty === 'all') && (
            <Link href={`/${locale}/practice/create`}>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 cursor-pointer">
                创建第一个公开练习
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}