'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ThemeSelector } from '@/components/ui/theme-selector';
import { messages } from '@/i18n/messages';
import { useAuth } from '@/lib/auth/context';
import { themes } from '@/lib/themes';
import { ChevronDown, Globe, Lock, Pencil, Target, Calculator, Timer } from 'lucide-react';
import { PracticeCard } from '@/components/ui/practice-card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RewardSelector } from '@/components/ui/reward-selector';
import {
  difficultyOptions,
  calculationTypeOptions,
  testModeOptions,
  questionCountOptions,
  timeLimitOptions,
  getVisibilityOptions
} from '@/lib/practice-config';

interface CreatePracticeProps {
  params: Promise<{ locale: string }>;
}

interface RewardCondition {
  mode: 'normal' | 'timed';
  // 一般模式
  targetCorrect?: number; // 目标正确题数
  maxTime?: number; // 最大时间限制（分钟）
  // 计时模式（时间限制来自练习设置）
  minCorrect?: number; // 最少正确题数
  maxErrorRate?: number; // 最大错误率（百分比）
}

interface Reward {
  id: string;
  text: string;
  emoji: string;
}

interface PracticeForm {
  title: string;
  description: string;
  childName: string;
  gender: 'boy' | 'girl';
  difficulty: 'within10' | 'within20' | 'within50' | 'within100';
  testMode: 'normal' | 'timed';
  questionCount: number;
  timeLimit: number; // 单位：分钟
  isPublic: boolean;
  rewards: Reward[];
  rewardDistributionMode: 'random' | 'choice';
  rewardCondition: RewardCondition | null;
  selectedTheme: string;
  calculationType: 'add' | 'sub' | 'addsub';
}



