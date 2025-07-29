import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { difficultyOptions, calculationTypeOptions } from '@/lib/practice-config';
import { getThemeById, getDefaultTheme } from '@/lib/themes';

interface PracticeCardProps {
  childName?: string;
  difficulty: 'within10' | 'within20' | 'within50' | 'within100';
  calculationType: 'add' | 'sub' | 'addsub';
  className?: string;
  size?: 'small' | 'large';
  theme?: string;
}

export function PracticeCard({
  childName,
  difficulty,
  calculationType,
  className = "",
  size = 'large',
  theme
}: PracticeCardProps) {
  // 根据昵称长度和卡片大小动态调整字体大小
  const getNameFontSize = (name?: string) => {
    if (!name) {
      return size === 'small' ? 'text-lg' : 'text-6xl';
    }

    const length = name.length;

    if (size === 'small') {
      if (length <= 2) return 'text-lg';
      if (length <= 4) return 'text-base';
      if (length <= 6) return 'text-sm';
      return 'text-xs';
    }

    // large size
    if (length <= 2) return 'text-6xl';
    if (length <= 4) return 'text-5xl';
    if (length <= 6) return 'text-4xl';
    return 'text-3xl';
  };

  const getDescriptionFontSize = () => {
    return size === 'small' ? 'text-xs' : 'text-xl';
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
        topRight: 'w-2 h-2 top-1 right-1',
        bottomLeft: 'w-1 h-1 bottom-1.5 left-1.5',
        bottomRight: 'w-3 h-3 bottom-1 right-1 border',
        targetIcon: 'w-1.5 h-1.5'
      };
    }

    return {
      topRight: 'w-8 h-8 top-4 right-4',
      bottomLeft: 'w-4 h-4 bottom-6 left-6',
      bottomRight: 'w-12 h-12 bottom-4 right-4 border-4',
      targetIcon: 'w-6 h-6'
    };
  };

  const difficultyLabel = difficultyOptions.find(option => option.id === difficulty)?.label || '';
  const calculationLabel = calculationTypeOptions.find(option => option.id === calculationType)?.label || '';
  const decorations = getDecorationSizes();
  
  // 获取主题配置
  const currentTheme = theme ? getThemeById(theme) : getDefaultTheme();
  const themeGradient = currentTheme?.gradient || 'bg-gradient-to-br from-red-500 to-pink-500';

  return (
    <Card className={`aspect-square ${themeGradient} border-none shadow-xl flex items-center justify-center relative overflow-hidden ${className}`}>
      <div className={`text-center text-white ${getPadding()}`}>
        <div className={`font-bold ${getMarginBottom()} transform leading-tight ${getNameFontSize(childName)}`}>
          {childName ? childName.toUpperCase() : '昵称'}
        </div>
        <div className={`${getDescriptionFontSize()} font-medium opacity-90`}>
          {`${difficultyLabel}${calculationLabel}运算`}
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