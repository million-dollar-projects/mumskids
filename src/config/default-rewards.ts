export interface DefaultReward {
  text: string;
  emoji: string;
  category: 'entertainment' | 'food' | 'activity' | 'privilege';
}

interface LocalizedRewardDef {
  key: keyof typeof import('@/i18n/messages').messages.zh.rewards.defaults;
  emoji: string;
  category: 'entertainment' | 'food' | 'activity' | 'privilege';
}

import { messages } from '@/i18n/messages';

const rewardDefs: LocalizedRewardDef[] = [
  // entertainment
  { key: 'watchTv10m', emoji: '📺', category: 'entertainment' },
  { key: 'tablet15m', emoji: '📱', category: 'entertainment' },
  { key: 'cartoonEpisode', emoji: '🎬', category: 'entertainment' },
  { key: 'listenStory15m', emoji: '📚', category: 'entertainment' },
  { key: 'playGame20m', emoji: '🎮', category: 'entertainment' },
  // food
  { key: 'cookie', emoji: '🍪', category: 'food' },
  { key: 'candy', emoji: '🍬', category: 'food' },
  { key: 'juice', emoji: '🧃', category: 'food' },
  { key: 'cupcake', emoji: '🧁', category: 'food' },
  { key: 'chooseSnack', emoji: '🍿', category: 'food' },
  // activity
  { key: 'playWithDad', emoji: '👨‍👧', category: 'activity' },
  { key: 'drawWithMom', emoji: '🎨', category: 'activity' },
  { key: 'park30m', emoji: '🏞️', category: 'activity' },
  { key: 'bike15m', emoji: '🚲', category: 'activity' },
  { key: 'videoChatFriends', emoji: '📞', category: 'activity' },
  // privilege
  { key: 'sleepLate10m', emoji: '🌙', category: 'privilege' },
  { key: 'chooseClothes', emoji: '👕', category: 'privilege' },
  { key: 'decideDinner', emoji: '🍽️', category: 'privilege' },
  { key: 'skipCleanup', emoji: '🧸', category: 'privilege' },
  { key: 'getHug', emoji: '🤗', category: 'privilege' }
];

export const getDefaultRewards = (locale: string = 'zh'): DefaultReward[] => {
  const t = messages[locale as keyof typeof messages] || messages.zh;
  return rewardDefs.map(def => ({
    text: t.rewards.defaults[def.key],
    emoji: def.emoji,
    category: def.category
  }));
};

// 向后兼容：保留原默认导出（中文）
export const defaultRewards: DefaultReward[] = getDefaultRewards('zh');