'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ThemeSelector } from '@/components/ui/theme-selector';
import { messages } from '@/i18n/messages';
import { useAuth } from '@/lib/auth/context';
import { themes } from '@/lib/themes';
import { Plus, X, ChevronDown, Globe, Lock, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface CreatePracticeProps {
  params: Promise<{ locale: string }>;
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
  rewards: string[];
  selectedTheme: string;
  calculationType: 'add' | 'sub' | 'addsub';
}



export default function CreatePracticePage({ params }: CreatePracticeProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [locale, setLocale] = useState('zh');
  const [saving, setSaving] = useState(false);
  const [newReward, setNewReward] = useState('');
  const [showCalculationDialog, setShowCalculationDialog] = useState(false);
  const [showDifficultyDialog, setShowDifficultyDialog] = useState(false);
  const [showTestModeDialog, setShowTestModeDialog] = useState(false);

  const [form, setForm] = useState<PracticeForm>({
    title: '练习名称',
    description: '',
    childName: '',
    gender: 'boy',
    difficulty: 'within10',
    testMode: 'normal',
    questionCount: 10,
    timeLimit: 0,
    isPublic: false,
    rewards: [],
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

  const currentTheme = themes.find(t => t.id === form.selectedTheme);
  const pageBackgroundClass = currentTheme?.bgClass || 'bg-purple-50';

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/auth/login`);
    }
  }, [user, loading, router, locale]);

  const handleInputChange = (field: keyof PracticeForm, value: string | number | boolean | string[]) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addReward = () => {
    if (newReward.trim() && form.rewards.length < 5) {
      setForm(prev => ({
        ...prev,
        rewards: [...prev.rewards, newReward.trim()]
      }));
      setNewReward('');
    }
  };

  const removeReward = (index: number) => {
    setForm(prev => ({
      ...prev,
      rewards: prev.rewards.filter((_, i) => i !== index)
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

      alert(t.practice.practiceCreated);
      router.push(`/${locale}/practice`);
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
        <Header locale={locale} />
        <div className="child-container py-8">
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
      <Header locale={locale} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 顶部导航标签 */}
        <div className="flex items-center justify-end mb-8">
          {/* 右上角控制区域 */}
          <div className="flex items-center space-x-4 bg-purple-100 rounded p-0 pointer-events-auto">
            <DropdownMenu
              trigger={
                <Button variant="ghost" className="flex items-center space-x-2 transition-all duration-200 hover:bg-purple-200/50 hover:scale-105">
                  <div className="transition-transform duration-300">
                    {form.isPublic ? (
                      <Globe className="w-4 h-4 animate-in fade-in-0 zoom-in-95 duration-200" />
                    ) : (
                      <Lock className="w-4 h-4 animate-in fade-in-0 zoom-in-95 duration-200" />
                    )}
                  </div>
                  <span className="transition-all duration-200">
                    {form.isPublic ? '公开' : '私密'}
                  </span>
                  <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              }
            >
              <DropdownMenuItem
                onClick={() => handleInputChange('isPublic', false)}
                className="transition-all duration-200 hover:bg-purple-50 hover:scale-[1.02] cursor-pointer"
              >
                <Lock className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" />
                <span className="transition-colors duration-200">私密</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleInputChange('isPublic', true)}
                className="transition-all duration-200 hover:bg-purple-50 hover:scale-[1.02] cursor-pointer"
              >
                <Globe className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" />
                <span className="transition-colors duration-200">公开</span>
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* 左侧 - 练习封面和设置 */}
          <div className="lg:col-span-4 space-y-6">
            {/* 练习封面 */}
            <Card className="aspect-square bg-gradient-to-br from-red-500 to-pink-500 border-none shadow-xl flex items-center justify-center relative overflow-hidden">
              <div className="text-center text-white">
                <div className="text-6xl font-bold mb-4 transform -rotate-12">
                  {form.childName ? form.childName.slice(0, 2).toUpperCase() : 'YS'}
                </div>
                <div className="text-xl font-medium opacity-90">
                  {form.difficulty === 'within10' && '10以内运算'}
                  {form.difficulty === 'within20' && '20以内运算'}
                  {form.difficulty === 'within50' && '50以内运算'}
                  {form.difficulty === 'within100' && '100以内运算'}
                </div>
              </div>
              {/* 装饰元素 */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20"></div>
              <div className="absolute bottom-6 left-6 w-4 h-4 rounded-full bg-white/30"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full border-4 border-white/20 flex items-center justify-center bg-black/20">
                <span className="text-white text-2xl">🎯</span>
              </div>
            </Card>

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
            {/* 描述 */}
            <div>
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
                onChange={(e) => handleInputChange('childName', e.target.value)}
                placeholder="小朋友昵称"
                className="w-full border-none shadow-none outline-none px-2 py-2 h-auto focus-visible:ring-0 bg-transparent 
                  placeholder:font-bold placeholder:text-[#1315175c] bg-purple-900/5"
              />
            </div>

            <Separator />

            {/* 其他设置 */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">其他设置</h3>

              {/* 难度选择 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🎯</span>
                  <span className="font-medium">难度</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">
                    {form.difficulty === 'within10' && '10以内'}
                    {form.difficulty === 'within20' && '20以内'}
                    {form.difficulty === 'within50' && '50以内'}
                    {form.difficulty === 'within100' && '100以内'}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowDifficultyDialog(true)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* 难度选择弹窗 */}
              <Dialog open={showDifficultyDialog} onOpenChange={setShowDifficultyDialog}>
                <DialogContent className="sm:max-w-[425px] bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">选择难度</DialogTitle>
                    <DialogDescription className="text-gray-500">
                      请选择练习题目的难度范围
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <RadioGroup
                      value={form.difficulty}
                      onValueChange={(value: 'within10' | 'within20' | 'within50' | 'within100') => {
                        handleInputChange('difficulty', value);
                        setShowDifficultyDialog(false);
                      }}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                        <RadioGroupItem value="within10" id="dialog-within10" />
                        <Label htmlFor="dialog-within10" className="cursor-pointer text-base">10以内</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                        <RadioGroupItem value="within20" id="dialog-within20" />
                        <Label htmlFor="dialog-within20" className="cursor-pointer text-base">20以内</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                        <RadioGroupItem value="within50" id="dialog-within50" />
                        <Label htmlFor="dialog-within50" className="cursor-pointer text-base">50以内</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                        <RadioGroupItem value="within100" id="dialog-within100" />
                        <Label htmlFor="dialog-within100" className="cursor-pointer text-base">100以内</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </DialogContent>
              </Dialog>

              {/* 计算方式 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🧮</span>
                  <span className="font-medium">计算方式</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">
                    {form.calculationType === 'add' && '加法'}
                    {form.calculationType === 'sub' && '减法'}
                    {form.calculationType === 'addsub' && '加减混合'}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCalculationDialog(true)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* 计算方式选择弹窗 */}
              <Dialog open={showCalculationDialog} onOpenChange={setShowCalculationDialog}>
                <DialogContent className="sm:max-w-[425px] bg-white">
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
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                        <RadioGroupItem value="add" id="dialog-add" />
                        <Label htmlFor="dialog-add" className="cursor-pointer text-base">加法</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                        <RadioGroupItem value="sub" id="dialog-sub" />
                        <Label htmlFor="dialog-sub" className="cursor-pointer text-base">减法</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                        <RadioGroupItem value="addsub" id="dialog-addsub" />
                        <Label htmlFor="dialog-addsub" className="cursor-pointer text-base">加减混合</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </DialogContent>
              </Dialog>

              <Separator />

              {/* 测试方式 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">⏱️</span>
                  <span className="font-medium">测试方式</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">
                    {form.testMode === 'normal' && `普通模式 (${form.questionCount}题)`}
                    {form.testMode === 'timed' && `计时模式 (${form.timeLimit}分钟)`}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowTestModeDialog(true)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* 测试方式选择弹窗 */}
              <Dialog open={showTestModeDialog} onOpenChange={setShowTestModeDialog}>
                <DialogContent className="sm:max-w-[425px] bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">选择测试方式</DialogTitle>
                    <DialogDescription className="text-gray-500">
                      请选择练习题目的测试方式和相关设置
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <RadioGroup
                      value={form.testMode}
                      onValueChange={(value: 'normal' | 'timed') => {
                        handleInputChange('testMode', value);
                      }}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                          <RadioGroupItem value="normal" id="dialog-normal" />
                          <Label htmlFor="dialog-normal" className="cursor-pointer text-base">普通模式</Label>
                        </div>
                        {form.testMode === 'normal' && (
                          <div className="ml-8">
                            <Select
                              value={form.questionCount.toString()}
                              onValueChange={(value) => handleInputChange('questionCount', parseInt(value))}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="选择题目数量" />
                              </SelectTrigger>
                              <SelectContent>
                                {[5, 10, 15, 20, 25, 30].map((count) => (
                                  <SelectItem key={count} value={count.toString()}>
                                    {count} 题
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                          <RadioGroupItem value="timed" id="dialog-timed" />
                          <Label htmlFor="dialog-timed" className="cursor-pointer text-base">计时模式</Label>
                        </div>
                        {form.testMode === 'timed' && (
                          <div className="ml-8">
                            <Select
                              value={form.timeLimit.toString()}
                              onValueChange={(value) => handleInputChange('timeLimit', parseInt(value))}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="选择时间" />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 5, 10, 15].map((minutes) => (
                                  <SelectItem key={minutes} value={minutes.toString()}>
                                    {minutes} 分钟
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </RadioGroup>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={() => setShowTestModeDialog(false)}
                      className="w-full"
                    >
                      确定
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Separator />

              {/* 完成奖励 */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg">🎁</span>
                  <span className="font-medium">完成奖励</span>
                </div>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      value={newReward}
                      onChange={(e) => setNewReward(e.target.value)}
                      placeholder="添加完成奖励..."
                      onKeyDown={(e) => e.key === 'Enter' && addReward()}
                      disabled={form.rewards.length >= 5}
                    />
                    <Button
                      onClick={addReward}
                      disabled={!newReward.trim() || form.rewards.length >= 5}
                      variant="outline"
                      size="icon"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {form.rewards.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.rewards.map((reward, index) => (
                        <Badge key={index} variant="secondary" className="gap-2">
                          {reward}
                          <button
                            onClick={() => removeReward(index)}
                            className="hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 创建按钮 */}
            <Button
              onClick={handleSave}
              disabled={saving || !form.title.trim() || !form.childName.trim()}
              className="w-full h-12 text-lg font-medium bg-red-500 hover:bg-red-600 text-white"
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