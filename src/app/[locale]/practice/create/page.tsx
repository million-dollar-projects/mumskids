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
import { messages } from '@/i18n/messages';
import { useAuth } from '@/lib/auth/context';
import { ArrowLeft, Plus, X, Save, Heart, Star } from 'lucide-react';
import Link from 'next/link';

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
}

export default function CreatePracticePage({ params }: CreatePracticeProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [locale, setLocale] = useState('zh');
  const [saving, setSaving] = useState(false);
  const [newReward, setNewReward] = useState('');

  const [form, setForm] = useState<PracticeForm>({
    title: '',
    description: '',
    childName: '',
    gender: 'boy',
    difficulty: 'within10',
    questionCount: 10,
    isPublic: false,
    rewards: []
  });

  useEffect(() => {
    const getLocale = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    getLocale();
  }, [params]);

  const t = messages[locale as keyof typeof messages] || messages.zh;

  useEffect(() => {
    if (!loading && !user) {
      // 未登录用户重定向到登录页面
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'within10': return 'bg-green-500';
      case 'within20': return 'bg-blue-500';
      case 'within50': return 'bg-yellow-500';
      case 'within100': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="child-container py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // 重定向处理中
  }

  return (
    <div className="child-container py-8">
      {/* 页面头部 */}
      <div className="flex items-center mb-8">
        <Link href={`/${locale}/practice`}>
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.common.back}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t.practice.create}</h1>
          <p className="text-muted-foreground">
            为小朋友创建个性化的数学练习
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 主要表单 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>
                设置练习的基本信息和标识
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">练习标题 *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="例如：小明的10以内加法练习"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">{t.practice.description}</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="简单描述这个练习的目标和内容..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={form.isPublic}
                  onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                />
                <Label htmlFor="isPublic" className="flex flex-col cursor-pointer">
                  <span>{t.practice.isPublic}</span>
                  <span className="text-sm text-muted-foreground">
                    {t.practice.isPublicDesc}
                  </span>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* 小朋友信息 */}
          <Card>
            <CardHeader>
              <CardTitle>小朋友信息</CardTitle>
              <CardDescription>
                个性化设置会影响界面颜色和反馈内容
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="childName">{t.practice.childName} *</Label>
                <Input
                  id="childName"
                  value={form.childName}
                  onChange={(e) => handleInputChange('childName', e.target.value)}
                  placeholder="请输入小朋友的昵称"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>{t.practice.gender}</Label>
                <RadioGroup
                  value={form.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  className="flex space-x-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="boy" id="boy" />
                    <Label htmlFor="boy" className="flex items-center cursor-pointer">
                      <span className="text-blue-600 mr-2">👦</span>
                      {t.practice.boy}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="girl" id="girl" />
                    <Label htmlFor="girl" className="flex items-center cursor-pointer">
                      <span className="text-pink-600 mr-2">👧</span>
                      {t.practice.girl}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* 练习设置 */}
          <Card>
            <CardHeader>
              <CardTitle>练习设置</CardTitle>
              <CardDescription>
                配置练习的难度和题目数量
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t.practice.difficulty}</Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(value) => handleInputChange('difficulty', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="within10">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getDifficultyColor('within10')} mr-2`}></div>
                        {t.practice.within10}
                      </div>
                    </SelectItem>
                    <SelectItem value="within20">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getDifficultyColor('within20')} mr-2`}></div>
                        {t.practice.within20}
                      </div>
                    </SelectItem>
                    <SelectItem value="within50">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getDifficultyColor('within50')} mr-2`}></div>
                        {t.practice.within50}
                      </div>
                    </SelectItem>
                    <SelectItem value="within100">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getDifficultyColor('within100')} mr-2`}></div>
                        {t.practice.within100}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="questionCount">{t.practice.questionCount}</Label>
                <Select
                  value={form.questionCount.toString()}
                  onValueChange={(value) => handleInputChange('questionCount', parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 8, 10, 15, 20, 25, 30].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} 道题 (约 {Math.ceil(num * 0.5)} 分钟)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 奖励设置 */}
          <Card>
            <CardHeader>
              <CardTitle>{t.practice.rewards}</CardTitle>
              <CardDescription>
                设置完成练习后的奖励，激励小朋友学习
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newReward}
                  onChange={(e) => setNewReward(e.target.value)}
                  placeholder={t.practice.rewardPlaceholder}
                  onKeyPress={(e) => e.key === 'Enter' && addReward()}
                  disabled={form.rewards.length >= 5}
                />
                <Button
                  onClick={addReward}
                  disabled={!newReward.trim() || form.rewards.length >= 5}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {form.rewards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t.practice.noRewards}</p>
                  <p className="text-sm">{t.practice.addFirstReward}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {form.rewards.map((reward, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-2" />
                        <span>{reward}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeReward(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {form.rewards.length >= 5 && (
                    <p className="text-sm text-muted-foreground">
                      最多可以添加5个奖励
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏预览 */}
        <div className="space-y-6">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>预览</CardTitle>
              <CardDescription>
                查看练习卡片的显示效果
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <Badge className={`${getDifficultyColor(form.difficulty)} text-white`}>
                    {t.practice[form.difficulty]}
                  </Badge>
                  {!form.isPublic && (
                    <Badge variant="outline">私人</Badge>
                  )}
                </div>
                
                <h3 className="font-semibold">
                  {form.title || '练习标题'}
                </h3>
                
                <p className="text-sm text-muted-foreground">
                  {form.description || '练习描述...'}
                </p>
                
                <Separator />
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>👤 {form.childName || '小朋友昵称'}</p>
                  <p>📝 {form.questionCount} 道题</p>
                  <p>⏱️ 约 {Math.ceil(form.questionCount * 0.5)} 分钟</p>
                </div>

                {form.rewards.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">奖励：</p>
                    <div className="flex flex-wrap gap-1">
                      {form.rewards.slice(0, 2).map((reward, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {reward}
                        </Badge>
                      ))}
                      {form.rewards.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{form.rewards.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <Button
                onClick={handleSave}
                disabled={saving || !form.title.trim() || !form.childName.trim()}
                className="w-full"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t.practice.save}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 