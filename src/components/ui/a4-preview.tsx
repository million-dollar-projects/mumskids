'use client'

import { useEffect, useState } from 'react';

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
}

interface Question {
  id: number;
  expression: string;
  answer: number;
}

interface A4PreviewProps {
  settings: A4Settings;
  isGenerating?: boolean;
}

export function A4Preview({ settings, isGenerating }: A4PreviewProps) {
  const [questions, setQuestions] = useState<Question[]>([]);

  // 生成数学题目
  const generateQuestions = (settings: A4Settings): Question[] => {
    const { difficulty, calculationType, questionCount } = settings;
    const questions: Question[] = [];
    
    // 根据难度确定数字范围
    const getMaxNumber = (difficulty: string): number => {
      switch (difficulty) {
        case 'within10': return 10;
        case 'within20': return 20;
        case 'within50': return 50;
        case 'within100': return 100;
        default: return 10;
      }
    };

    const maxNum = getMaxNumber(difficulty);

    for (let i = 0; i < questionCount; i++) {
      let num1: number, num2: number, operator: string, answer: number;
      
      // 根据计算方式生成题目
      if (calculationType === 'add') {
        num1 = Math.floor(Math.random() * maxNum) + 1;
        num2 = Math.floor(Math.random() * (maxNum - num1)) + 1;
        operator = '+';
        answer = num1 + num2;
      } else if (calculationType === 'sub') {
        num1 = Math.floor(Math.random() * maxNum) + 1;
        num2 = Math.floor(Math.random() * num1) + 1;
        operator = '-';
        answer = num1 - num2;
      } else { // addsub
        if (Math.random() > 0.5) {
          // 加法
          num1 = Math.floor(Math.random() * maxNum) + 1;
          num2 = Math.floor(Math.random() * (maxNum - num1)) + 1;
          operator = '+';
          answer = num1 + num2;
        } else {
          // 减法
          num1 = Math.floor(Math.random() * maxNum) + 1;
          num2 = Math.floor(Math.random() * num1) + 1;
          operator = '-';
          answer = num1 - num2;
        }
      }

      questions.push({
        id: i + 1,
        expression: `${num1} ${operator} ${num2} =`,
        answer
      });
    }

    return questions;
  };

  // 只有当影响题目内容的设置改变时才重新生成题目
  useEffect(() => {
    const newQuestions = generateQuestions(settings);
    setQuestions(newQuestions);
  }, [settings.difficulty, settings.calculationType, settings.questionCount]);

  // 当isGenerating变化时重新生成题目
  useEffect(() => {
    if (isGenerating) {
      // 延迟生成新题目以显示加载状态
      const timer = setTimeout(() => {
        const newQuestions = generateQuestions(settings);
        setQuestions(newQuestions);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, settings.difficulty, settings.calculationType, settings.questionCount]);

  // 计算每行显示的题目数量（根据难度调整）
  const getColumnsPerRow = (): number => {
    switch (settings.difficulty) {
      case 'within10':
      case 'within20':
        return 4; // 简单题目，4列
      case 'within50':
        return 3; // 中等题目，3列
      case 'within100':
        return 2; // 复杂题目，2列
      default:
        return 4;
    }
  };

  const columnsPerRow = getColumnsPerRow();

  // 计算题目的最小和最大宽度
  const getQuestionMinWidth = (): number => {
    switch (settings.difficulty) {
      case 'within10':
      case 'within20':
        return 80; // 简单题目最小宽度
      case 'within50':
        return 90; // 中等题目最小宽度
      case 'within100':
        return 110; // 复杂题目最小宽度
      default:
        return 80;
    }
  };

  const getQuestionMaxWidth = (): number => {
    switch (settings.difficulty) {
      case 'within10':
      case 'within20':
        return 120; // 简单题目最大宽度
      case 'within50':
        return 140; // 中等题目最大宽度
      case 'within100':
        return 160; // 复杂题目最大宽度
      default:
        return 120;
    }
  };

  return (
    <div className="bg-white">
      {/* A4页面容器 */}
      <div className="w-full max-w-none mx-auto bg-white shadow-lg print:shadow-none print:max-w-none a4-container" 
           style={{ 
             aspectRatio: '210/297', // A4比例
             minHeight: '842px' // A4高度（约）
           }}>
        
        {/* 页面内容 */}
        <div className="h-full p-8 print:p-6 flex flex-col">
          {/* 头部信息 */}
          <div className="text-center mb-8 print:mb-6">
            <h1 className="text-2xl print:text-xl font-bold text-gray-900 mb-4">
              {settings.title}
            </h1>
            <div className="grid grid-cols-4 gap-4 text-sm print:text-xs text-gray-600 mb-4">
              <div className="flex items-center">
                <span className="mr-2">姓名：</span>
                <span className="border-b-2 border-gray-800 flex-1 h-6 flex items-center justify-center">
                  {settings.childName && <span className="text-sm">{settings.childName}</span>}
                </span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">日期：</span>
                <span className="border-b-2 border-gray-800 flex-1 h-6"></span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">用时：</span>
                <span className="border-b-2 border-gray-800 flex-1 h-6"></span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">得分：</span>
                <span className="border-b-2 border-gray-800 flex-1 h-6"></span>
              </div>
            </div>
          </div>

          {/* 题目网格 */}
          <div className="flex-1">
            {isGenerating ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-gray-500">正在生成题目...</p>
                </div>
              </div>
            ) : (
              <div 
                className="flex flex-wrap justify-start question-grid"
                style={{
                  gap: `${settings.spacing.vertical}px ${settings.spacing.horizontal}px`
                }}
              >
                {questions.map((question) => (
                  <div 
                    key={question.id} 
                    className="text-center question-item"
                    style={{
                      minWidth: `${getQuestionMinWidth()}px`,
                      maxWidth: `${getQuestionMaxWidth()}px`,
                      flex: `0 0 auto`
                    }}
                  >
                    <div className="text-xl print:text-lg font-semibold text-gray-900 mb-3">
                      {question.expression}
                    </div>
                
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 底部信息 */}
          <div className="mt-8 print:mt-6 text-center text-sm print:text-xs text-gray-500">
            <div className="border-t border-gray-200 pt-4">
              <p>LittlePlus - 让数学学习更有趣</p>
              <p className="mt-1">
                难度：{settings.difficulty === 'within10' ? '10以内' : 
                      settings.difficulty === 'within20' ? '20以内' : 
                      settings.difficulty === 'within50' ? '50以内' : '100以内'} | 
                类型：{settings.calculationType === 'add' ? '加法' : 
                      settings.calculationType === 'sub' ? '减法' : '加减混合'} | 
                题目：{settings.questionCount}题
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 打印样式 */}
      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
          }
          
          @page {
            size: A4;
            margin: 1.5cm;
          }
          
          /* 隐藏非打印元素 */
          header, .no-print {
            display: none !important;
          }
          
          /* A4预览特定样式 */
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:p-6 {
            padding: 1.5rem !important;
          }
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          .print\\:text-xl {
            font-size: 1.25rem !important;
            line-height: 1.5 !important;
          }
          .print\\:text-base {
            font-size: 1rem !important;
            line-height: 1.4 !important;
          }
          .print\\:text-lg {
            font-size: 1.125rem !important;
            line-height: 1.5 !important;
          }
          .print\\:text-xs {
            font-size: 0.75rem !important;
            line-height: 1.3 !important;
          }
          .print\\:gap-y-4 {
            row-gap: 1rem !important;
          }
          .print\\:mt-6 {
            margin-top: 1.5rem !important;
          }
          
          /* 确保题目间距合适 */
          .question-grid {
            page-break-inside: avoid;
          }
          
          /* 避免在题目中间分页 */
          .question-item {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
        
        /* 屏幕预览样式 */
        @media screen {
          .a4-container {
            transform-origin: top left;
            transition: transform 0.2s ease;
          }
          
          /* 在小屏幕上缩放A4预览 */
          @media (max-width: 1024px) {
            .a4-container {
              transform: scale(0.8);
            }
          }
          
          @media (max-width: 768px) {
            .a4-container {
              transform: scale(0.6);
            }
          }
        }
      `}</style>
    </div>
  );
}
