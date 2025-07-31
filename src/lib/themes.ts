export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    text: string;
    light: string;
    button: string;
    progress: string;
}

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
        bgClass: 'bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200',
        description: '温暖的彩虹色彩'
    },
    {
        id: 'sunshine',
        name: '阳光',
        icon: '☀️',
        gradient: 'bg-gradient-to-br from-yellow-300 to-orange-400',
        bgClass: 'bg-gradient-to-br from-yellow-200 to-orange-200',
        description: '明亮的阳光色调'
    },
    {
        id: 'ocean',
        name: '海洋',
        icon: '🌊',
        gradient: 'bg-gradient-to-br from-cyan-300 to-blue-400',
        bgClass: 'bg-gradient-to-br from-cyan-200 to-blue-200',
        description: '清新的海洋蓝'
    },
    {
        id: 'forest',
        name: '森林',
        icon: '🌳',
        gradient: 'bg-gradient-to-br from-lime-400 to-green-600',
        bgClass: 'bg-gradient-to-br from-lime-200 to-green-300',
        description: '自然的森林绿'
    },
    {
        id: 'candy',
        name: '糖果',
        icon: '🍭',
        gradient: 'bg-gradient-to-br from-pink-400 to-rose-400',
        bgClass: 'bg-gradient-to-br from-pink-200 to-rose-200',
        description: '甜美的糖果色'
    },
    {
        id: 'lavender',
        name: '薰衣草',
        icon: '💜',
        gradient: 'bg-gradient-to-br from-indigo-300 to-purple-400',
        bgClass: 'bg-gradient-to-br from-indigo-200 to-purple-200',
        description: '优雅的薰衣草紫'
    },
    {
        id: 'peach',
        name: '蜜桃',
        icon: '🍑',
        gradient: 'bg-gradient-to-br from-rose-300 to-pink-400',
        bgClass: 'bg-gradient-to-br from-rose-200 to-pink-200',
        description: '温柔的蜜桃色'
    },
    {
        id: 'mint',
        name: '薄荷',
        icon: '🌿',
        gradient: 'bg-gradient-to-br from-emerald-300 to-teal-400',
        bgClass: 'bg-gradient-to-br from-emerald-200 to-teal-200',
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

// 主题颜色配置
const themeColorSchemes: Record<string, ThemeColors> = {
    rainbow: {
        primary: 'from-pink-400 to-purple-500',
        secondary: 'from-pink-300 to-purple-400',
        accent: 'bg-pink-500',
        border: 'border-pink-400',
        text: 'text-pink-600',
        light: 'bg-pink-50 border-pink-200',
        button: 'bg-pink-500 hover:bg-pink-600',
        progress: 'bg-pink-500'
    },
    sunshine: {
        primary: 'from-yellow-400 to-orange-500',
        secondary: 'from-yellow-300 to-orange-400',
        accent: 'bg-orange-500',
        border: 'border-orange-400',
        text: 'text-orange-600',
        light: 'bg-orange-50 border-orange-200',
        button: 'bg-orange-500 hover:bg-orange-600',
        progress: 'bg-orange-500'
    },
    ocean: {
        primary: 'from-cyan-400 to-blue-500',
        secondary: 'from-cyan-300 to-blue-400',
        accent: 'bg-blue-500',
        border: 'border-blue-400',
        text: 'text-blue-600',
        light: 'bg-blue-50 border-blue-200',
        button: 'bg-blue-500 hover:bg-blue-600',
        progress: 'bg-blue-500'
    },
    forest: {
        primary: 'from-lime-400 to-green-500',
        secondary: 'from-lime-300 to-green-400',
        accent: 'bg-green-500',
        border: 'border-green-400',
        text: 'text-green-600',
        light: 'bg-green-50 border-green-200',
        button: 'bg-green-500 hover:bg-green-600',
        progress: 'bg-green-500'
    },
    candy: {
        primary: 'from-pink-400 to-rose-500',
        secondary: 'from-pink-300 to-rose-400',
        accent: 'bg-rose-500',
        border: 'border-rose-400',
        text: 'text-rose-600',
        light: 'bg-rose-50 border-rose-200',
        button: 'bg-rose-500 hover:bg-rose-600',
        progress: 'bg-rose-500'
    },
    lavender: {
        primary: 'from-indigo-400 to-purple-500',
        secondary: 'from-indigo-300 to-purple-400',
        accent: 'bg-purple-500',
        border: 'border-purple-400',
        text: 'text-purple-600',
        light: 'bg-purple-50 border-purple-200',
        button: 'bg-purple-500 hover:bg-purple-600',
        progress: 'bg-purple-500'
    },
    peach: {
        primary: 'from-rose-400 to-pink-500',
        secondary: 'from-rose-300 to-pink-400',
        accent: 'bg-pink-500',
        border: 'border-pink-400',
        text: 'text-pink-600',
        light: 'bg-pink-50 border-pink-200',
        button: 'bg-pink-500 hover:bg-pink-600',
        progress: 'bg-pink-500'
    },
    mint: {
        primary: 'from-emerald-400 to-teal-500',
        secondary: 'from-emerald-300 to-teal-400',
        accent: 'bg-teal-500',
        border: 'border-teal-400',
        text: 'text-teal-600',
        light: 'bg-teal-50 border-teal-200',
        button: 'bg-teal-500 hover:bg-teal-600',
        progress: 'bg-teal-500'
    }
};

// 获取主题颜色配置
export const getThemeColors = (themeId: string): ThemeColors => {
    return themeColorSchemes[themeId] || themeColorSchemes.rainbow;
};