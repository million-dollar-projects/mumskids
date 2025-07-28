'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, X, Gift, Shuffle, UserCheck } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface Reward {
  id: string;
  text: string;
  emoji: string;
}

export interface RewardSelectorProps {
  rewards: Reward[];
  distributionMode: 'random' | 'choice' | 'all';
  onRewardsChange: (rewards: Reward[]) => void;
  onDistributionModeChange: (mode: 'random' | 'choice' | 'all') => void;
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

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <Gift className="w-5 h-5 text-gray-400" />
        <span className="font-medium">完成奖励(可选)</span>
      </div>

      <div className="space-y-4">
        {/* 添加奖励 */}
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowEmojiDialog(true)}
              className="shrink-0"
            >
              <span className="text-lg">{selectedEmoji}</span>
            </Button>
            <Input
              value={newRewardText}
              onChange={(e) => setNewRewardText(e.target.value)}
              placeholder="添加完成奖励..."
              onKeyDown={(e) => e.key === 'Enter' && addReward()}
              disabled={rewards.length >= maxRewards}
            />
            <Button
              onClick={addReward}
              disabled={!newRewardText.trim() || rewards.length >= maxRewards}
              variant="outline"
              size="icon"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {rewards.length >= maxRewards && (
            <p className="text-xs text-gray-500">最多可以添加 {maxRewards} 个奖励</p>
          )}
        </div>

        {/* 奖励列表 */}
        {rewards.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {rewards.map((reward) => (
                <Badge key={reward.id} variant="secondary" className="gap-2 text-sm">
                  <span>{reward.emoji}</span>
                  <span>{reward.text}</span>
                  <button
                    onClick={() => removeReward(reward.id)}
                    className="hover:text-red-500 transition-colors"
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
                  onValueChange={(value: 'random' | 'choice' | 'all') => onDistributionModeChange(value)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="random" id="random" checked={distributionMode === 'random'} />
                    <Label htmlFor="random" className="text-sm cursor-pointer flex items-center gap-1">
                      <Shuffle className="w-3 h-3" />
                      随机一个 - 系统随机选择一个奖励
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="choice" id="choice" />
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
    </div>
  );
} 