export default function CreatePracticePage({ params }: CreatePracticeProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [locale, setLocale] = useState('zh');
  const [saving, setSaving] = useState(false);
  const [showCalculationDialog, setShowCalculationDialog] = useState(false);
  const [showDifficultyDialog, setShowDifficultyDialog] = useState(false);
  const [showTestModeDialog, setShowTestModeDialog] = useState(false);
  const [visibilityDropdownOpen, setVisibilityDropdownOpen] = useState(false);

  const [form, setForm] = useState<PracticeForm>({
    title: '',
    description: '',
    childName: '',
    gender: 'boy',
    difficulty: 'within10',
    testMode: 'normal',
    questionCount: 10,
    timeLimit: 5,
    isPublic: false,
    rewards: [],
    rewardDistributionMode: 'random',
    rewardCondition: null,
    selectedTheme: 'rainbow',
    calculationType: 'add'
  });

  useEffect(() => {
    const getLocale = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    getLocale();
  }, [params]);

  const t = messages[locale as keyof typeof messages] || messages.zh;
  const visibilityOptions = getVisibilityOptions(locale);

  const currentTheme = themes.find(t => t.id === form.selectedTheme);
  const pageBackgroundClass = currentTheme?.bgClass || 'bg-transparent';
  const dialogBackgroundClass = 'bg-white border-none shadow-none';

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/auth/login`);
    }
  }, [user, loading, router, locale]);

  const handleInputChange = (field: keyof PracticeForm, value: string | number | boolean | Reward[] | 'random' | 'choice' | RewardCondition | null) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };





  const handleSave = async () => {
    if (!form.title.trim() || !form.childName.trim()) {
      alert(t.practice.fillAllFields);
      return;
    }

    if (!user?.id) {
      alert('请先登录');
      router.push(`/${locale}/auth/login`);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/practices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          alert('请先登录');
          router.push(`/${locale}/auth/login`);
          return;
        }
        if (response.status === 400) {
          alert(`请填写所有必填字段: ${(result.fields || []).join(', ')}`);
          return;
        }
        throw new Error(result.details || '保存失败，请重试');
      }

      router.push(`/${locale}`);
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-500 ${pageBackgroundClass}`}>
        <Header locale={locale} backgroundClass="bg-transparent" isFixed={true} />
        <div className="child-container py-8 pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">{t.common.loading}</p>
          </div>
        </div>
        <Footer locale={locale} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${pageBackgroundClass}`}>
      <Header locale={locale} backgroundClass="bg-transparent" isFixed={true} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* 顶部导航标签 */}
        <div className="flex items-center justify-end mb-0">
          {/* 右上角控制区域 */}
          <div className="flex items-center space-x-4 bg-purple-900/5 rounded p-0 pointer-events-auto cursor-pointer">
            <DropdownMenu
              open={visibilityDropdownOpen}
              onOpenChange={setVisibilityDropdownOpen}
              trigger={
                <Button variant="ghost" className="flex items-center space-x-2 transition-all duration-200 hover:bg-purple-900/5 cursor-pointer">
                  <div className="transition-transform duration-300">
                    {form.isPublic ? (
                      <Globe className="w-4 h-4 animate-in fade-in-0 zoom-in-95 duration-200" />
                    ) : (
                      <Lock className="w-4 h-4 animate-in fade-in-0 zoom-in-95 duration-200" />
                    )}
                  </div>
                  <span className="transition-all duration-200">
                    {visibilityOptions.find(option =>
                      (option.id === 'public' && form.isPublic) ||
                      (option.id === 'private' && !form.isPublic)
                    )?.label}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${visibilityDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>
              }
            >
              {visibilityOptions.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => {
                    handleInputChange('isPublic', option.id === 'public');
                    setVisibilityDropdownOpen(false);
                  }}
                  className="transition-all duration-200 hover:bg-purple-900/5 cursor-pointer"
                >
                  <div className="flex flex-col w-full">
                    <div className="flex items-center">
                      {option.icon === 'Lock' ? (
                        <Lock className="w-4 h-4 mr-2 transition-transform duration-200" />
                      ) : (
                        <Globe className="w-4 h-4 mr-2 transition-transform duration-200" />
                      )}
                      <span className="transition-colors duration-200">{option.label}</span>
                    </div>
                    <span className="text-xs text-gray-500 ml-6">{option.description}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenu>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* 左侧 - 练习封面和设置 */}
          <div className="lg:col-span-4 space-y-6">
            {/* 练习封面 */}
            <PracticeCard
              childName={form.childName}
              difficulty={form.difficulty}
              calculationType={form.calculationType}
              theme={form.selectedTheme}
            />

            {/* 主题选择 */}
            <ThemeSelector
              selectedTheme={form.selectedTheme}
              onThemeChange={(themeId) => handleInputChange('selectedTheme', themeId)}
            />
          </div>

          {/* 右侧 - 表单区域 */}
          <div className="lg:col-span-8 space-y-2">
            {/* 练习标题 */}
            <div>
              <Input
                value={form.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="text-4xl md:text-4xl font-bold text-[#1315175c] shadow-none 
                border-none outline-none py-4 px-0 h-auto focus-visible:ring-0 bg-transparent 
                placeholder:text-4xl placeholder:font-bold placeholder:text-[#1315175c]"
                placeholder="练习名称"
              />
            </div>
            {/* 描述暂时隐藏 */}
            <div className='hidden'>
              <Input
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="简单描述这个练习的目标和内容..."
                className="w-full border-none shadow-none outline-none px-2 py-2 h-auto focus-visible:ring-0 bg-transparent 
                 placeholder:font-bold placeholder:text-[#1315175c] bg-purple-900/5"
              />
            </div>
            {/* 小朋友昵称 */}
            <div>
              <Input
                value={form.childName}
                onChange={(e) => {
                  // 限制昵称长度为8个字符
                  if (e.target.value.length <= 8) {
                    handleInputChange('childName', e.target.value);
                  }
                }}
                placeholder="小朋友昵称"
                maxLength={8}
                className="w-full border-none shadow-none outline-none px-2 py-2 h-auto focus-visible:ring-0 bg-transparent 
                  placeholder:font-bold placeholder:text-[#1315175c] bg-purple-900/5"
              />
              <div className="text-xs text-gray-500 mt-1 px-2">
                {form.childName.length}/8 字符
              </div>
            </div>

            <Separator />

            {/* 其他设置 */}
            <div className="space-y-6">
              {/* 难度选择 */}
              <div className="flex items-center justify-between bg-purple-900/5 py-1 px-2 rounded">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">计算难度</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">
                    {difficultyOptions.find(option => option.id === form.difficulty)?.label}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className='cursor-pointer'
                    onClick={() => setShowDifficultyDialog(true)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* 难度选择弹窗 */}
              <Dialog open={showDifficultyDialog} onOpenChange={setShowDifficultyDialog}>
                <DialogContent className={`sm:max-w-[425px] ${dialogBackgroundClass}`}>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">选择难度</DialogTitle>
                    <DialogDescription className="text-gray-500">
                      请选择练习题目的难度范围
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <RadioGroup
                      value={form.difficulty}
                      onValueChange={(value: 'within10' | 'within20' | 'within50' | 'within100') => {
                        handleInputChange('difficulty', value);
                        setShowDifficultyDialog(false);
                      }}
                      className="flex flex-col space-y-1"
                    >
                      {difficultyOptions.map((option) => (
                        <Label
                          key={option.id}
                          htmlFor={`dialog-${option.id}`}
                          className={`flex items-center text-gray-700 shadow-none space-x-1 py-2 px-4 rounded cursor-pointer transition-all duration-200 border-1 ${form.difficulty === option.id
                            ? 'bg-blue-50 border-blue-200 text-gray-900'
                            : 'bg-gray-50 border-gray-200 hover:bg-blue-50/50 hover:border-blue-200/50'
                            }`}
                        >
                          <RadioGroupItem value={option.id} id={`dialog-${option.id}`} className="pointer-events-none" />
                          <span className={`text-base font-medium flex-1 ${form.difficulty === option.id ? 'text-gray-800' : 'text-gray-700'}`}>
                            {option.label}
                          </span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                </DialogContent>
              </Dialog>

              {/* 计算方式 */}
              <div className="flex items-center justify-between bg-purple-900/5 py-1 px-2 rounded">
                <div className="flex items-center gap-3">
                  <Calculator className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">计算方式</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">
                    {calculationTypeOptions.find(option => option.id === form.calculationType)?.label}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className='cursor-pointer'
                    onClick={() => setShowCalculationDialog(true)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* 计算方式选择弹窗 */}
              <Dialog open={showCalculationDialog} onOpenChange={setShowCalculationDialog}>
                <DialogContent className={`sm:max-w-[425px] ${dialogBackgroundClass}`}>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">选择计算方式</DialogTitle>
                    <DialogDescription className="text-gray-500">
                      请选择练习题目的计算方式
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <RadioGroup
                      value={form.calculationType}
                      onValueChange={(value: 'add' | 'sub' | 'addsub') => {
                        handleInputChange('calculationType', value);
                        setShowCalculationDialog(false);
                      }}
                      className="flex flex-col space-y-1"
                    >
                      {calculationTypeOptions.map((option) => (
                        <Label
                          key={option.id}
                          htmlFor={`dialog-${option.id}`}
                          className={`flex items-center text-gray-700 shadow-none space-x-1 py-2 px-4 rounded cursor-pointer transition-all duration-200 border-1 ${form.calculationType === option.id
                            ? 'bg-blue-50 border-blue-200 text-gray-900'
                            : 'bg-gray-50 border-gray-200 hover:bg-blue-50/50 hover:border-blue-200/50'
                            }`}
                        >
                          <RadioGroupItem value={option.id} id={`dialog-${option.id}`} className="pointer-events-none" />
                          <span className={`text-base font-medium flex-1 ${form.calculationType === option.id ? 'text-gray-800' : 'text-gray-700'}`}>
                            {option.label}
                          </span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                </DialogContent>
              </Dialog>

              {/* 测试方式 */}
              <div className="flex items-center justify-between bg-purple-900/5 py-1 px-2 rounded">
                <div className="flex items-center gap-3">
                  <Timer className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">练习方式</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">
                    {form.testMode === 'normal' && `${testModeOptions.find(option => option.id === 'normal')?.label} (${form.questionCount}题)`}
                    {form.testMode === 'timed' && `${testModeOptions.find(option => option.id === 'timed')?.label} (${form.timeLimit}分钟)`}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className='cursor-pointer'
                    onClick={() => setShowTestModeDialog(true)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* 测试方式选择弹窗 */}
              <Dialog open={showTestModeDialog} onOpenChange={setShowTestModeDialog}>
                <DialogContent className={`sm:max-w-[425px] ${dialogBackgroundClass}`}>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">选择练习模式</DialogTitle>
                    <DialogDescription className="text-gray-500">
                      请选择练习题目的练习模式和相关设置
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <RadioGroup
                      value={form.testMode}
                      onValueChange={(value: 'normal' | 'timed') => {
                        handleInputChange('testMode', value);
                      }}
                      className="flex flex-col space-y-1"
                    >
                      {testModeOptions.map((option) => (
                        <div key={option.id} className="flex flex-col space-y-3">
                          <Label
                            htmlFor={`dialog-${option.id}`}
                            className={`flex items-center text-gray-700 shadow-none space-x-1 py-2 px-4 rounded cursor-pointer transition-all duration-200 border-1 ${form.testMode === option.id
                              ? 'bg-blue-50 border-blue-200 text-gray-900'
                              : 'bg-gray-50 border-gray-200 hover:bg-blue-50/50 hover:border-blue-200/50'
                              }`}
                          >
                            <RadioGroupItem value={option.id} id={`dialog-${option.id}`} className="pointer-events-none" />
                            <span className={`text-base font-medium flex-1 ${form.testMode === option.id ? 'text-gray-800' : 'text-gray-700'}`}>
                              {option.label}
                            </span>
                          </Label>
                          {form.testMode === option.id && option.id === 'normal' && (
                            <div>
                              <Select
                                value={form.questionCount.toString()}
                                onValueChange={(value) => handleInputChange('questionCount', parseInt(value))}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="选择题目数量" />
                                </SelectTrigger>
                                <SelectContent className={`${dialogBackgroundClass} border shadow-lg`}>
                                  {questionCountOptions.map((count) => (
                                    <SelectItem key={count} value={count.toString()}>
                                      {count} 题
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {form.testMode === option.id && option.id === 'timed' && (
                            <div>
                              <Select
                                value={form.timeLimit.toString()}
                                onValueChange={(value) => handleInputChange('timeLimit', parseInt(value))}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="选择时间" />
                                </SelectTrigger>
                                <SelectContent className={`${dialogBackgroundClass} border shadow-lg`}>
                                  {timeLimitOptions.map((minutes) => (
                                    <SelectItem key={minutes} value={minutes.toString()}>
                                      {minutes} 分钟
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => setShowTestModeDialog(false)}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white cursor-pointer h-11"
                    >
                      确 定
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Separator />

              {/* 完成奖励 */}
              <RewardSelector
                rewards={form.rewards}
                distributionMode={form.rewardDistributionMode}
                onRewardsChange={(rewards) => handleInputChange('rewards', rewards)}
                onDistributionModeChange={(mode) => handleInputChange('rewardDistributionMode', mode)}
                onRewardConditionChange={(condition) => handleInputChange('rewardCondition', condition)}
                maxRewards={10}
                testMode={form.testMode}
                questionCount={form.questionCount}
                timeLimit={form.timeLimit}
              />
            </div>

            {/* 创建按钮 */}
            <Button
              onClick={handleSave}
              disabled={saving || !form.title.trim() || !form.childName.trim()}
              className={`w-full h-12 text-lg font-medium text-white transition-all duration-300 ${saving || !form.title.trim() || !form.childName.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : `${currentTheme?.gradient || 'bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400'} hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]`
                }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  创建练习
                </>
              ) : (
                '创建练习'
              )}
            </Button>
          </div>

        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
} 