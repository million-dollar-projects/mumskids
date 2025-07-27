'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { messages } from '@/i18n/messages';
import { useAuth } from '@/lib/auth/context';
import { Plus, X, ChevronDown, Globe, Lock, ChevronsUpDown, Shuffle } from 'lucide-react';

interface CreatePracticeProps {
  params: Promise<{ locale: string }>;
}

interface PracticeForm {
  title: string;
  description: string;
  childName: string;
  gender: 'boy' | 'girl';
  difficulty: 'within10' | 'within20' | 'within50' | 'within100';
  questionCount: number;
  isPublic: boolean;
  rewards: string[];
  selectedTheme: string;
}

// 主题数据
const themes = [
  { id: 'simple', name: '简约', icon: '✨', gradient: 'bg-gradient-to-br from-gray-100 to-gray-200', bgClass: 'bg-gray-50' },
  { id: 'colorful', name: '彩子', icon: '🎨', gradient: 'bg-gradient-to-br from-blue-400 to-purple-500', bgClass: 'bg-gradient-to-br from-blue-50 to-purple-50' },
  { id: 'dark', name: '培训', icon: '🎯', gradient: 'bg-gradient-to-br from-gray-800 to-black', bgClass: 'bg-gray-900' },
  { id: 'nature', name: '表情符号', icon: '😊', gradient: 'bg-gradient-to-br from-pink-300 to-pink-400', bgClass: 'bg-pink-50' },
  { id: 'ocean', name: '数据', icon: '📊', gradient: 'bg-gradient-to-br from-purple-600 to-purple-800', bgClass: 'bg-purple-50' },
  { id: 'sunset', name: '图案', icon: '🔷', gradient: 'bg-gradient-to-br from-blue-500 to-blue-700', bgClass: 'bg-blue-50' },
  { id: 'space', name: '争夺战', icon: '🏁', gradient: 'bg-gradient-to-br from-cyan-400 to-cyan-600', bgClass: 'bg-cyan-50' },
];

export default function CreatePracticePage({ params }: CreatePracticeProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [locale, setLocale] = useState('zh');
  const [saving, setSaving] = useState(false);
  const [newReward, setNewReward] = useState('');
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);

  const [form, setForm] = useState<PracticeForm>({
    title: '练习名称',
    description: '',
    childName: '',
    gender: 'boy',
    difficulty: 'within10',
    questionCount: 10,
    isPublic: false,
    rewards: [],
    selectedTheme: 'simple'
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

  const randomizeTheme = () => {
    const availableThemes = themes.filter(theme => theme.id !== form.selectedTheme);
    const randomTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
    handleInputChange('selectedTheme', randomTheme.id);
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
                <Button variant="ghost" className="flex items-center space-x-2">
                  {form.isPublic ? (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>公开</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>私密</span>
                    </>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              }
            >
              <DropdownMenuItem onClick={() => handleInputChange('isPublic', false)}>
                <Lock className="w-4 h-4 mr-2" />
                私密
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleInputChange('isPublic', true)}>
                <Globe className="w-4 h-4 mr-2" />
                公开
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
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  {/* 左侧：主题图标和信息 */}
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg ${currentTheme?.gradient} flex items-center justify-center shadow-sm`}>
                      <span className="text-lg">{currentTheme?.icon}</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">主题</div>
                      <div className="font-medium text-gray-900">{currentTheme?.name}</div>
                    </div>
                  </div>

                  {/* 右侧：操作按钮 */}
                  <div className="flex items-center space-x-2">
                    {/* 选择按钮 */}
                    <Sheet open={themeSheetOpen} onOpenChange={setThemeSheetOpen}>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
                          <ChevronsUpDown className="w-4 h-4 text-gray-500" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="max-h-[75vh] overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>11</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                          <div className="flex items-center justify-center space-x-4 overflow-x-auto pb-4">
                            {themes.map((theme) => (
                              <button
                                key={theme.id}
                                onClick={() => {
                                  handleInputChange('selectedTheme', theme.id);
                                  setThemeSheetOpen(false);
                                }}
                                className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-all min-w-[80px] ${form.selectedTheme === theme.id
                                  ? 'bg-blue-50 border-2 border-blue-500'
                                  : 'hover:bg-gray-50 border-2 border-transparent'
                                  }`}
                              >
                                <div className={`w-16 h-16 rounded-lg ${theme.gradient} flex items-center justify-center shadow-sm`}>
                                  <span className="text-2xl">{theme.icon}</span>
                                </div>
                                <div className="text-center">
                                  <h3 className="font-medium text-gray-900 text-sm">{theme.name}</h3>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>

                    {/* 随机按钮 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 h-8 w-8"
                      onClick={randomizeTheme}
                    >
                      <Shuffle className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧 - 表单区域 */}
          <div className="lg:col-span-8 space-y-6">
            {/* 练习标题 */}
            <div>
              <Input
                value={form.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="text-3xl font-bold border-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                placeholder="练习名称"
              />
            </div>

            {/* 时间设置 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm text-gray-500 mb-2 block flex items-center gap-2">
                  🎯 开始
                </Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(value) => handleInputChange('difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="within10">{t.practice.within10}</SelectItem>
                    <SelectItem value="within20">{t.practice.within20}</SelectItem>
                    <SelectItem value="within50">{t.practice.within50}</SelectItem>
                    <SelectItem value="within100">{t.practice.within100}</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-gray-400 mt-1">23:30</div>
              </div>

              <div>
                <Label className="text-sm text-gray-500 mb-2 block flex items-center gap-2">
                  ⏰ 结束
                </Label>
                <div className="text-lg font-medium">{form.questionCount}道题结束</div>
                <div className="text-xs text-gray-400 mt-1">
                  GMT+09:00<br />东京
                </div>
              </div>
            </div>

            {/* 添加练习地点 */}
            <div>
              <Label className="text-sm text-gray-500 mb-2 block flex items-center gap-2">
                📍 添加练习地点
              </Label>
              <Input
                value={form.childName}
                onChange={(e) => handleInputChange('childName', e.target.value)}
                placeholder="线下地点或线上链接"
                className="w-full"
              />
            </div>

            {/* 添加描述 */}
            <div>
              <Label className="text-sm text-gray-500 mb-2 block flex items-center gap-2">
                📝 添加描述
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="简单描述这个练习的目标和内容..."
                className="min-h-[100px] resize-none"
              />
            </div>

            <Separator />

            {/* 练习选项 */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">练习选项</h3>

              {/* 门票 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🎫</span>
                  <span className="font-medium">门票</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-medium">免费</span>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* 需要审核 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">👤</span>
                  <span className="font-medium">需要审核</span>
                </div>
                <Switch
                  checked={false}
                  onCheckedChange={() => { }}
                />
              </div>

              {/* 人数限制 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">👥</span>
                  <span className="font-medium">人数限制</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">无限制</span>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* 性别选择 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🚻</span>
                  <span className="font-medium">适合性别</span>
                </div>
                <RadioGroup
                  value={form.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="boy" id="boy" />
                    <Label htmlFor="boy" className="cursor-pointer">👦 男孩</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="girl" id="girl" />
                    <Label htmlFor="girl" className="cursor-pointer">👧 女孩</Label>
                  </div>
                </RadioGroup>
              </div>

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
                      onKeyPress={(e) => e.key === 'Enter' && addReward()}
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