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
  showParentMessage: boolean; // 是否显示家长寄语
}

interface Question {
  id: number;
  expression: string;
  answer: number;
}

interface A4PreviewProps {
  settings: A4Settings;
  isGenerating?: boolean;
  printPreviewMode?: boolean; // 新增：打印预览模式
}

export function A4Preview({ settings, isGenerating, printPreviewMode = false }: A4PreviewProps) {
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
  }, [settings]);

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
  }, [isGenerating, settings]);

  // 移除了getColumnsPerRow函数，因为当前使用CSS Grid自动布局

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

  // 动态计算样式类
  const containerClasses = printPreviewMode
    ? "w-full max-w-none mx-auto bg-white a4-container print-preview-mode"
    : "w-full max-w-none mx-auto bg-white shadow-lg a4-container";

  const contentClasses = printPreviewMode
    ? "h-full a4-padding flex flex-col"
    : "h-full a4-padding flex flex-col";

  return (
    <div className="bg-white">
      {/* A4页面容器 */}
      <div className={containerClasses}>

        {/* 页面内容 - 使用Grid布局确保底部固定 */}
        <div className="h-full a4-padding grid grid-rows-[auto_1fr_auto] gap-0">
          {/* 头部信息 */}
          <div className="text-center a4-header-spacing">
            <h1 className="a4-title-text font-bold text-gray-900 a4-title-spacing">
              {settings.title}
            </h1>
            <div className="grid grid-cols-4 gap-4 a4-label-text text-gray-600 a4-info-spacing">
              <div className="flex items-center">
                <span className="mr-2">姓名：</span>
                <span className="border-b-2 border-gray-800 flex-1 h-6 flex items-center justify-center">
                  {settings.childName && <span className="a4-name-text">{settings.childName}</span>}
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

          {/* 题目区域 - 占据剩余空间 */}
          <div className="overflow-hidden">
            {isGenerating ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-gray-500">正在生成题目...</p>
                </div>
              </div>
            ) : (
              <div
                className="flex flex-wrap justify-start question-grid h-full"
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
                    <div className="a4-question-text font-semibold text-gray-900 a4-question-spacing">
                      {question.expression}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 底部区域 - 固定在底部 */}
          <div className="a4-bottom-section">
            {/* 家长寄语 */}
            {settings.showParentMessage && (
              <div className="a4-parent-message-spacing">
                <div className="text-left a4-label-text text-gray-700">
                  <h3 className="font-medium a4-parent-title-spacing">家长寄语：</h3>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-2 a4-message-box"
                    style={{
                      background: 'transparent'
                    }}
                  >
                    {/* 空白区域，用于手写家长寄语 */}
                  </div>
                </div>
              </div>
            )}

            {/* 底部信息 */}
            <div className="a4-footer-spacing text-center a4-footer-text text-gray-500">
              <div className="border-t border-gray-200 pt-2">
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
      </div>

      {/* 统一样式系统 */}
      <style jsx global>{`
        /* CSS变量定义 - 确保屏幕和打印使用相同的值 */
        :root {
          --a4-width: 210mm;
          --a4-height: 297mm;
          --a4-padding: 1.5rem;
          --a4-title-size: 1.5rem;
          --a4-label-size: 0.875rem;
          --a4-question-size: 1.25rem;
          --a4-footer-size: 0.75rem;
          --a4-name-size: 0.875rem;
          --a4-header-margin: 1rem;
          --a4-title-margin: 0.75rem;
          --a4-info-margin: 0.75rem;
          --a4-question-margin: 0.75rem;
          --a4-parent-margin: 0.5rem;
          --a4-parent-title-margin: 0.25rem;
          --a4-footer-margin: 0.5rem;
          --a4-message-height: 40px;
          --a4-questions-min-height: 300px;
          --a4-bottom-height: 120px; /* 底部区域预留高度 */
        }

        /* A4容器基础样式 */
        .a4-container {
          width: var(--a4-width);
          height: var(--a4-height);
          max-width: 100%;
          margin: 0 auto;
          font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
          position: relative;
        }

        /* 响应式容器 - 在屏幕上自适应显示 */
        @media screen {
          .a4-container {
            width: var(--a4-width);
            height: var(--a4-height);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            /* 根据视口宽度动态缩放 */
            transform: scale(min(0.8, (100vw - 4rem) / var(--a4-width)));
            transform-origin: top center;
            margin: 0 auto 2rem auto;
          }

          /* 打印预览模式 - 完全模拟打印样式 */
          .print-preview-mode {
            width: var(--a4-width) !important;
            height: var(--a4-height) !important;
            box-shadow: none !important;
            transform: scale(min(0.7, (100vw - 2rem) / var(--a4-width)));
            transform-origin: top center;
          }
        }

        /* 统一的间距和字体样式 */
        .a4-padding {
          padding: var(--a4-padding);
        }

        .a4-title-text {
          font-size: var(--a4-title-size);
          line-height: 1.4;
        }

        .a4-label-text {
          font-size: var(--a4-label-size);
          line-height: 1.3;
        }

        .a4-question-text {
          font-size: var(--a4-question-size);
          line-height: 1.4;
        }

        .a4-footer-text {
          font-size: var(--a4-footer-size);
          line-height: 1.3;
        }

        .a4-name-text {
          font-size: var(--a4-name-size);
          line-height: 1.3;
        }

        .a4-header-spacing {
          margin-bottom: var(--a4-header-margin);
        }

        .a4-title-spacing {
          margin-bottom: var(--a4-title-margin);
        }

        .a4-info-spacing {
          margin-bottom: var(--a4-info-margin);
        }

        .a4-question-spacing {
          margin-bottom: var(--a4-question-margin);
        }

        .a4-parent-message-spacing {
          margin-top: var(--a4-parent-margin);
        }

        .a4-parent-title-spacing {
          margin-bottom: var(--a4-parent-title-margin);
        }

        .a4-footer-spacing {
          margin-top: var(--a4-footer-margin);
        }

        .a4-message-box {
          min-height: var(--a4-message-height);
        }

        /* 底部区域样式 */
        .a4-bottom-section {
          background: white;
        }

        /* 题目网格优化 */
        .question-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-start;
          align-content: flex-start;
          height: 100%;
          max-height: 100%;
        }

        .question-item {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        /* 打印专用样式 */
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
            margin: 0;
          }
          
          /* 隐藏非打印元素 */
          header, .no-print {
            display: none !important;
          }

          /* 打印时使用精确的A4尺寸 */
          .a4-container {
            width: var(--a4-width) !important;
            height: var(--a4-height) !important;
            max-width: none !important;
            box-shadow: none !important;
            transform: none !important;
            margin: 0 !important;
            overflow: hidden !important; /* 防止内容溢出导致分页 */
          }

          /* 打印时的内容布局控制 */
          .a4-padding {
            height: calc(var(--a4-height) - 3rem) !important; /* 减去padding */
            overflow: hidden !important;
          }

          /* 家长寄语在打印时高度受限 */
          .a4-message-box {
            min-height: 35px !important;
            max-height: 35px !important;
            overflow: hidden !important;
            padding: 0.25rem !important;
          }

          /* 打印时减少间距 */
          .a4-parent-message-spacing {
            margin-top: 0.25rem !important;
          }

          .a4-footer-spacing {
            margin-top: 0.25rem !important;
          }

          /* 确保题目不会跨页分割 */
          .question-grid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            max-height: 100% !important;
            overflow: hidden !important;
          }
          
          .question-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* 强制所有内容在一页内 */
          .a4-container * {
            page-break-inside: avoid !important;
          }

          /* 打印时的精确尺寸控制 */
          .print-preview-mode {
            transform: none !important;
          }
        }

        /* 移除固定断点的响应式调整，使用动态缩放 */
      `}</style>
    </div>
  );
}
