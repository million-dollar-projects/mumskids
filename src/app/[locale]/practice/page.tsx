'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { messages } from '@/i18n/messages';
import { useAuth } from '@/lib/auth/context';
import { Plus, Users, User, Clock, BookOpen } from 'lucide-react';

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
}

interface PracticePageProps {
  params: Promise<{ locale: string }>;
}

export default function PracticePage({ params }: PracticePageProps) {
  const { user } = useAuth();
  const [locale, setLocale] = useState('zh');
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'public' | 'my'>('public');

  useEffect(() => {
    const getLocale = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    getLocale();
  }, [params]);

  const t = messages[locale as keyof typeof messages] || messages.zh;

  useEffect(() => {
    const loadPractices = async () => {
      setLoading(true);
      try {
        const [publicResponse, userResponse] = await Promise.all([
          fetch('/api/practices?type=public'),
          user?.id ? fetch(`/api/practices?type=user&userId=${user.id}`) : Promise.resolve(null)
        ]);

        if (!publicResponse.ok) {
          throw new Error('Failed to fetch public practices');
        }

        const publicPractices = await publicResponse.json();
        const userPractices = userResponse ? await userResponse.json() : [];

        interface RawPractice {
          id: string;
          slug: string;
          title: string;
          description: string;
          rewards: string[];
          difficulty: 'within10' | 'within20' | 'within50' | 'within100';
          question_count: number;
          is_public: boolean;
          created_by: string;
          created_at: string;
        }

        // 使用Map来去重，基于练习的id
        const practiceMap = new Map<string, RawPractice>();

        // 先添加用户的练习
        userPractices.forEach((practice: RawPractice) => {
          practiceMap.set(practice.id, practice);
        });

        // 再添加不在用户练习中的公开练习
        publicPractices.forEach((practice: RawPractice) => {
          if (!practiceMap.has(practice.id)) {
            practiceMap.set(practice.id, practice);
          }
        });

        const formattedPractices = Array.from(practiceMap.values()).map(practice => {
          return {
            id: practice.id,
            slug: practice.slug,
            title: practice.title,
            description: practice.description,
            difficulty: practice.difficulty,
            questionCount: practice.question_count,
            isPublic: practice.is_public,
            createdBy: user?.id === practice.created_by ? (user?.user_metadata?.full_name || '我') : '其他用户',
            createdAt: new Date(practice.created_at).toLocaleDateString(),
            rewards: practice.rewards || []
          };
        });

        setPractices(formattedPractices);
      } catch (error) {
        console.error('加载练习失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPractices();
  }, [user]);

  const filteredPractices = practices.filter(practice => {
    if (activeTab === 'public') {
      return practice.isPublic;
    } else {
      return practice.createdBy === (user?.user_metadata?.full_name || '我');
    }
  });

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

  if (loading) {
    return (
      <div className="bg-purple-50 min-h-screen">
        <Header locale={locale} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">{t.practice.loadingPractices}</p>
          </div>
        </div>
        <Footer locale={locale} />
      </div>
    );
  }

  return (
    <div className="bg-purple-50 min-h-screen">
      <Header locale={locale} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t.practice.title}</h1>
            <p className="text-muted-foreground">
              选择一个练习开始你的数学之旅
            </p>
          </div>
          <Link href={`/${locale}/practice/create`}>
            <Button size="lg" className="mt-4 sm:mt-0">
              <Plus className="w-5 h-5 mr-2" />
              {t.practice.create}
            </Button>
          </Link>
        </div>

        {/* 标签切换 */}
        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg inline-flex">
          <Button
            variant={activeTab === 'public' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('public')}
            className="px-6"
          >
            <Users className="w-4 h-4 mr-2" />
            {t.practice.publicPractices}
          </Button>
          <Button
            variant={activeTab === 'my' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('my')}
            className="px-6"
            disabled={!user}
          >
            <User className="w-4 h-4 mr-2" />
            {t.practice.myPractices}
          </Button>
        </div>

        {/* 练习列表 */}
        {filteredPractices.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.practice.noPractices}</h3>
              <p className="text-muted-foreground mb-6">
                {activeTab === 'public' ? '暂无公开练习' : t.practice.createFirst}
              </p>
              {activeTab === 'my' && (
                <Link href={`/${locale}/practice/create`}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    {t.practice.create}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPractices.map((practice) => (
              <Card key={practice.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getDifficultyColor(practice.difficulty)}>
                      {getDifficultyLabel(practice.difficulty)}
                    </Badge>
                    {!practice.isPublic && (
                      <Badge variant="outline">私人</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{practice.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {practice.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      {practice.questionCount} {t.practice.questions}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      约 {Math.ceil(practice.questionCount * 0.5)} {t.practice.minutes}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {practice.createdBy}
                    </div>
                  </div>

                  {practice.rewards.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">奖励：</p>
                      <div className="flex flex-wrap gap-1">
                        {practice.rewards.slice(0, 2).map((reward, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {reward}
                          </Badge>
                        ))}
                        {practice.rewards.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{practice.rewards.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="flex gap-2">
                    <Link href={`/${locale}/practice/${practice.slug}/quiz`} className="flex-1">
                      <Button className="w-full" size="sm">
                        {t.practice.play}
                      </Button>
                    </Link>
                    <Link href={`/${locale}/practice/${practice.slug}`}>
                      <Button variant="outline" size="sm">
                        详情
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer locale={locale} />
    </div>
  );
} 