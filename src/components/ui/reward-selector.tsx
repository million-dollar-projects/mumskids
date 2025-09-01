'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, X, Gift, Shuffle, UserCheck, Lightbulb, Settings } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { defaultRewards } from '@/config/default-rewards';
import { Reward, RewardCondition } from '@/types/practice';
import { messages } from '@/i18n/messages';

export interface RewardSelectorProps {
  rewards: Reward[];
  distributionMode: 'random' | 'choice';
  onRewardsChange: (rewards: Reward[]) => void;
  onDistributionModeChange: (mode: 'random' | 'choice') => void;
  onRewardConditionChange?: (condition: RewardCondition) => void;
  maxRewards?: number;
  testMode: 'normal' | 'timed';
  questionCount?: number;
  timeLimit?: number;
  locale?: string;
}

export function RewardSelector({
  rewards,
  distributionMode,
  onRewardsChange,
  onDistributionModeChange,
  onRewardConditionChange,
  maxRewards = 5,
  testMode,
  questionCount = 10,
  timeLimit = 2,
  locale = 'zh'
}: RewardSelectorProps) {
  const [newRewardText, setNewRewardText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎁');
  const [showEmojiDialog, setShowEmojiDialog] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const [pendingRewards, setPendingRewards] = useState<(typeof defaultRewards[0])[]>([]);
  const [showConditionDialog, setShowConditionDialog] = useState(false);

  const t = messages[locale as keyof typeof messages] || messages.zh;

  const [rewardCondition, setRewardCondition] = useState<RewardCondition>(() => {
    if (testMode === 'timed') {
      // 计时模式：基于时间限制计算合理的最少题数
      // 假设每题20秒，时间限制内应该能完成的题数的70%作为最少要求
      const expectedQuestions = Math.floor(timeLimit * 3); // 每分钟3题
      const minQuestions = Math.max(5, Math.ceil(expectedQuestions * 0.7)); // 至少5题，70%完成率
      return {
        mode: 'timed',
        minCorrect: minQuestions,
        maxErrorRate: 20 // 20%错误率
      };
    } else {
      // 普通模式：每道题预估20秒，总时间向上取整到分钟
      const estimatedMinutes = Math.max(1, Math.ceil(questionCount * 0.33)); // 每题20秒
      return {
        mode: 'normal',
        targetCorrect: Math.max(1, Math.ceil(questionCount * 0.8)), // 至少1题，80%正确率
        maxTime: estimatedMinutes
      };
    }
  });

  // 初始化时设置默认奖励条件
  useEffect(() => {
    const initialCondition = testMode === 'timed'
      ? {
        mode: 'timed' as const,
        minCorrect: Math.max(5, Math.ceil(timeLimit * 3 * 0.7)), // 基于时间限制计算，至少5题
        maxErrorRate: 20 // 20%错误率
      }
      : {
        mode: 'normal' as const,
        targetCorrect: Math.max(1, Math.ceil(questionCount * 0.8)), // 至少1题，80%正确率
        maxTime: Math.max(1, Math.ceil(questionCount * 0.33)) // 每题20秒，向上取整到分钟
      };
    onRewardConditionChange?.(initialCondition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时执行一次

  // 当练习方式改变时，更新默认条件
  useEffect(() => {
    const newCondition = testMode === 'timed'
      ? {
        mode: 'timed' as const,
        minCorrect: Math.max(5, Math.ceil(timeLimit * 3 * 0.7)), // 基于时间限制计算，至少5题
        maxErrorRate: 20 // 20%错误率
      }
      : {
        mode: 'normal' as const,
        targetCorrect: Math.max(1, Math.ceil(questionCount * 0.8)), // 至少1题，80%正确率
        maxTime: Math.max(1, Math.ceil(questionCount * 0.33)) // 每题20秒，向上取整到分钟
      };
    setRewardCondition(newCondition);
    // 自动调用回调函数，确保父组件获得默认值
    onRewardConditionChange?.(newCondition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testMode, questionCount, timeLimit]); // 移除 onRewardConditionChange 避免无限循环

  const addReward = () => {
    if (!newRewardText.trim() || rewards.length >= maxRewards) return;

    const newReward: Reward = {
      id: Date.now().toString(),
      text: newRewardText.trim(),
      emoji: selectedEmoji
    };

    onRewardsChange([...rewards, newReward]);
    setNewRewardText('');
    setSelectedEmoji('🎁');
  };

  const removeReward = (id: string) => {
    onRewardsChange(rewards.filter(reward => reward.id !== id));
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    setSelectedEmoji(emoji.native);
    setShowEmojiDialog(false);
  };

  const togglePendingReward = (recommendedReward: typeof defaultRewards[0]) => {
    const isAlreadyPending = pendingRewards.some(reward => reward.text === recommendedReward.text);
    if (isAlreadyPending) {
      setPendingRewards(prev => prev.filter(reward => reward.text !== recommendedReward.text));
    } else {
      if (rewards.length + pendingRewards.length < maxRewards) {
        setPendingRewards(prev => [...prev, recommendedReward]);
      }
    }
  };

  const confirmPendingRewards = () => {
    const newRewards = pendingRewards.map(reward => ({
      id: Date.now().toString() + Math.random(),
      text: reward.text,
      emoji: reward.emoji
    }));

    onRewardsChange([...rewards, ...newRewards]);
    setPendingRewards([]);
    setShowRecommendations(false);
    setShowAllRecommendations(false);
  };

  const cancelPendingRewards = () => {
    setPendingRewards([]);
    setShowRecommendations(false);
    setShowAllRecommendations(false);
  };



  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <Gift className="w-5 h-5 text-gray-400" />
        <span className="font-medium">{t.practice.rewardSelector.title}</span>
      </div>

      {/* Emoji选择对话框 */}
      <Dialog open={showEmojiDialog} onOpenChange={setShowEmojiDialog}>
        <DialogContent className="max-w-[430px] bg-white p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-lg font-bold">{t.practice.rewardSelector.selectEmoji}</DialogTitle>
          </DialogHeader>

          <div className="p-2 pt-2">
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
              locale={locale === 'zh' ? 'zh' : 'en'}
              previewPosition="none"
              searchPosition="top"
              maxFrequentRows={2}
              perLine={12}
              set="native"
              emojiSize={24}
              emojiButtonSize={32}
            />
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">

        {/* 奖励列表 */}
        {rewards.length > 0 && (
          <div className="space-y-3 bg-purple-900/5 p-3 rounded-lg ">
            <div className="flex flex-wrap gap-2 cursor-pointer">
              {rewards.map((reward) => (
                <Badge key={reward.id} variant="secondary" className="gap-2 text-sm">
                  <span>{reward.emoji}</span>
                  <span>{reward.text}</span>
                  <button
                    onClick={() => removeReward(reward.id)}
                    className="hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {/* 发放方式选择 */}
            {rewards.length > 1 && (
              <div className="bg-purple-900/5 p-3 rounded-lg">
                <p className="text-sm font-medium mb-2">{t.practice.rewardSelector.distributionMode}</p>
                <RadioGroup
                  value={distributionMode}
                  onValueChange={(value: 'random' | 'choice') => onDistributionModeChange(value)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="random" id="random" checked={distributionMode === 'random'} />
                    <Label htmlFor="random" className="text-sm cursor-pointer flex items-center gap-1">
                      <Shuffle className="w-3 h-3" />
                      {t.practice.rewardSelector.randomMode}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="choice" id="choice" checked={distributionMode === 'choice'} />
                    <Label htmlFor="choice" className="text-sm cursor-pointer flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      {t.practice.rewardSelector.choiceMode}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* 默认奖励条件显示 */}
            <div className="bg-purple-900/5 p-2 rounded">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-gray-600">
                    {testMode === 'normal'
                      ? t.practice.rewardSelector.normalModeDesc
                          .replace('{target}', (rewardCondition.targetCorrect || Math.max(1, Math.ceil(questionCount * 0.8))).toString())
                          .replace('{time}', (rewardCondition.maxTime || Math.max(1, Math.ceil(questionCount * 0.5))).toString())
                      : t.practice.rewardSelector.timedModeDesc
                          .replace('{timeLimit}', timeLimit.toString())
                          .replace('{minCorrect}', (rewardCondition.minCorrect || Math.max(5, Math.ceil(timeLimit * 3 * 0.7))).toString())
                          .replace('{errorRate}', (rewardCondition.maxErrorRate !== undefined ? rewardCondition.maxErrorRate : 20).toString())
                    }
                    {t.practice.rewardSelector.rewardCondition}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConditionDialog(true)}
                  className="text-gray-600 hover:text-gray-700 hover:bg-blue-50 p-1 h-auto cursor-pointer"
                  title={t.practice.rewardSelector.modifyCondition}
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* 添加奖励 */}

        <div className="space-y-3">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowEmojiDialog(true)}
              className="shrink-0 cursor-pointer bg-purple-900/5 border-none"
            >
              <span className="text-lg">{selectedEmoji}</span>
            </Button>
            <Input
              value={newRewardText}
              onChange={(e) => setNewRewardText(e.target.value)}
              className='w-full border-none shadow-none outline-none px-2 py-2 h-auto focus-visible:ring-0 bg-transparent 
                  placeholder:font-bold placeholder:text-[#1315175c] bg-purple-900/5 cursor-pointer'
              placeholder={t.practice.rewardSelector.customRewardPlaceholder}
              onKeyDown={(e) => e.key === 'Enter' && addReward()}
              disabled={rewards.length >= maxRewards}
            />
            <Button
              onClick={addReward}
              disabled={!newRewardText.trim() || rewards.length >= maxRewards}
              variant="outline"
              className="cursor-pointer bg-purple-900/5 border-none cursor-pointer"
              size="icon"
            >
              <Plus className="w-4 h-4 cursor-pointer" />
            </Button>
            {rewards.length < maxRewards && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowRecommendations(true)}
                className="cursor-pointer bg-purple-900/5 border-none text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Lightbulb className="w-4 h-4" />
              </Button>
            )}
          </div>

          {rewards.length >= maxRewards && (
            <p className="text-xs text-gray-500">{t.practice.rewardSelector.maxRewards.replace('{count}', maxRewards.toString())}</p>
          )}

          {/* 推荐奖励 Dialog */}
          <Dialog open={showRecommendations} onOpenChange={cancelPendingRewards}>
            <DialogContent className="max-w-[500px] bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{t.practice.rewardSelector.recommendedRewards}</DialogTitle>
                {/* 预选择的奖励显示 */}
                {pendingRewards.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">{t.practice.rewardSelector.selectedRewards}</p>
                    <div className="flex flex-wrap gap-2">
                      {pendingRewards.map((reward, index) => (
                        <Badge key={index} variant="secondary" className="gap-2 text-sm bg-blue-100 text-blue-800">
                          <span>{reward.emoji}</span>
                          <span>{reward.text}</span>
                          <button
                            onClick={() => togglePendingReward(reward)}
                            className="hover:text-red-500 transition-colors cursor-pointer ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">{t.practice.rewardSelector.clickToSelect}{pendingRewards.length > 0 ? t.practice.rewardSelector.multipleSelect : ''}：</p>
                <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                  {defaultRewards
                    .filter(rec => !rewards.some(reward => reward.text === rec.text))
                    .slice(0, showAllRecommendations ? undefined : 12)
                    .map((recommendedReward, index) => {
                      const isSelected = pendingRewards.some(reward => reward.text === recommendedReward.text);
                      const isDisabled = !isSelected && (rewards.length + pendingRewards.length >= maxRewards);

                      return (
                        <button
                          key={index}
                          onClick={() => togglePendingReward(recommendedReward)}
                          className={`flex items-center cursor-pointer gap-3 p-3 text-left rounded-lg transition-colors text-sm border ${isSelected
                            ? 'bg-blue-50 border-blue-200 text-blue-800'
                            : isDisabled
                              ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                              : 'border-gray-100 hover:bg-blue-50 hover:border-blue-200'
                            }`}
                          disabled={isDisabled}
                        >
                          <span className="text-xl">{recommendedReward.emoji}</span>
                          <span className="font-medium flex-1">{recommendedReward.text}</span>
                          {isSelected && <span className="text-blue-600 text-xs">{t.practice.rewardSelector.selected}</span>}
                        </button>
                      );
                    })}
                </div>
                {!showAllRecommendations && defaultRewards.filter(rec => !rewards.some(reward => reward.text === rec.text)).length > 12 && (
                  <button
                    onClick={() => setShowAllRecommendations(true)}
                    className="text-sm text-gray-600 hover:text-gray-700 cursor-pointer hover:underline w-full text-center py-2"
                  >
                    {t.practice.rewardSelector.showMore}
                  </button>
                )}
                {showAllRecommendations && defaultRewards.filter(rec => !rewards.some(reward => reward.text === rec.text)).length > 12 && (
                  <button
                    onClick={() => setShowAllRecommendations(false)}
                    className="text-sm text-gray-600 hover:text-gray-700 cursor-pointer hover:underline w-full text-center py-2"
                  >
                    {t.practice.rewardSelector.showLess}
                  </button>
                )}
              </div>
              <DialogFooter className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={cancelPendingRewards}
                  className="cursor-pointer flex-1"
                >
                  {t.practice.rewardSelector.cancel}
                </Button>
                <Button
                  onClick={confirmPendingRewards}
                  disabled={pendingRewards.length === 0}
                  className="cursor-pointer bg-gray-900 hover:bg-gray-700 text-white flex-1"
                >
                  {t.practice.rewardSelector.confirmAdd} {pendingRewards.length > 0 && `(${pendingRewards.length})`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 奖励条件设置 Dialog */}
          <Dialog open={showConditionDialog} onOpenChange={setShowConditionDialog}>
            <DialogContent className="max-w-[500px] bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{t.practice.rewardSelector.setRewardCondition}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* 当前练习模式显示 */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-base font-medium mb-2 block">{t.practice.rewardSelector.currentPracticeMode}</Label>
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-2 rounded-md text-sm font-medium ${testMode === 'normal'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                      }`}>
                      {testMode === 'normal' ? t.practice.rewardSelector.normalMode : t.practice.rewardSelector.timedMode}
                    </div>
                    <span className="text-gray-600 text-sm">
                      {testMode === 'normal'
                        ? `${questionCount} ${t.practice.createPractice.questions}`
                        : `${timeLimit} ${t.practice.createPractice.minutes}`
                      }
                    </span>
                  </div>
                </div>

                {/* 一般模式设置 */}
                {testMode === 'normal' && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">{t.practice.rewardSelector.targetCorrectQuestions}</Label>
                        <Input
                          type="number"
                          value={rewardCondition.targetCorrect || 8}
                          onChange={(e) => setRewardCondition(prev => ({
                            ...prev,
                            targetCorrect: parseInt(e.target.value) || 8
                          }))}
                          className="mt-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                          min="1"
                          max={questionCount}
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">{t.practice.rewardSelector.timeoutMinutes}</Label>
                        <Input
                          type="number"
                          value={rewardCondition.maxTime || 3}
                          onChange={(e) => setRewardCondition(prev => ({
                            ...prev,
                            maxTime: parseInt(e.target.value) || 3
                          }))}
                          className="mt-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                          min="1"
                          max="60"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-blue-600">
                      {t.practice.rewardSelector.normalModeDesc
                        .replace('{target}', (rewardCondition.targetCorrect || 8).toString())
                        .replace('{time}', (rewardCondition.maxTime || 3).toString())
                      }
                    </p>
                  </div>
                )}

                {/* 计时模式设置 */}
                {testMode === 'timed' && (
                  <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">{t.practice.rewardSelector.minQuestions}</Label>
                        <Input
                          type="number"
                          value={rewardCondition.minCorrect || 10}
                          onChange={(e) => setRewardCondition(prev => ({
                            ...prev,
                            minCorrect: parseInt(e.target.value) || 10
                          }))}
                          className="mt-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                          min="1"
                          max="100"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">{t.practice.rewardSelector.maxErrorRate}</Label>
                        <Input
                          type="number"
                          value={rewardCondition.maxErrorRate !== undefined ? rewardCondition.maxErrorRate : 20}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 20 : parseInt(e.target.value);
                            setRewardCondition(prev => ({
                              ...prev,
                              maxErrorRate: isNaN(value) ? 20 : value
                            }));
                          }}
                          className="mt-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-green-600">
                      {t.practice.rewardSelector.timedModeDesc
                        .replace('{timeLimit}', timeLimit.toString())
                        .replace('{minCorrect}', (rewardCondition.minCorrect || 10).toString())
                        .replace('{errorRate}', (rewardCondition.maxErrorRate !== undefined ? rewardCondition.maxErrorRate : 20).toString())
                      }
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConditionDialog(false)}
                  className="cursor-pointer flex-1"
                >
                  {t.practice.rewardSelector.cancel}
                </Button>
                <Button
                  onClick={() => {
                    onRewardConditionChange?.(rewardCondition);
                    setShowConditionDialog(false);
                  }}
                  className="cursor-pointer bg-gray-900 hover:bg-gray-700 text-white flex-1"
                >
                  {t.practice.rewardSelector.confirm}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

      </div>


    </div>
  );
} 