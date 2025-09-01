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

export interface ThemeTranslation {
    name: string;
    description: string;
}

export interface ThemeMessages {
    practice?: {
        themes?: {
            themeLabel?: string;
            selectTheme?: string;
            [K: string]: string | { name: string; description: string } | undefined;
        };
        practiceCard?: {
            nickname: string;
            calculation: string;
        };
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

// 基础主题配置 - 儿童友好的主题配置，明亮护眼，可爱渐变
const baseThemes: Omit<Theme, 'name' | 'description'>[] = [
    {
        id: 'rainbow',
        icon: '🌈',
        gradient: 'bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400',
        bgClass: 'bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200'
    },
    {
        id: 'sunshine',
        icon: '☀️',
        gradient: 'bg-gradient-to-br from-yellow-300 to-orange-400',
        bgClass: 'bg-gradient-to-br from-yellow-200 to-orange-200'
    },
    {
        id: 'ocean',
        icon: '🌊',
        gradient: 'bg-gradient-to-br from-cyan-300 to-blue-400',
        bgClass: 'bg-gradient-to-br from-cyan-200 to-blue-200'
    },
    {
        id: 'forest',
        icon: '🌳',
        gradient: 'bg-gradient-to-br from-lime-400 to-green-600',
        bgClass: 'bg-gradient-to-br from-lime-200 to-green-300'
    },
    {
        id: 'candy',
        icon: '🍭',
        gradient: 'bg-gradient-to-br from-pink-400 to-rose-400',
        bgClass: 'bg-gradient-to-br from-pink-200 to-rose-200'
    },
    {
        id: 'lavender',
        icon: '💜',
        gradient: 'bg-gradient-to-br from-indigo-300 to-purple-400',
        bgClass: 'bg-gradient-to-br from-indigo-200 to-purple-200'
    },
    {
        id: 'peach',
        icon: '🍑',
        gradient: 'bg-gradient-to-br from-rose-300 to-pink-400',
        bgClass: 'bg-gradient-to-br from-rose-200 to-pink-200'
    },
    {
        id: 'mint',
        icon: '🌿',
        gradient: 'bg-gradient-to-br from-emerald-300 to-teal-400',
        bgClass: 'bg-gradient-to-br from-emerald-200 to-teal-200'
    }
];

// 多语言主题函数
export const getThemes = (locale: string = 'zh', t?: ThemeMessages): Theme[] => {
    const isZh = locale === 'zh';
    
    return baseThemes.map(theme => {
        const themeTranslation = t?.practice?.themes?.[theme.id];
        const isThemeTranslation = themeTranslation && typeof themeTranslation === 'object' && 'name' in themeTranslation;
        
        return {
            ...theme,
            name: isThemeTranslation ? themeTranslation.name : (isZh ? getDefaultThemeName(theme.id) : getDefaultThemeNameEn(theme.id)),
            description: isThemeTranslation ? themeTranslation.description : (isZh ? getDefaultThemeDescription(theme.id) : getDefaultThemeDescriptionEn(theme.id))
        };
    });
};

// 默认中文主题名称
const getDefaultThemeName = (id: string): string => {
    const names: Record<string, string> = {
        rainbow: '彩虹',
        sunshine: '阳光',
        ocean: '海洋',
        forest: '森林',
        candy: '糖果',
        lavender: '薰衣草',
        peach: '蜜桃',
        mint: '薄荷'
    };
    return names[id] || '主题';
};

// 默认英文主题名称
const getDefaultThemeNameEn = (id: string): string => {
    const names: Record<string, string> = {
        rainbow: 'Rainbow',
        sunshine: 'Sunshine',
        ocean: 'Ocean',
        forest: 'Forest',
        candy: 'Candy',
        lavender: 'Lavender',
        peach: 'Peach',
        mint: 'Mint'
    };
    return names[id] || 'Theme';
};

// 默认中文主题描述
const getDefaultThemeDescription = (id: string): string => {
    const descriptions: Record<string, string> = {
        rainbow: '温暖的彩虹色彩',
        sunshine: '明亮的阳光色调',
        ocean: '清新的海洋蓝',
        forest: '自然的森林绿',
        candy: '甜美的糖果色',
        lavender: '优雅的薰衣草紫',
        peach: '温柔的蜜桃色',
        mint: '清爽的薄荷绿'
    };
    return descriptions[id] || '主题描述';
};

// 默认英文主题描述
const getDefaultThemeDescriptionEn = (id: string): string => {
    const descriptions: Record<string, string> = {
        rainbow: 'Warm rainbow colors',
        sunshine: 'Bright sunshine tones',
        ocean: 'Fresh ocean blue',
        forest: 'Natural forest green',
        candy: 'Sweet candy colors',
        lavender: 'Elegant lavender purple',
        peach: 'Gentle peach colors',
        mint: 'Refreshing mint green'
    };
    return descriptions[id] || 'Theme description';
};

// 保持向后兼容的静态配置（默认中文）
export const themes: Theme[] = getThemes('zh');

// 获取主题的辅助函数
export const getThemeById = (id: string, locale: string = 'zh', t?: ThemeMessages): Theme | undefined => {
    const themesWithLocale = getThemes(locale, t);
    return themesWithLocale.find(theme => theme.id === id);
};

// 获取默认主题
export const getDefaultTheme = (locale: string = 'zh', t?: ThemeMessages): Theme => {
    const themesWithLocale = getThemes(locale, t);
    return themesWithLocale[0]; // 默认使用彩虹主题
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