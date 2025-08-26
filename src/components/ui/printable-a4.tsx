'use client'

import React from 'react';

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
}

interface PrintableA4Props {
  settings: A4Settings;
}

export const PrintableA4 = React.forwardRef<HTMLDivElement, PrintableA4Props>(
  ({ settings }, ref) => {
    // 生成数学题目
    const generateQuestions = (settings: A4Settings): Question[] => {
      const { difficulty, calculationType, questionCount } = settings;
      const questions: Question[] = [];

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
        } else {
          if (Math.random() > 0.5) {
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * (maxNum - num1)) + 1;
            operator = '+';
            answer = num1 + num2;
          } else {
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
            operator = '-';
            answer = num1 - num2;
          }
        }

        // 格式化数字，确保对齐，使用不间断空格
        const formatNumber = (num: number): string => {
          if (maxNum >= 100) {
            return num.toString().padStart(2, '\u00A0');
          } else if (maxNum >= 10) {
            return num.toString().padStart(2, '\u00A0');
          }
          return num.toString();
        };

        questions.push({
          id: i + 1,
          expression: `${formatNumber(num1)} ${operator} ${formatNumber(num2)} =`,
          answer
        });
      }

      return questions;
    };

    const questions = generateQuestions(settings);

    return (
      <div
        ref={ref}
        style={{
          width: '210mm',
          height: '297mm',
          padding: '15mm',
          margin: '0 auto',
          backgroundColor: 'white',
          fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
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
              <span style={{fontSize: '14px', fontWeight: 'bold'}}>姓名：</span>
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
              <span style={{fontSize: '14px', fontWeight: 'bold'}}>日期：</span>
              <span style={{ 
                borderBottom: '1px solid #333', 
                flex: 1, 
                height: '24px',
                marginLeft: '8px'
              }}></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{fontSize: '14px', fontWeight: 'bold'}}>用时：</span>
              <span style={{ 
                borderBottom: '1px solid #333', 
                flex: 1, 
                height: '24px',
                marginLeft: '8px'
              }}></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{fontSize: '14px', fontWeight: 'bold'}}>得分：</span>
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
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          alignContent: 'flex-start',
          gap: `${Math.max(settings.spacing.vertical * 0.8, 8)}px ${Math.max(settings.spacing.horizontal * 0.8, 12)}px`
        }}>
          {questions.map((question) => (
            <div
              key={question.id}
              style={{
                minWidth: '85px',
                maxWidth: '100px',
                textAlign: 'left',
                fontSize: '16px',
                fontWeight: '600',
                color: '#333',
                lineHeight: '1.4',
                fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
                whiteSpace: 'pre'
              }}
            >
              {question.expression}
            </div>
          ))}
        </div>

        {/* 家长寄语 */}
        {settings.showParentMessage && (
          <div style={{ marginTop: '10mm' }}>
            <h3 style={{ 
              fontSize: '13px', 
              fontWeight: '500', 
              color: '#666',
              margin: '0 0 5mm 0'
            }}>
              家长寄语：
            </h3>
            <div style={{
              border: '2px dashed #ccc',
              borderRadius: '6px',
              height: '30px',
              backgroundColor: 'transparent'
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
          <p style={{ margin: '0 0 3px 0' }}>LittlePlus - 让数学学习更有趣</p>
          <p style={{ margin: '0' }}>
            难度：{settings.difficulty === 'within10' ? '10以内' :
              settings.difficulty === 'within20' ? '20以内' :
                settings.difficulty === 'within50' ? '50以内' : '100以内'} |
            类型：{settings.calculationType === 'add' ? '加法' :
              settings.calculationType === 'sub' ? '减法' : '加减混合'} |
            题目：{settings.questionCount}题
          </p>
        </div>
      </div>
    );
  }
);

PrintableA4.displayName = 'PrintableA4';
