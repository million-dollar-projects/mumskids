import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { getDifficultyOptions, getCalculationTypeOptions } from '@/lib/practice-config';
import { getThemeById, getDefaultTheme, ThemeMessages } from '@/lib/themes';

interface PracticeCardProps {
  childName?: string;
  difficulty: 'within10' | 'within20' | 'within50' | 'within100';
  calculationType: 'add' | 'sub' | 'addsub';
  className?: string;
  size?: 'small' | 'large';
  theme?: string;
  locale?: string;
  t?: ThemeMessages;
}

export function PracticeCard({
  childName,
  difficulty,
  calculationType,
  className = "",
  size = 'large',
  theme,
  locale = 'zh',
  t
}: PracticeCardProps) {
  // 根据昵称长度和卡片大小动态调整字体大小
  const getNameFontSize = (name?: string) => {
    if (!name) {
      return size === 'small' ? 'text-lg' : 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl';
    }

    const length = name.length;

    if (size === 'small') {
      if (length <= 2) return 'text-lg';
      if (length <= 4) return 'text-base';
      if (length <= 6) return 'text-sm';
      return 'text-xs';
    }

    // large size - 响应式字体大小
    if (length <= 2) return 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl';
    if (length <= 4) return 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl';
    if (length <= 6) return 'text-xl sm:text-2xl md:text-3xl lg:text-4xl';
    return 'text-lg sm:text-xl md:text-2xl lg:text-3xl';
  };

  const getDescriptionFontSize = () => {
    return size === 'small' ? 'text-xs' : 'text-sm sm:text-base md:text-lg lg:text-xl';
  };

  const getPadding = () => {
    return size === 'small' ? 'px-1' : 'px-4';
  };

  const getMarginBottom = () => {
    return size === 'small' ? 'mb-1' : 'mb-4';
  };

  // 装饰元素尺寸
  const getDecorationSizes = () => {
    if (size === 'small') {
      return {
        topRight: 'w-3 h-3 top-2 right-2',
        bottomLeft: 'w-2 h-2 bottom-3 left-3',
        bottomRight: 'w-5 h-5 bottom-2 right-2 border-2',
        targetIcon: 'w-2.5 h-2.5'
      };
    }

    return {
      topRight: 'w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4',
      bottomLeft: 'w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bottom-3 left-3 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6',
      bottomRight: 'w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4 border-2 sm:border-3 md:border-4',
      targetIcon: 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6'
    };
  };

  // 获取多语言配置的选项
  const difficultyOptions = getDifficultyOptions(locale);
  const calculationTypeOptions = getCalculationTypeOptions(locale);
  
  const difficultyLabel = difficultyOptions.find(option => option.id === difficulty)?.label || '';
  const calculationLabel = calculationTypeOptions.find(option => option.id === calculationType)?.label || '';
  const decorations = getDecorationSizes();
  
  // 获取多语言文案，如果没有传入 t，则使用默认值
  const nicknameText = t?.practice?.practiceCard?.nickname || (locale === 'en' ? 'Nickname' : '昵称');
  const calculationText = t?.practice?.practiceCard?.calculation || (locale === 'en' ? 'Calculation' : '运算');
  
  // 获取主题配置
  const currentTheme = theme ? getThemeById(theme, locale, t) : getDefaultTheme(locale, t);
  const themeGradient = currentTheme?.gradient || 'bg-gradient-to-br from-red-500 to-pink-500';

  return (
    <Card className={`aspect-square max-w-[200px] sm:max-w-none mx-auto sm:mx-0 ${themeGradient} border-none shadow-xl flex items-center justify-center relative overflow-hidden ${className}`}>
      <div className={`text-center text-white ${getPadding()}`}>
        <div className={`font-bold ${getMarginBottom()} transform leading-tight ${getNameFontSize(childName)}`}>
          {childName ? childName.toUpperCase() : nicknameText}
        </div>
        <div className={`${getDescriptionFontSize()} font-medium opacity-90`}>
          {`${difficultyLabel} ${calculationLabel} ${calculationText}`}
        </div>
      </div>

      {/* 装饰元素 */}
      <div className={`absolute ${decorations.topRight} rounded-full bg-white/20`}></div>
      <div className={`absolute ${decorations.bottomLeft} rounded-full bg-white/30`}></div>
      <div className={`absolute ${decorations.bottomRight} rounded-full border-white/20 flex items-center justify-center bg-black/20`}>
        <Target className={`text-white ${decorations.targetIcon}`} />
      </div>
    </Card>
  );
}