export interface Theme {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  bgClass: string;
  description?: string;
}

// 儿童友好的主题配置 - 明亮护眼，可爱渐变
export const themes: Theme[] = [
  {
    id: 'rainbow',
    name: '彩虹',
    icon: '🌈',
    gradient: 'bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400',
    bgClass: 'bg-gradient-to-br from-pink-50 to-purple-50',
    description: '温暖的彩虹色彩'
  },
  {
    id: 'sunshine',
    name: '阳光',
    icon: '☀️',
    gradient: 'bg-gradient-to-br from-yellow-300 to-orange-400',
    bgClass: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    description: '明亮的阳光色调'
  },
  {
    id: 'ocean',
    name: '海洋',
    icon: '🌊',
    gradient: 'bg-gradient-to-br from-cyan-300 to-blue-400',
    bgClass: 'bg-gradient-to-br from-cyan-50 to-blue-50',
    description: '清新的海洋蓝'
  },
  {
    id: 'forest',
    name: '森林',
    icon: '🌳',
    gradient: 'bg-gradient-to-br from-green-300 to-emerald-400',
    bgClass: 'bg-gradient-to-br from-green-50 to-emerald-50',
    description: '自然的森林绿'
  },
  {
    id: 'candy',
    name: '糖果',
    icon: '🍭',
    gradient: 'bg-gradient-to-br from-pink-400 to-rose-400',
    bgClass: 'bg-gradient-to-br from-pink-50 to-rose-50',
    description: '甜美的糖果色'
  },
  {
    id: 'lavender',
    name: '薰衣草',
    icon: '💜',
    gradient: 'bg-gradient-to-br from-purple-300 to-violet-400',
    bgClass: 'bg-gradient-to-br from-purple-50 to-violet-50',
    description: '优雅的薰衣草紫'
  },
  {
    id: 'peach',
    name: '蜜桃',
    icon: '🍑',
    gradient: 'bg-gradient-to-br from-orange-300 to-pink-300',
    bgClass: 'bg-gradient-to-br from-orange-50 to-pink-50',
    description: '温柔的蜜桃色'
  },
  {
    id: 'mint',
    name: '薄荷',
    icon: '🌿',
    gradient: 'bg-gradient-to-br from-teal-300 to-green-300',
    bgClass: 'bg-gradient-to-br from-teal-50 to-green-50',
    description: '清爽的薄荷绿'
  }
];

// 获取主题的辅助函数
export const getThemeById = (id: string): Theme | undefined => {
  return themes.find(theme => theme.id === id);
};

// 获取默认主题
export const getDefaultTheme = (): Theme => {
  return themes[0]; // 默认使用彩虹主题
};