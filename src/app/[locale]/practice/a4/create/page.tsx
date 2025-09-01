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
import { Calculator, Target, FileText, Printer } from 'lucide-react';
import { PrintableA4 } from '@/components/ui/printable-a4';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  getDifficultyOptions,
  getCalculationTypeOptions
} from '@/lib/practice-config';
import { messages } from '@/i18n/messages';

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
  fontSize: number; // 练习题字体大小 (px)
  isBold: boolean; // 是否粗体显示练习题
}

export default function CreateA4Page({ params }: CreateA4Props) {
  const [locale, setLocale] = useState('zh');
  const [isGenerating, setIsGenerating] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | undefined>('practice');
  const [regenerateKey, setRegenerateKey] = useState(0); // 用于强制重新生成题目
  const printRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<A4Settings>({
    title: '数学练习',
    childName: '',
    difficulty: 'within10',
    calculationType: 'add',
    questionCount: 20,
    spacing: {
      horizontal: 150, // 默认150px水平间距，对应3列布局
      vertical: 50    // 默认50px垂直间距
    },
    showParentMessage: false, // 默认不显示家长寄语
    fontSize: 16, // 默认16px字体大小
    isBold: true // 默认粗体显示
  });

  useEffect(() => {
    const getLocale = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    getLocale();
  }, [params]);

  // 获取翻译函数
  const t = messages[locale as keyof typeof messages] || messages.zh;

  // 当locale改变时，更新默认标题
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      title: locale === 'zh' ? '数学练习' : 'Math Practice'
    }));
  }, [locale]);

  const handleSettingChange = (field: keyof A4Settings, value: string | number | boolean | { horizontal: number; vertical: number }) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${settings.title}-${settings.childName || (locale === 'zh' ? '练习' : 'Practice')}`,
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
    // 通过改变key来强制重新生成题目
    setTimeout(() => {
      setRegenerateKey(prev => prev + 1);
      setIsGenerating(false);
    }, 800);
  };

  return (
    <>
      {/* 屏幕显示区域 */}
      <div className="min-h-screen bg-gradient-to-br from-sky-300 via-sky-200 to-blue-300 print:hidden">
        <div className="no-print">
          <Header locale={locale} backgroundClass="bg-transparent" isFixed={false} />
        </div>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-6">
         

          {/* 主要内容区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 左侧 - A4预览 */}
            <div className="lg:col-span-8">
              <div className="p-0 h-fit">
                <div className="flex items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {t.a4.title}
                  </h2>
                </div>

                <div style={{ 
                  transform: 'scale(0.82)', 
                  transformOrigin: 'left top',
                  marginBottom: '-150px' // 减少底部空白
                }}>
                  <PrintableA4 ref={printRef} settings={{...settings, locale}} regenerateKey={regenerateKey} />
                </div>
              </div>
              </div>

              {/* 右侧 - 操作按钮 */}
              <div className="lg:col-span-4 no-print">
                <div className="bg-white rounded border p-3 mt-11 mb-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      variant="outline"
                      size="sm"
                      className="cursor-pointer flex-1"
                    >
                      {isGenerating ? t.a4.generating : t.a4.regenerate}
                    </Button>
                    <Button
                      onClick={handlePrint}
                      size="sm"
                      className="cursor-pointer flex items-center gap-2 flex-1"
                    >
                      <Printer className="w-4 h-4" />
                      {t.a4.print}
                    </Button>
                  </div>
                </div>

                {/* 设置面板 */}
                <div className="bg-gray-50 rounded border p-3 space-y-3">
                 
                  {/* 练习标题 */}
                  <div className="space-y-1">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700 hidden">
                      {t.a4.practiceTitle}
                    </Label>
                    <Input
                      id="title"
                      value={settings.title}
                      onChange={(e) => handleSettingChange('title', e.target.value)}
                      placeholder={t.a4.practiceTitlePlaceholder}
                      className="w-full h-9 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                    />
                  </div>

                  {/* 小朋友姓名 */}
                  <div className="space-y-1 mb-0">
                    <Label htmlFor="childName" className="text-sm font-medium text-gray-700 hidden">
                      {t.a4.childName}
                    </Label>
                    <Input
                      id="childName"
                      value={settings.childName}
                      onChange={(e) => handleSettingChange('childName', e.target.value)}
                      placeholder={t.a4.childNamePlaceholder}
                      maxLength={8}
                      className="w-full h-9 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                    />
                  </div>

                  <Separator className="my-1" />

                  {/* 练习设置 */}
                  <Accordion type="single" collapsible className="w-full mb-0" value={openAccordion} onValueChange={setOpenAccordion}>
                    <AccordionItem value="practice">
                      <AccordionTrigger className="text-sm font-medium text-gray-700">
                        {t.a4.practiceSettings}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        {/* 计算难度 */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-gray-500" />
                            <Label className="text-sm font-medium text-gray-700">{t.a4.calculationDifficulty}</Label>
                          </div>
                          <RadioGroup
                            value={settings.difficulty}
                            onValueChange={(value: 'within10' | 'within20' | 'within50' | 'within100') =>
                              handleSettingChange('difficulty', value)
                            }
                            className="space-y-1"
                          >
                            {getDifficultyOptions(locale).map((option) => (
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

                        {/* 计算方式 */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-gray-500" />
                            <Label className="text-sm font-medium text-gray-700">{t.a4.calculationType}</Label>
                          </div>
                          <RadioGroup
                            value={settings.calculationType}
                            onValueChange={(value: 'add' | 'sub' | 'addsub') =>
                              handleSettingChange('calculationType', value)
                            }
                            className="space-y-1"
                          >
                            {getCalculationTypeOptions(locale).map((option) => (
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

                        {/* 题目个数 */}
                        <div className="space-y-1.5">
                          <Label htmlFor="questionCount" className="text-sm font-medium text-gray-700">
                            {t.a4.questionCountRange}
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
                            placeholder={t.a4.questionCountPlaceholder}
                            className="w-full h-9 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Separator className="my-2" />

                  {/* 家长寄语 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700">{t.a4.parentMessage}</Label>
                      <Switch
                        checked={settings.showParentMessage}
                        onCheckedChange={(checked) => handleSettingChange('showParentMessage', checked)}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {t.a4.parentMessageDesc}
                    </p>
                  </div>
                </div>

                {/* 显示设置 */}
                <div className="bg-gray-50 rounded border px-3 py-0 mb-4 mt-3">
                  <Accordion type="single" collapsible className="w-full" value={openAccordion} onValueChange={setOpenAccordion}>
                    <AccordionItem value="appearance">
                      <AccordionTrigger className="text-sm font-medium text-gray-700">
                        {t.a4.displaySettings}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        {/* 字体大小 */}
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">{t.a4.fontSize}</Label>
                          <div className="flex items-center space-x-3">
                            <Input
                              type="range"
                              min="12"
                              max="24"
                              step="1"
                              value={settings.fontSize}
                              onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-xs text-gray-500 min-w-[32px]">
                              {settings.fontSize}px
                            </span>
                          </div>
                        </div>
                        
                        {/* 粗体设置 */}
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-gray-600">{t.a4.boldDisplay}</Label>
                          <Switch
                            checked={settings.isBold}
                            onCheckedChange={(checked) => handleSettingChange('isBold', checked)}
                          />
                        </div>
                        
                        {/* 水平间距 */}
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">{t.a4.horizontalSpacing}</Label>
                          <div className="flex items-center space-x-3">
                            <Input
                              type="range"
                              min="20"
                              max="300"
                              step="10"
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
                          <Label className="text-xs text-gray-600">{t.a4.verticalSpacing}</Label>
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
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
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
