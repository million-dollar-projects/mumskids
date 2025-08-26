'use client'

import { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Calculator, Target, FileText, Printer, Move } from 'lucide-react';
import { PrintableA4 } from '@/components/ui/printable-a4';
import {
  difficultyOptions,
  calculationTypeOptions
} from '@/lib/practice-config';

interface CreateA4Props {
  params: Promise<{ locale: string }>;
}

interface A4Settings {
  title: string;
  childName: string;
  difficulty: 'within10' | 'within20' | 'within50' | 'within100';
  calculationType: 'add' | 'sub' | 'addsub';
  questionCount: number;
  spacing: {
    horizontal: number; // 水平间距 (px)
    vertical: number;   // 垂直间距 (px)
  };
  showParentMessage: boolean; // 是否显示家长寄语
}

export default function CreateA4Page({ params }: CreateA4Props) {
  const [locale, setLocale] = useState('zh');
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<A4Settings>({
    title: '数学练习',
    childName: '',
    difficulty: 'within10',
    calculationType: 'add',
    questionCount: 20,
    spacing: {
      horizontal: 400, // 默认16px水平间距
      vertical: 50    // 默认24px垂直间距
    },
    showParentMessage: false // 默认不显示家长寄语
  });

  useEffect(() => {
    const getLocale = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    getLocale();
  }, [params]);

  // A4页面暂时不需要国际化消息
  // const t = messages[locale as keyof typeof messages] || messages.zh;

  // A4页面无需登录验证
  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.push(`/${locale}/auth/login`);
  //   }
  // }, [user, loading, router, locale]);

  const handleSettingChange = (field: keyof A4Settings, value: string | number | boolean | { horizontal: number; vertical: number }) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${settings.title}-${settings.childName || '练习'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    // 模拟生成新题目的延迟
    setTimeout(() => {
      setIsGenerating(false);
    }, 800);
  };

  // A4页面无需验证用户状态，直接显示内容
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-sky-300 via-sky-200 to-blue-300">
  //       <Header locale={locale} backgroundClass="bg-transparent" isFixed={true} />
  //       <div className="child-container py-8 pt-24">
  //         <div className="text-center">
  //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
  //           <p className="text-lg text-muted-foreground">{t.common.loading}</p>
  //         </div>
  //       </div>
  //       <Footer locale={locale} />
  //     </div>
  //   );
  // }

  // if (!user) {
  //   return null;
  // }

  return (
    <>
      {/* 屏幕显示区域 */}
      <div className="min-h-screen bg-gradient-to-br from-sky-300 via-sky-200 to-blue-300 print:hidden">
        <div className="no-print">
          <Header locale={locale} backgroundClass="bg-transparent" isFixed={false} />
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-6">
         

          {/* 主要内容区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 左侧 - A4预览 */}
            <div className="lg:col-span-8">
              <div className="p-0 h-fit">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    A4 预览
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      {isGenerating ? '生成中...' : '重新生成'}
                    </Button>
                    <Button
                      onClick={handlePrint}
                      size="sm"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      打印
                    </Button>
                  </div>
                </div>

                <div style={{ 
                  transform: 'scale(0.69)', 
                  transformOrigin: 'left top',
                  marginBottom: '-150px' // 减少底部空白
                }}>
                  <PrintableA4 ref={printRef} settings={settings} />
                </div>
              </div>
              </div>

              {/* 右侧 - 设置面板 */}
              <div className="lg:col-span-4 no-print">
                <div className="bg-white rounded border p-3 mt-8 space-y-3">
                 
                  {/* 练习标题 */}
                  <div className="space-y-1">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700 hidden">
                      练习标题
                    </Label>
                    <Input
                      id="title"
                      value={settings.title}
                      onChange={(e) => handleSettingChange('title', e.target.value)}
                      placeholder="输入练习标题"
                      className="w-full h-9"
                    />
                  </div>

                  {/* 小朋友姓名 */}
                  <div className="space-y-1">
                    <Label htmlFor="childName" className="text-sm font-medium text-gray-700 hidden">
                      小朋友姓名
                    </Label>
                    <Input
                      id="childName"
                      value={settings.childName}
                      onChange={(e) => handleSettingChange('childName', e.target.value)}
                      placeholder="输入小朋友姓名"
                      maxLength={8}
                      className="w-full h-9"
                    />
                  </div>

                  <Separator className="my-2" />

                  {/* 计算难度 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <Label className="text-sm font-medium text-gray-700">计算难度</Label>
                    </div>
                    <RadioGroup
                      value={settings.difficulty}
                      onValueChange={(value: 'within10' | 'within20' | 'within50' | 'within100') =>
                        handleSettingChange('difficulty', value)
                      }
                      className="space-y-1"
                    >
                      {difficultyOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label
                            htmlFor={option.id}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Separator className="my-2" />

                  {/* 计算方式 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-gray-500" />
                      <Label className="text-sm font-medium text-gray-700">计算方式</Label>
                    </div>
                    <RadioGroup
                      value={settings.calculationType}
                      onValueChange={(value: 'add' | 'sub' | 'addsub') =>
                        handleSettingChange('calculationType', value)
                      }
                      className="space-y-1"
                    >
                      {calculationTypeOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label
                            htmlFor={option.id}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Separator className="my-2" />

                  {/* 题目个数 */}
                  <div className="space-y-1.5">
                    <Label htmlFor="questionCount" className="text-sm font-medium text-gray-700">
                      题目个数 (5-100)
                    </Label>
                    <Input
                      id="questionCount"
                      type="number"
                      min="5"
                      max="100"
                      value={settings.questionCount}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value >= 5 && value <= 100) {
                          handleSettingChange('questionCount', value);
                        }
                      }}
                      placeholder="输入题目数量 (5-100)"
                      className="w-full h-9"
                    />
                  </div>

                  <Separator className="my-2" />

                  {/* 题目间距 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Move className="w-4 h-4 text-gray-500" />
                      <Label className="text-sm font-medium text-gray-700">题目间距</Label>
                    </div>

                    {/* 水平间距 */}
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">水平间距</Label>
                      <div className="flex items-center space-x-3">
                        <Input
                          type="range"
                          min="10"
                          max="400"
                          step="8"
                          value={settings.spacing.horizontal}
                          onChange={(e) => handleSettingChange('spacing', {
                            ...settings.spacing,
                            horizontal: parseInt(e.target.value)
                          })}
                          className="flex-1"
                        />
                        <span className="text-xs text-gray-500 min-w-[32px]">
                          {settings.spacing.horizontal}px
                        </span>
                      </div>
                    </div>

                    {/* 垂直间距 */}
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">垂直间距</Label>
                      <div className="flex items-center space-x-3">
                        <Input
                          type="range"
                          min="2"
                          max="98"
                          step="2"
                          value={settings.spacing.vertical}
                          onChange={(e) => handleSettingChange('spacing', {
                            ...settings.spacing,
                            vertical: parseInt(e.target.value)
                          })}
                          className="flex-1"
                        />
                        <span className="text-xs text-gray-500 min-w-[32px]">
                          {settings.spacing.vertical}px
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  {/* 家长寄语 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700">显示家长寄语</Label>
                      <Switch
                        checked={settings.showParentMessage}
                        onCheckedChange={(checked) => handleSettingChange('showParentMessage', checked)}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      开启后将在页面底部显示家长寄语填写区域
                    </p>
                  </div>
                </div>
              </div>
            </div>
        </main>

        <div className="no-print">
          <Footer locale={locale} />
        </div>
      </div>


    </>
  );
}
