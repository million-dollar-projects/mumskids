'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, X, Gift, Shuffle, UserCheck, Lightbulb } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { defaultRewards } from '@/config/default-rewards';

interface Reward {
  id: string;
  text: string;
  emoji: string;
}

export interface RewardSelectorProps {
  rewards: Reward[];
  distributionMode: 'random' | 'choice';
  onRewardsChange: (rewards: Reward[]) => void;
  onDistributionModeChange: (mode: 'random' | 'choice') => void;
  maxRewards?: number;
}

export function RewardSelector({
  rewards,
  distributionMode,
  onRewardsChange,
  onDistributionModeChange,
  maxRewards = 5
}: RewardSelectorProps) {
  const [newRewardText, setNewRewardText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎁');
  const [showEmojiDialog, setShowEmojiDialog] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

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

  const addRecommendedReward = (recommendedReward: typeof defaultRewards[0]) => {
    if (rewards.length >= maxRewards) return;

    const newReward: Reward = {
      id: Date.now().toString(),
      text: recommendedReward.text,
      emoji: recommendedReward.emoji
    };

    onRewardsChange([...rewards, newReward]);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <Gift className="w-5 h-5 text-gray-400" />
        <span className="font-medium">完成奖励(可选)</span>
      </div>

      {/* Emoji选择对话框 */}
      <Dialog open={showEmojiDialog} onOpenChange={setShowEmojiDialog}>
        <DialogContent className="max-w-[430px] bg-white p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-lg font-bold">选择奖品符号</DialogTitle>
          </DialogHeader>

          <div className="p-2 pt-2">
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
              locale="en"
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
                <p className="text-sm font-medium mb-2">奖励发放方式：</p>
                <RadioGroup
                  value={distributionMode}
                  onValueChange={(value: 'random' | 'choice') => onDistributionModeChange(value)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="random" id="random" checked={distributionMode === 'random'} />
                    <Label htmlFor="random" className="text-sm cursor-pointer flex items-center gap-1">
                      <Shuffle className="w-3 h-3" />
                      随机一个 - 系统随机选择一个奖励
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="choice" id="choice" checked={distributionMode === 'choice'} />
                    <Label htmlFor="choice" className="text-sm cursor-pointer flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      自己选择 - 小朋友自己选择喜欢的奖励
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
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
                  placeholder:font-bold placeholder:text-[#1315175c] bg-purple-900/5'
              placeholder="添加完成奖励..."
              onKeyDown={(e) => e.key === 'Enter' && addReward()}
              disabled={rewards.length >= maxRewards}
            />
            <Button
              onClick={addReward}
              disabled={!newRewardText.trim() || rewards.length >= maxRewards}
              variant="outline"
              className="cursor-pointer bg-purple-900/5 border-none"
              size="icon"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {rewards.length >= maxRewards && (
            <p className="text-xs text-gray-500">最多可以添加 {maxRewards} 个奖励</p>
          )}

          {/* 推荐奖励按钮 */}
          {rewards.length < maxRewards && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 h-auto cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 mr-1" />
              {showRecommendations ? '收起推荐' : '查看推荐奖励'}
            </Button>
          )}

          {/* 推荐奖励列表 */}
          {showRecommendations && rewards.length < maxRewards && (
            <div className="bg-blue-50 p-3 rounded-lg space-y-3">
              <p className="text-sm font-medium text-blue-800 cursor-pointer">推荐奖励 (点击添加)：</p>
              <div className="grid grid-cols-1 gap-2 ">
                {defaultRewards
                  .filter(rec => !rewards.some(reward => reward.text === rec.text))
                  .slice(0, showAllRecommendations ? undefined : 8)
                  .map((recommendedReward, index) => (
                    <button
                      key={index}
                      onClick={() => addRecommendedReward(recommendedReward)}
                      className="flex items-center cursor-pointer gap-2 p-2 text-left hover:bg-blue-100 rounded transition-colors text-sm"
                      disabled={rewards.length >= maxRewards}
                    >
                      <span className="text-base">{recommendedReward.emoji}</span>
                      <span className="text-blue-700">{recommendedReward.text}</span>
                    </button>
                  ))}
              </div>
              {!showAllRecommendations && defaultRewards.filter(rec => !rewards.some(reward => reward.text === rec.text)).length > 8 && (
                <button
                  onClick={() => setShowAllRecommendations(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer hover:underline"
                >
                  还有更多推荐...
                </button>
              )}
              {showAllRecommendations && defaultRewards.filter(rec => !rewards.some(reward => reward.text === rec.text)).length > 8 && (
                <button
                  onClick={() => setShowAllRecommendations(false)}
                  className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer hover:underline"
                >
                  收起
                </button>
              )}
            </div>
          )}
        </div>

      </div>


    </div>
  );
} 