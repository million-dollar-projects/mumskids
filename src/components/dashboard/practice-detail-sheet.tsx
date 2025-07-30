'use client'

import Link from 'next/link';
import { useState } from 'react';
import { Target, Calculator, Timer, Globe, Lock, Gift, Trash2, Copy, Check, Play } from 'lucide-react';
import { PracticeCard } from '@/components/ui/practice-card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RewardCondition {
  mode?: 'normal' | 'timed';
  // 计时模式
  minCorrect?: number;
  maxErrorRate?: number;
  // 普通模式
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

interface PracticeDetailSheetProps {
  practice: Practice | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
  onDelete?: (practiceId: string) => Promise<void>;
  currentUserId?: string;
}

export function PracticeDetailSheet({
  practice,
  isOpen,
  onOpenChange,
  locale,
  onDelete,
  currentUserId
}: PracticeDetailSheetProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
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

  // 处理删除练习
  const handleDelete = async () => {
    if (practice && onDelete && !isDeleting) {
      setIsDeleting(true);
      try {
        await onDelete(practice.id);
        setShowDeleteDialog(false);
        onOpenChange(false);
      } catch (error) {
        console.error('删除失败:', error);
        // 保持对话框打开，让用户可以重试
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // 处理复制练习链接
  const handleCopyLink = async () => {
    if (practice) {
      const practiceUrl = `${window.location.origin}/${locale}/practice/${practice.slug}`;
      try {
        await navigator.clipboard.writeText(practiceUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        console.error('复制失败:', error);
        // 降级方案：使用传统的复制方法
        const textArea = document.createElement('textarea');
        textArea.value = practiceUrl;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        } catch (fallbackError) {
          console.error('降级复制也失败:', fallbackError);
        }
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[460px] p-0 sm:right-2 sm:top-2">
        {practice && (
          <>
            <SheetHeader className="p-6 pb-4">
              <div className="flex items-center space-x-3">
                {practice.is_public ? (
                  <Globe className="w-5 h-5 text-blue-500" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-500" />
                )}
                <SheetTitle className="text-xl font-bold text-gray-900">
                  {practice.title}
                </SheetTitle>
              </div>
            </SheetHeader>

            <div className="px-6 pb-6 space-y-6">
              {/* Practice Card */}
              <div className="flex justify-center mt-2">
                <div className="w-32">
                  <PracticeCard
                    childName={practice.child_name}
                    difficulty={practice.difficulty}
                    calculationType={practice.calculation_type}
                    className="w-full h-32"
                    size="small"
                    theme={practice.selected_theme}
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between bg-purple-900/5 py-2 px-4 rounded">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-700">计算难度</span>
                  </div>
                  <span className="text-gray-900 font-medium">
                    {getDifficultyLabel(practice.difficulty)}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-purple-900/5 py-2 px-4 rounded">
                  <div className="flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">计算方式</span>
                  </div>
                  <span className="text-gray-900 font-medium">
                    {getCalculationTypeLabel(practice.calculation_type)}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-purple-900/5 py-2 px-4 rounded">
                  <div className="flex items-center gap-3">
                    <Timer className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-700">练习方式</span>
                  </div>
                  <span className="text-gray-900 font-medium">
                    {practice.test_mode === 'normal'
                      ? `普通模式 (${practice.question_count}题)`
                      : `计时模式 (${practice.time_limit}分钟)`
                    }
                  </span>
                </div>
              </div>

              {/* Rewards */}
              {practice.rewards && practice.rewards.length > 0 && (
                <>
                  <div className="space-y-4 bg-purple-900/5 py-2 px-4 rounded">
                    <div className=" p-0 rounded">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-700">
                          {practice.reward_distribution_mode === 'random' ? '随机奖励' : '自选奖励'}
                        </span>
                      </div>

                      <div className="space-y-3 bg-purple-900/5 py-2 px-4 rounded">
                        <div className="flex flex-wrap gap-2">
                          {practice.rewards.map((reward, index) => {
                            // Handle both string and object formats
                            const rewardText = typeof reward === 'string' ? reward : reward.text || reward.toString();
                            const rewardEmoji = typeof reward === 'object' && reward.emoji ? reward.emoji : '';

                            return (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white border border-yellow-200 text-gray-700"
                              >
                                {rewardEmoji && <span className="mr-1">{rewardEmoji}</span>}
                                {rewardText}
                              </span>
                            );
                          })}
                        </div>

                        {/* Display reward conditions below all rewards */}
                        {practice.reward_condition && (
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <div className="text-xs text-gray-500">
                              <Gift className="w-3 h-3 inline mr-1" />
                              获得条件: {(() => {
                                const condition = practice.reward_condition;
                                const parts = [];

                                // 处理计时模式的条件
                                if (condition.minCorrect) {
                                  parts.push(`最少完成${condition.minCorrect}题`);
                                  parts.push(`错误率不超过${condition.maxErrorRate}%`);
                                };

                                // 处理普通模式的条件
                                if (condition.targetCorrect) parts.push(`答对${condition.targetCorrect}题`);
                                if (condition.maxTime) parts.push(`${condition.maxTime}分钟内完成`);

                                return parts.join(', ');
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Description */}
              {practice.description && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">练习描述</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {practice.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Link target="_blank" href={`/${locale}/practice/${practice.slug}`} className="block">
                  <Button className="w-full h-10 bg-gray-900 hover:bg-gray-800 text-white font-medium cursor-pointer">
                    <Play className="w-4 h-4 mr-2" />
                    开始练习
                  </Button>
                </Link>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="h-10 px-4 border-blue-300 text-white bg-blue-400 hover:bg-blue-500 w-full cursor-pointer"
                    onClick={handleCopyLink}
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    复制链接
                  </Button>
                  {currentUserId && practice.created_by === currentUserId && (
                    <Button
                      variant="outline"
                      className="h-10 px-4 border-red-300 text-white bg-red-600 hover:bg-red-500 w-full cursor-pointer"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除
                    </Button>
                  )}
                </div>
              </div>


              {/* Delete Confirmation Dialog */}
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认删除练习</AlertDialogTitle>
                    <AlertDialogDescription>
                      您确定要删除练习「{practice.title}」吗？此操作无法撤销，所有相关的练习记录也将被删除。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <>
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                          删除中...
                        </>
                      ) : (
                        '确认删除'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Creation Info */}
              <div className="text-xs text-gray-500 text-center pt-4 border-t">
                创建于 {new Date(practice.created_at).toLocaleString('zh-CN')}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}