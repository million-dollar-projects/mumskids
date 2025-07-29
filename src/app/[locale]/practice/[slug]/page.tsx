'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { messages } from '@/i18n/messages';
import { useAuth } from '@/lib/auth/context';
import { ArrowLeft, Play, Clock, BookOpen, User, Star, Edit, Trash2, Share } from 'lucide-react';

interface Practice {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'within10' | 'within20' | 'within50' | 'within100';
  questionCount: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  rewards: string[];
  childName: string;
  gender: 'boy' | 'girl';
}

interface PracticeDetailProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default function PracticeDetailPage({ params }: PracticeDetailProps) {
  const { user } = useAuth();
  const [locale, setLocale] = useState('zh');
  const [slug, setSlug] = useState('');
  const [practice, setPractice] = useState<Practice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
      setSlug(resolvedParams.slug);
    };
    getParams();
  }, [params]);

  const t = messages[locale as keyof typeof messages] || messages.zh;

  useEffect(() => {
    if (slug) {
      const loadPractice = async () => {
        setLoading(true);
        try {
          console.log('Fetching practice:', slug); // 添加日志
          const response = await fetch(`/api/practices/${slug}`);
          console.log('Response status:', response.status); // 添加日志

          if (!response.ok) {
            if (response.status === 404) {
              console.log('Practice not found'); // 添加日志
              setPractice(null);
              return;
            }
            throw new Error('Failed to fetch practice');
          }

          const dbPractice = await response.json();
          console.log('Received practice:', dbPractice); // 添加日志

          const stats = dbPractice.stats as { total_attempts: number; completed_attempts: number; average_score: number };

          setPractice({
            id: dbPractice.id,
            slug: dbPractice.slug,
            title: dbPractice.title,
            description: dbPractice.description,
            difficulty: dbPractice.difficulty,
            questionCount: dbPractice.question_count,
            isPublic: dbPractice.is_public,
            createdBy: user?.id === dbPractice.created_by ? (user?.user_metadata?.full_name || '我') : '其他用户',
            createdAt: new Date(dbPractice.created_at).toLocaleDateString(),
            rewards: dbPractice.rewards || [],
            childName: dbPractice.child_name,
            gender: dbPractice.gender
          });
        } catch (error) {
          console.error('加载练习失败:', error);
          setPractice(null);
        } finally {
          setLoading(false);
        }
      };

      loadPractice();
    }
  }, [slug, user]);

  const getDifficultyLabel = (difficulty: string) => {
    return t.practice[difficulty as keyof typeof t.practice] || difficulty;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'within10': return 'bg-green-100 text-green-800';
      case 'within20': return 'bg-blue-100 text-blue-800';
      case 'within50': return 'bg-yellow-100 text-yellow-800';
      case 'within100': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOwner = practice && (practice.createdBy === (user?.user_metadata?.full_name || '我'));

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

  if (!practice) {
    return (
      <div className="child-container py-8">
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">练习不存在</h3>
            <p className="text-muted-foreground mb-6">
              找不到指定的练习，可能已被删除或您没有访问权限。
            </p>
            <Link href={`/${locale}/practice`}>
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回练习列表
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="child-container py-8">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href={`/${locale}/practice`}>
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.common.back}
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getDifficultyColor(practice.difficulty)}>
                {getDifficultyLabel(practice.difficulty)}
              </Badge>
              {!practice.isPublic && (
                <Badge variant="outline">私人</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold">{practice.title}</h1>
          </div>
        </div>

        <div className="flex gap-2">
          {isOwner && (
            <>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                {t.practice.edit}
              </Button>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                {t.practice.delete}
              </Button>
            </>
          )}
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            分享
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 主要内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 练习描述 */}
          <Card>
            <CardHeader>
              <CardTitle>{t.practice.practiceDetails}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {practice.description}
              </p>
            </CardContent>
          </Card>

          {/* 练习信息 */}
          <Card>
            <CardHeader>
              <CardTitle>练习信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">题目数量</p>
                    <p className="font-medium">{practice.questionCount} 道题</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t.practice.estimatedTime}</p>
                    <p className="font-medium">约 {Math.ceil(practice.questionCount * 0.5)} {t.practice.minutes}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <User className="w-5 h-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t.practice.createdBy}</p>
                    <p className="font-medium">{practice.createdBy}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="text-lg mr-3">📅</span>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.practice.created}</p>
                    <p className="font-medium">{practice.createdAt}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 小朋友信息 */}
          <Card>
            <CardHeader>
              <CardTitle>小朋友信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl">
                  {practice.gender === 'boy' ? '👦' : '👧'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{practice.childName}</h3>
                  <p className="text-muted-foreground">
                    {practice.gender === 'boy' ? t.practice.boy : t.practice.girl}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 奖励设置 */}
          {practice.rewards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t.practice.rewards}</CardTitle>
                <CardDescription>
                  完成练习后可获得的奖励
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {practice.rewards.map((reward, index) => (
                    <div key={index} className="flex items-center p-3 bg-muted rounded-lg">
                      <Star className="w-4 h-4 text-yellow-500 mr-3" />
                      <span>{reward}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 开始练习 */}
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>开始练习</CardTitle>
              <CardDescription>
                点击下方按钮开始答题
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href={`/${locale}/practice/${practice.slug}/quiz`}>
                <Button className="w-full" size="lg">
                  <Play className="w-5 h-5 mr-2" />
                  {t.practice.start}
                </Button>
              </Link>

              <Separator />

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>难度级别：</span>
                  <span className="font-medium">{getDifficultyLabel(practice.difficulty)}</span>
                </div>
                <div className="flex justify-between">
                  <span>题目数量：</span>
                  <span className="font-medium">{practice.questionCount} 道</span>
                </div>
                <div className="flex justify-between">
                  <span>预计用时：</span>
                  <span className="font-medium">{Math.ceil(practice.questionCount * 0.5)} 分钟</span>
                </div>
                {practice.rewards.length > 0 && (
                  <div className="flex justify-between">
                    <span>奖励数量：</span>
                    <span className="font-medium">{practice.rewards.length} 个</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 