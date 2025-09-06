'use client'

import React, { useMemo } from 'react';
import { messages } from '@/i18n/messages';

interface Question {
  id: number;
  expression: string;
  answer: number;
}

interface A4Settings {
  title: string;
  childName: string;
  difficulty: 'within10' | 'within20' | 'within50' | 'within100';
  calculationType: 'add' | 'sub' | 'addsub';
  questionCount: number;
  spacing: {
    horizontal: number;
    vertical: number;
  };
  showParentMessage: boolean;
  fontSize: number; // 练习题字体大小 (px)
  isBold: boolean; // 是否粗体显示练习题
  carryPractice: boolean; // 是否进位练习（仅加法时有效）
  borrowPractice: boolean; // 是否借位练习（仅减法时有效）
  locale?: string; // 添加语言环境参数
}

interface PrintableA4Props {
  settings: A4Settings;
  regenerateKey?: number;
}

export const PrintableA4 = React.forwardRef<HTMLDivElement, PrintableA4Props>(
  ({ settings, regenerateKey }, ref) => {
    // 获取翻译函数
    const locale = settings.locale || 'zh';
    const t = messages[locale as keyof typeof messages] || messages.zh;

    // 生成数学题目
    const generateQuestions = (settings: A4Settings): Question[] => {
      const { difficulty, calculationType, questionCount, carryPractice, borrowPractice } = settings;
      const questions: Question[] = [];

      // 根据难度等级设置数字范围和最小值
      const getDifficultyConfig = (difficulty: string) => {
        switch (difficulty) {
          case 'within10':
            return {
              maxNum: 10,
              minNum1: 2,    // 第一个数字最小值
              minNum2: 2,    // 第二个数字最小值
              minSum: 4,     // 加法结果最小值
              minDifference: 1, // 减法结果最小值
              complexityThreshold: 0.3 // 复杂度阈值
            };
          case 'within20':
            return {
              maxNum: 20,
              minNum1: 3,
              minNum2: 3,
              minSum: 8,
              minDifference: 2,
              complexityThreshold: 0.4
            };
          case 'within50':
            return {
              maxNum: 50,
              minNum1: 8,
              minNum2: 5,
              minSum: 15,
              minDifference: 3,
              complexityThreshold: 0.5
            };
          case 'within100':
            return {
              maxNum: 100,
              minNum1: 15,
              minNum2: 10,
              minSum: 30,
              minDifference: 5,
              complexityThreshold: 0.6
            };
          default:
            return {
              maxNum: 10,
              minNum1: 2,
              minNum2: 2,
              minSum: 4,
              minDifference: 1,
              complexityThreshold: 0.3
            };
        }
      };

      const config = getDifficultyConfig(difficulty);

      // 检查是否需要进位（加法）：个位数相加大于等于10
      const requiresCarry = (num1: number, num2: number): boolean => {
        const ones1 = num1 % 10;  // 第一个数的个位数
        const ones2 = num2 % 10;  // 第二个数的个位数
        return (ones1 + ones2) >= 10;  // 个位数相加大于等于10需要进位
      };

      // 检查是否需要借位（减法）：被减数的个位数小于减数的个位数
      const requiresBorrow = (num1: number, num2: number): boolean => {
        const ones1 = num1 % 10;  // 被减数的个位数
        const ones2 = num2 % 10;  // 减数的个位数
        return ones1 < ones2;     // 被减数个位数小于减数个位数需要借位
      };

      // 检查题目复杂度是否足够
      const isQuestionComplex = (num1: number, num2: number, operator: string, answer: number): boolean => {
        const maxPossible = config.maxNum;
        const complexity = (num1 + num2) / (maxPossible * 2);
        
        // 避免过于简单的组合
        if (operator === '+') {
          return complexity >= config.complexityThreshold && answer >= config.minSum;
        } else if (operator === '-') {
          return complexity >= config.complexityThreshold && answer >= config.minDifference && num1 >= config.minNum1;
        }
        return false;
      };

      // 生成单个题目
      const generateSingleQuestion = (type: 'add' | 'sub'): { num1: number; num2: number; operator: string; answer: number } => {
        let attempts = 0;
        const maxAttempts = 100; // 增加尝试次数
        
        while (attempts < maxAttempts) {
          let num1: number, num2: number, operator: string, answer: number;
          
          if (type === 'add') {
            if (carryPractice) {
              // 进位练习：直接生成需要进位的题目
              // 确保个位数相加大于等于10
              const ones1 = Math.floor(Math.random() * 9) + 1; // 1-9
              const ones2 = Math.floor(Math.random() * ones1) + (10 - ones1); // 确保相加>=10
              
              // 生成十位数，根据难度调整
              let tens1, tens2;
              if (config.maxNum <= 10) {
                // 10以内难度：十位数只能是0
                tens1 = 0;
                tens2 = 0;
              } else if (config.maxNum <= 20) {
                // 20以内难度：十位数可以是0或10
                tens1 = Math.floor(Math.random() * 2) * 10; // 0, 10
                tens2 = Math.floor(Math.random() * 2) * 10; // 0, 10
              } else {
                // 更高难度：正常生成十位数
                tens1 = Math.floor(Math.random() * Math.min(9, Math.floor(config.maxNum / 10))) * 10;
                tens2 = Math.floor(Math.random() * Math.min(9, Math.floor((config.maxNum - tens1) / 10))) * 10;
              }
              
              num1 = tens1 + ones1;
              num2 = tens2 + ones2;
              answer = num1 + num2;
              operator = '+';
              
              // 确保结果在范围内
              if (answer <= config.maxNum && num1 >= config.minNum1 && num2 >= config.minNum2) {
                return { num1, num2, operator, answer };
              }
            } else {
              // 非进位练习：生成不需要进位的题目
              const minSum = Math.max(config.minSum, config.minNum1 + config.minNum2);
              const maxSum = Math.min(config.maxNum, 18); // 限制在18以内，避免进位
              
              answer = Math.floor(Math.random() * (maxSum - minSum + 1)) + minSum;
              
              const minFirst = Math.max(config.minNum1, Math.ceil(answer * 0.3));
              const maxFirst = Math.min(answer - config.minNum2, Math.floor(answer * 0.7));
              
              if (maxFirst >= minFirst) {
                num1 = Math.floor(Math.random() * (maxFirst - minFirst + 1)) + minFirst;
                num2 = answer - num1;
                operator = '+';
                
                // 确保不需要进位
                if (num2 >= config.minNum2 && !requiresCarry(num1, num2)) {
                  return { num1, num2, operator, answer };
                }
              }
            }
          } else {
            if (borrowPractice) {
              // 借位练习：直接生成需要借位的题目
              // 确保被减数的个位数小于减数的个位数
              const ones1 = Math.floor(Math.random() * 8) + 1; // 1-8
              const ones2 = ones1 + Math.floor(Math.random() * (9 - ones1)) + 1; // 确保ones2 > ones1
              
              // 生成十位数
              const tens1 = Math.floor(Math.random() * Math.min(9, Math.floor(config.maxNum / 10))) * 10;
              const tens2 = Math.floor(Math.random() * Math.min(9, Math.floor((config.maxNum - tens1) / 10))) * 10;
              
              num1 = tens1 + ones1;
              num2 = tens2 + ones2;
              answer = num1 - num2;
              operator = '-';
              
              // 确保结果为正数且在范围内
              if (answer > 0 && answer <= config.maxNum && num1 >= config.minNum1 && num2 >= config.minNum2) {
                return { num1, num2, operator, answer };
              }
            } else {
              // 非借位练习：生成不需要借位的题目
              const minResult = config.minDifference;
              const maxResult = Math.floor(config.maxNum * 0.6);
              
              answer = Math.floor(Math.random() * (maxResult - minResult + 1)) + minResult;
              
              const minMinuend = Math.max(config.minNum1, answer + config.minNum2);
              const maxMinuend = Math.min(config.maxNum, answer + Math.floor(config.maxNum * 0.4));
              
              if (maxMinuend >= minMinuend) {
                num1 = Math.floor(Math.random() * (maxMinuend - minMinuend + 1)) + minMinuend;
                num2 = num1 - answer;
                operator = '-';
                
                // 确保不需要借位
                if (num2 >= config.minNum2 && !requiresBorrow(num1, num2)) {
                  return { num1, num2, operator, answer };
                }
              }
            }
          }
          
          attempts++;
        }
        
        // 如果无法生成符合要求的题目，使用基础逻辑
        if (type === 'add') {
          const num1 = Math.floor(Math.random() * (config.maxNum - config.minNum1)) + config.minNum1;
          const num2 = Math.floor(Math.random() * (config.maxNum - num1 - config.minNum2)) + config.minNum2;
          return { num1, num2, operator: '+', answer: num1 + num2 };
        } else {
          const num1 = Math.floor(Math.random() * (config.maxNum - config.minNum1)) + config.minNum1;
          const num2 = Math.floor(Math.random() * (num1 - config.minDifference - config.minNum2)) + config.minNum2;
          return { num1, num2, operator: '-', answer: num1 - num2 };
        }
      };

      // 生成所有题目
      for (let i = 0; i < questionCount; i++) {
        let questionData: { num1: number; num2: number; operator: string; answer: number };

        if (calculationType === 'add') {
          questionData = generateSingleQuestion('add');
        } else if (calculationType === 'sub') {
          questionData = generateSingleQuestion('sub');
        } else {
          // 加减混合：确保两种类型的题目都有
          const isAddition = Math.random() > 0.5;
          questionData = generateSingleQuestion(isAddition ? 'add' : 'sub');
        }

        questions.push({
          id: i + 1,
          expression: `${questionData.num1} ${questionData.operator} ${questionData.num2} =`,
          answer: questionData.answer
        });
      }

      return questions;
    };

    // 只在影响题目内容的设置变化时或手动重新生成时重新生成题目
    const questions = useMemo(() => {
      return generateQuestions({
        difficulty: settings.difficulty,
        calculationType: settings.calculationType,
        questionCount: settings.questionCount,
        carryPractice: settings.carryPractice,
        borrowPractice: settings.borrowPractice,
        // 这些字段不影响题目生成，但需要传递以满足接口要求
        title: settings.title,
        childName: settings.childName,
        spacing: settings.spacing,
        showParentMessage: settings.showParentMessage,
        fontSize: settings.fontSize,
        isBold: settings.isBold,
        locale: settings.locale
      });
    }, [settings.difficulty, settings.calculationType, settings.questionCount, settings.carryPractice, settings.borrowPractice, regenerateKey]);

    // 获取难度和类型的显示文本
    const getDifficultyText = (difficulty: string) => {
      switch (difficulty) {
        case 'within10': return locale === 'zh' ? '10以内' : 'Within 10';
        case 'within20': return locale === 'zh' ? '20以内' : 'Within 20';
        case 'within50': return locale === 'zh' ? '50以内' : 'Within 50';
        case 'within100': return locale === 'zh' ? '100以内' : 'Within 100';
        default: return locale === 'zh' ? '10以内' : 'Within 10';
      }
    };

    const getCalculationTypeText = (type: string) => {
      switch (type) {
        case 'add': return locale === 'zh' ? '加法' : 'Addition';
        case 'sub': return locale === 'zh' ? '减法' : 'Subtraction';
        case 'addsub': return locale === 'zh' ? '加减混合' : 'Mixed';
        default: return locale === 'zh' ? '加法' : 'Addition';
      }
    };

    return (
      <div
        ref={ref}
        style={{
          width: '210mm',
          height: '297mm',
          padding: '15mm',
          margin: '0 auto',
          backgroundColor: 'white',
          fontFamily: '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "Helvetica Neue", Arial, sans-serif',
          fontSize: '14px',
          lineHeight: '1.5',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          position: 'relative'
        }}
      >
        {/* A4标识 */}
        <div style={{
          position: 'absolute',
          top: '-25px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          A4 (210mm × 297mm)
        </div>
        
        {/* 页面标题 */}
        <div style={{ textAlign: 'center', marginBottom: '15mm' }}>
          <h1 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#333',
            margin: '0 0 10mm 0'
          }}>
            {settings.title}
          </h1>
          
          {/* 学生信息 */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr 1fr', 
            gap: '10mm',
            fontSize: '13px',
            color: '#666'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{fontSize: '14px', fontWeight: 'bold', minWidth: '35px'}}>
                {t.a4.studentInfo.name}
              </span>
              <span style={{ 
                borderBottom: '1px solid #333', 
                flex: 1, 
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '8px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {settings.childName}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{fontSize: '14px', fontWeight: 'bold', minWidth: '35px'}}>
                {t.a4.studentInfo.date}
              </span>
              <span style={{ 
                borderBottom: '1px solid #333', 
                flex: 1, 
                height: '24px',
                marginLeft: '8px'
              }}></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{fontSize: '14px', fontWeight: 'bold', minWidth: '35px'}}>
                {t.a4.studentInfo.time}
              </span>
              <span style={{ 
                borderBottom: '1px solid #333', 
                flex: 1, 
                height: '24px',
                marginLeft: '8px'
              }}></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{fontSize: '14px', fontWeight: 'bold', minWidth: '35px'}}>
                {t.a4.studentInfo.score}
              </span>
              <span style={{ 
                borderBottom: '1px solid #333', 
                flex: 1, 
                height: '24px',
                marginLeft: '8px'
              }}></span>
            </div>
          </div>
        </div>

        {/* 题目区域 */}
        <div style={{ 
          flex: 1,
          display: 'grid',
          gridTemplateColumns: (() => {
            // 根据水平间距动态调整列数
            // 间距越小，列数越多
            if (settings.spacing.horizontal <= 60) {
              return 'repeat(4, 1fr)'; // 4列：间距 20-60
            } else if (settings.spacing.horizontal <= 120) {
              return 'repeat(3, 1fr)'; // 3列：间距 70-120  
            } else {
              return 'repeat(2, 1fr)'; // 2列：间距 130-300
            }
          })(),
          rowGap: `${Math.max(settings.spacing.vertical * 0.8, 8)}px`,
          columnGap: `${Math.max(settings.spacing.horizontal * 0.8, 12)}px`,
          alignContent: 'flex-start'
        }}>
          {questions.map((question) => (
            <div
              key={question.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: `${settings.fontSize}px`,
                fontWeight: settings.isBold ? '600' : '400',
                color: '#333',
                lineHeight: '1.2',
                fontFamily: '"Consolas", "Monaco", "Menlo", "Ubuntu Mono", "Courier New", monospace',
                minHeight: '24px' // 固定最小高度，不随字体大小变化
              }}
            >
              <span style={{ 
                display: 'inline-block',
                minWidth: '80px',
                textAlign: 'left'
              }}>
                {question.expression}
              </span>
            </div>
          ))}
        </div>

        {/* 家长寄语 */}
        {settings.showParentMessage && (
          <div style={{ marginTop: '10mm' }}>
            <div style={{
              border: '2px dashed #ccc',
              borderRadius: '6px',
              height: '120px',
              backgroundColor: 'transparent',
              padding: '8px'
            }}></div>
          </div>
        )}

        {/* 页面底部 */}
        <div style={{ 
          marginTop: '10mm',
          textAlign: 'center',
          fontSize: '11px',
          color: '#999',
          borderTop: '1px solid #eee',
          paddingTop: '5mm'
        }}>
          <p style={{ margin: '0 0 3px 0' }}>
            {t.a4.footer.tagline}
          </p>
          <p style={{ margin: '0' }}>
            {t.a4.footer.difficulty}{getDifficultyText(settings.difficulty)} |
            {t.a4.footer.type}{getCalculationTypeText(settings.calculationType)} |
            {t.a4.footer.questions}{settings.questionCount}{t.a4.footer.questionsUnit}
          </p>
        </div>
      </div>
    );
  }
);

PrintableA4.displayName = 'PrintableA4';
