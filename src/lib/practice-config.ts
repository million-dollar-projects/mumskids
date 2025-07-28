export interface DifficultyOption {
  id: 'within10' | 'within20' | 'within50' | 'within100';
  label: string;
  description?: string;
}

export interface CalculationTypeOption {
  id: 'add' | 'sub' | 'addsub';
  label: string;
  description?: string;
}

export interface TestModeOption {
  id: 'normal' | 'timed';
  label: string;
  description?: string;
}

export interface VisibilityOption {
  id: 'public' | 'private';
  label: string;
  description?: string;
  icon: string;
}

// 多语言配置函数
export const getDifficultyOptions = (locale: string): DifficultyOption[] => {
  const isZh = locale === 'zh';
  
  return [
    {
      id: 'within10',
      label: isZh ? '10以内' : 'Within 10',
      description: isZh ? '适合初学者，数字范围在0-10之间' : 'Suitable for beginners, numbers range from 0-10'
    },
    {
      id: 'within20',
      label: isZh ? '20以内' : 'Within 20',
      description: isZh ? '进阶练习，数字范围在0-20之间' : 'Advanced practice, numbers range from 0-20'
    },
    {
      id: 'within50',
      label: isZh ? '50以内' : 'Within 50',
      description: isZh ? '中级练习，数字范围在0-50之间' : 'Intermediate practice, numbers range from 0-50'
    },
    {
      id: 'within100',
      label: isZh ? '100以内' : 'Within 100',
      description: isZh ? '高级练习，数字范围在0-100之间' : 'Advanced practice, numbers range from 0-100'
    }
  ];
};

export const getCalculationTypeOptions = (locale: string): CalculationTypeOption[] => {
  const isZh = locale === 'zh';
  
  return [
    {
      id: 'add',
      label: isZh ? '加法' : 'Addition',
      description: isZh ? '只包含加法运算' : 'Addition operations only'
    },
    {
      id: 'sub',
      label: isZh ? '减法' : 'Subtraction',
      description: isZh ? '只包含减法运算' : 'Subtraction operations only'
    },
    {
      id: 'addsub',
      label: isZh ? '加减混合' : 'Mixed',
      description: isZh ? '包含加法和减法运算' : 'Both addition and subtraction operations'
    }
  ];
};

export const getTestModeOptions = (locale: string): TestModeOption[] => {
  const isZh = locale === 'zh';
  
  return [
    {
      id: 'normal',
      label: isZh ? '普通模式' : 'Normal Mode',
      description: isZh ? '按题目数量进行练习' : 'Practice by number of questions'
    },
    {
      id: 'timed',
      label: isZh ? '计时模式' : 'Timed Mode',
      description: isZh ? '在限定时间内完成尽可能多的题目' : 'Complete as many questions as possible within time limit'
    }
  ];
};

// 保持向后兼容的静态配置（默认中文）
export const difficultyOptions: DifficultyOption[] = getDifficultyOptions('zh');
export const calculationTypeOptions: CalculationTypeOption[] = getCalculationTypeOptions('zh');
export const testModeOptions: TestModeOption[] = getTestModeOptions('zh');

export const questionCountOptions = [5, 10, 15, 20, 25, 30];
export const timeLimitOptions = [1, 2, 3, 5, 10, 15];

// 多语言配置函数
export const getVisibilityOptions = (locale: string): VisibilityOption[] => {
  const isZh = locale === 'zh';
  
  return [
    {
      id: 'private',
      label: isZh ? '私密' : 'Private',
      description: isZh ? '只有你可以查看和使用这个练习' : 'Only you can view and use this practice',
      icon: 'Lock'
    },
    {
      id: 'public',
      label: isZh ? '公开' : 'Public',
      description: isZh ? '其他人可以查看和使用这个练习' : 'Others can view and use this practice',
      icon: 'Globe'
    }
  ];
};