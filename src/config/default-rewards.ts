export interface DefaultReward {
  text: string;
  emoji: string;
  category: 'entertainment' | 'food' | 'activity' | 'privilege';
}

export const defaultRewards: DefaultReward[] = [
  // 娱乐类
  { text: '看电视10分钟', emoji: '📺', category: 'entertainment' },
  { text: '玩平板15分钟', emoji: '📱', category: 'entertainment' },
  { text: '看动画片一集', emoji: '🎬', category: 'entertainment' },
  { text: '听故事15分钟', emoji: '📚', category: 'entertainment' },
  { text: '玩游戏20分钟', emoji: '🎮', category: 'entertainment' },
  
  // 食物类
  { text: '奖励一个小饼干', emoji: '🍪', category: 'food' },
  { text: '吃一颗糖果', emoji: '🍬', category: 'food' },
  { text: '喝一杯果汁', emoji: '🧃', category: 'food' },
  { text: '吃一个小蛋糕', emoji: '🧁', category: 'food' },
  { text: '选择今天的零食', emoji: '🍿', category: 'food' },
  
  // 活动类
  { text: '和爸爸玩游戏', emoji: '👨‍👧', category: 'activity' },
  { text: '和妈妈一起画画', emoji: '🎨', category: 'activity' },
  { text: '去公园玩30分钟', emoji: '🏞️', category: 'activity' },
  { text: '骑自行车15分钟', emoji: '🚲', category: 'activity' },
  { text: '和朋友视频聊天', emoji: '📞', category: 'activity' },
  
  // 特权类
  { text: '晚睡10分钟', emoji: '🌙', category: 'privilege' },
  { text: '选择明天的衣服', emoji: '👕', category: 'privilege' },
  { text: '决定晚餐吃什么', emoji: '🍽️', category: 'privilege' },
  { text: '不用收拾玩具一次', emoji: '🧸', category: 'privilege' },
  { text: '获得一个拥抱', emoji: '🤗', category: 'privilege' },
];