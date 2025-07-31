'use client'

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Play, Star, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getEncouragements, getConsolations, getFinalMessage } from '@/config/messages';
import { defaultRewards, type DefaultReward } from '@/config/default-rewards';
import { getThemeById, getDefaultTheme, getThemeColors as getThemeColorsById, type Theme } from '@/lib/themes';

interface PracticeDetailProps {
  params: Promise<{ locale: string; slug: string }>;
}

import { Practice } from '@/types/practice';

interface Question {
  question: string;
  correctAnswer: number;
  choices: number[];
  correctIndex: number;
}

export default function PracticeDetailPage({ params }: PracticeDetailProps) {
  const [locale, setLocale] = useState('zh');
  const [slug, setSlug] = useState('');
  const [practice, setPractice] = useState<Practice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(-1);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | ''>('');
  const [showNextButton, setShowNextButton] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [showReward, setShowReward] = useState(false);

  // 计时器相关状态
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  // 奖励选择相关状态
  const [showRewardChoice, setShowRewardChoice] = useState(false);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
      setSlug(resolvedParams.slug);
    };
    getParams();
  }, [params]);

  // 获取练习数据
  useEffect(() => {
    if (slug) {
      const loadPractice = async () => {
        setLoading(true);
        setError(null);
        try {
          console.log('Fetching practice:', slug);
          const response = await fetch(`/api/practices/${slug}`);
          console.log('Response status:', response.status);

          if (!response.ok) {
            if (response.status === 404) {
              setError('练习不存在或您没有访问权限');
              return;
            }
            throw new Error('Failed to fetch practice');
          }

          const practiceData = await response.json();
          console.log('Received practice:', practiceData);
          setPractice(practiceData);
        } catch (error) {
          console.error('加载练习失败:', error);
          setError('加载练习失败，请稍后重试');
        } finally {
          setLoading(false);
        }
      };

      loadPractice();
    }
  }, [slug]);

  // 检查是否满足奖励条件 - 需要在 endGame 之前定义
  const checkRewardCondition = useCallback((correctCount: number, totalCount: number, completionTimeMs: number) => {
    if (!practice?.rewards || practice.rewards.length === 0) {
      return false; // 没有设置奖励
    }

    const rewardCondition = practice.reward_condition;
    if (!rewardCondition) {
      // 没有设置奖励条件，使用默认条件：100%正确率
      return correctCount === totalCount;
    }

    const completionTimeMinutes = completionTimeMs / (1000 * 60); // 转换为分钟

    if (rewardCondition.mode === 'normal' || practice.test_mode === 'normal') {
      // 普通模式：需要达到目标正确题数且在时间限制内完成
      const targetCorrect = rewardCondition.targetCorrect || Math.max(1, Math.ceil(totalCount * 0.8));
      const maxTime = rewardCondition.maxTime || Math.max(1, Math.ceil(totalCount * 0.5));

      return correctCount >= targetCorrect && completionTimeMinutes <= maxTime;
    } else if (rewardCondition.mode === 'timed' || practice.test_mode === 'timed') {
      // 计时模式：需要达到最少正确题数且错误率不超过限制
      const minCorrect = rewardCondition.minCorrect || Math.max(5, Math.ceil((practice.time_limit || 5) * 3 * 0.7));
      const maxErrorRate = rewardCondition.maxErrorRate !== undefined ? rewardCondition.maxErrorRate : 20;
      const errorRate = totalCount > 0 ? ((totalCount - correctCount) / totalCount) * 100 : 0;

      return correctCount >= minCorrect && errorRate <= maxErrorRate;
    }

    return false;
  }, [practice]);

  // 获取所有可用奖励的文本数组
  const getAvailableRewards = useCallback(() => {
    if (!practice?.rewards || practice.rewards.length === 0) {
      return [];
    }

    return practice.rewards.map(reward => {
      if (typeof reward === 'string') {
        return reward;
      } else if (typeof reward === 'object' && reward !== null) {
        return reward.text || reward.name || '奖励';
      }
      return '奖励';
    });
  }, [practice]);

  // 获取奖励的图标
  const getRewardEmoji = useCallback((rewardText: string) => {
    if (!practice?.rewards || practice.rewards.length === 0) {
      return '🎁'; // 默认图标
    }

    // 首先尝试从数据库中的奖励对象获取图标
    for (const reward of practice.rewards) {
      if (typeof reward === 'object' && reward !== null) {
        if (reward.text === rewardText || reward.name === rewardText) {
          return reward.emoji || '🎁';
        }
      }
    }

    // 如果数据库中没有找到，尝试从默认奖励配置中匹配
    const defaultReward = defaultRewards.find((dr: DefaultReward) => dr.text === rewardText);
    if (defaultReward) {
      return defaultReward.emoji;
    }

    return '🎁'; // 默认图标
  }, [practice]);

  // 获取随机奖励
  const getRandomReward = useCallback(() => {
    const availableRewards = getAvailableRewards();
    if (availableRewards.length === 0) {
      return '完成练习'; // 默认奖励文本
    }

    const randomIndex = Math.floor(Math.random() * availableRewards.length);
    return availableRewards[randomIndex];
  }, [getAvailableRewards]);

  // 重新开始游戏
  const restartGame = () => {
    setGameActive(false);
    setGameEnded(false);
    setShowReward(false);
    setShowRewardChoice(false);
    setSelectedReward(null);
    setCurrentQuestion(null);
    setCorrectAnswers(0);
    setTotalQuestions(0);
    setFeedback('');
    setFeedbackType('');
    setSelectedAnswer(-1);
    setShowNextButton(false);

    // 重置计时器
    setStartTime(null);
    setElapsedTime(0);
    setTotalTime(0);
  };

  // 结束游戏函数 - 需要在 useEffect 之前定义
  const endGame = useCallback(() => {
    setGameActive(false);
    setGameEnded(true);

    // 记录总完成时间
    let finalTime = 0;
    if (startTime) {
      finalTime = Date.now() - startTime;
      setTotalTime(finalTime);
    }

    // 检查是否满足奖励条件
    const shouldShowReward = checkRewardCondition(correctAnswers, totalQuestions, finalTime);

    if (shouldShowReward && practice?.reward_distribution_mode === 'choice') {
      // 自选模式：显示奖励选择对话框
      setShowRewardChoice(true);
    } else if (shouldShowReward && practice?.reward_distribution_mode === 'random') {
      // 随机模式：直接显示随机奖励
      setShowReward(true);
      setSelectedReward(getRandomReward());
    }
  }, [startTime, correctAnswers, totalQuestions, checkRewardCondition, practice, getRandomReward]);

  // 计时器逻辑
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (gameActive && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        setElapsedTime(elapsed);

        // 检查计时模式是否时间到期
        if (practice?.test_mode === 'timed' && practice.time_limit) {
          const timeLimit = practice.time_limit * 60 * 1000; // 转换为毫秒
          if (elapsed >= timeLimit) {
            endGame();
          }
        }
      }, 100); // 每100ms更新一次，提供更流畅的显示
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameActive, startTime, practice, endGame]);





  const generateQuestion = (): Question => {
    if (!practice) {
      // 默认题目
      return {
        question: '1 + 1',
        correctAnswer: 2,
        choices: [1, 2, 3, 4],
        correctIndex: 1
      };
    }

    // 根据难度设置数字范围
    let maxNum = 10;
    switch (practice.difficulty) {
      case 'within10':
        maxNum = 10;
        break;
      case 'within20':
        maxNum = 20;
        break;
      case 'within50':
        maxNum = 50;
        break;
      case 'within100':
        maxNum = 100;
        break;
    }

    const num1 = Math.floor(Math.random() * maxNum) + 1;
    const num2 = Math.floor(Math.random() * maxNum) + 1;

    let question: string, correctAnswer: number;
    let operation: string;

    // 根据计算类型选择运算
    switch (practice.calculation_type) {
      case 'add':
        operation = '+';
        question = `${num1} + ${num2}`;
        correctAnswer = num1 + num2;
        break;
      case 'sub':
        operation = '-';
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        question = `${larger} - ${smaller}`;
        correctAnswer = larger - smaller;
        break;
      case 'addsub':
      default:
        const operations = ['+', '-'];
        operation = operations[Math.floor(Math.random() * operations.length)];
        if (operation === '+') {
          question = `${num1} + ${num2}`;
          correctAnswer = num1 + num2;
        } else {
          const larger = Math.max(num1, num2);
          const smaller = Math.min(num1, num2);
          question = `${larger} - ${smaller}`;
          correctAnswer = larger - smaller;
        }
        break;
    }

    const choices = [correctAnswer];
    const maxChoice = Math.max(correctAnswer * 2, maxNum * 2);

    while (choices.length < 4) {
      let wrongAnswer;
      if (operation === '+' || operation === '×') {
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5;
      } else {
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 8) - 4;
      }

      if (wrongAnswer >= 0 && wrongAnswer <= maxChoice && !choices.includes(wrongAnswer)) {
        choices.push(wrongAnswer);
      }
    }

    // Shuffle choices
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }

    const correctIndex = choices.indexOf(correctAnswer);

    return { question, correctAnswer, choices, correctIndex };
  };

  const getMaxQuestions = () => {
    return practice?.question_count || 10;
  };



  // 格式化时间显示
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}秒`;
  };

  // 获取计时器显示文本和颜色
  const getTimerDisplay = () => {
    if (!practice || !gameActive) return { text: '0秒', color: 'bg-blue-500' };

    if (practice.test_mode === 'timed' && practice.time_limit) {
      // 计时模式：显示倒计时
      const timeLimit = practice.time_limit * 60 * 1000; // 转换为毫秒
      const remaining = Math.max(0, timeLimit - elapsedTime);
      const isUrgent = remaining < 30000; // 最后30秒显示红色

      return {
        text: formatTime(remaining),
        color: isUrgent ? 'bg-red-500' : remaining < 60000 ? 'bg-orange-500' : 'bg-blue-500'
      };
    } else {
      // 普通模式：显示已用时间
      return {
        text: formatTime(elapsedTime),
        color: 'bg-blue-500'
      };
    }
  };





  const startGame = () => {
    const now = Date.now();
    setStartTime(now);
    setElapsedTime(0);
    setTotalTime(0);
    setGameActive(true);
    setCorrectAnswers(0);
    setTotalQuestions(0);
    setGameEnded(false);
    setShowReward(false);
    nextQuestion();
  };

  const nextQuestion = () => {
    // 计时模式下不受题目数量限制，只受时间限制
    if (practice?.test_mode !== 'timed') {
      const maxQuestions = getMaxQuestions();
      if (totalQuestions >= maxQuestions) {
        endGame();
        return;
      }
    }

    const newQuestion = generateQuestion();
    setCurrentQuestion(newQuestion);
    setFeedback('');
    setFeedbackType('');
    setShowNextButton(false);
    setSelectedAnswer(-1);
  };

  const selectAnswer = (choiceIndex: number) => {
    if (!gameActive || selectedAnswer !== -1 || !currentQuestion) return;

    setSelectedAnswer(choiceIndex);
    setTotalQuestions(prev => prev + 1);

    if (choiceIndex === currentQuestion.correctIndex) {
      setCorrectAnswers(prev => prev + 1);

      // 计时模式：不显示鼓励话语，立即跳转
      if (practice?.test_mode === 'timed') {
        setFeedbackType('correct');
        setTimeout(() => {
          nextQuestion();
        }, 500); // 缩短延迟时间
      } else {
        // 普通模式：显示鼓励话语
        const encouragements = getEncouragements(practice?.child_name || '小朋友');
        const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
        setFeedback(encouragement);
        setFeedbackType('correct');

        // Auto advance after correct answer
        setTimeout(() => {
          const maxQuestions = getMaxQuestions();
          if (totalQuestions + 1 < maxQuestions) {
            nextQuestion();
          } else {
            endGame();
          }
        }, 2000);
      }
    } else {
      // 计时模式：不显示安慰话语，立即跳转
      if (practice?.test_mode === 'timed') {
        setFeedbackType('incorrect');
        setTimeout(() => {
          nextQuestion();
        }, 500); // 缩短延迟时间
      } else {
        // 普通模式：显示安慰话语和下一题按钮
        const consolations = getConsolations(practice?.child_name || '小朋友');
        const consolation = consolations[Math.floor(Math.random() * consolations.length)];
        setFeedback(`${consolation} 正确答案是 ${currentQuestion.correctAnswer}`);
        setFeedbackType('incorrect');

        // Show next button for incorrect answers
        setTimeout(() => {
          setShowNextButton(true);
        }, 2000);
      }
    }
  };

  const getAccuracy = () => {
    return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  };

  const getFinalEmoji = () => {
    const accuracy = getAccuracy();
    if (accuracy === 100) return '👑';
    if (accuracy >= 90) return '🌟';
    if (accuracy >= 70) return '👍';
    return '💪';
  };

  // 获取当前主题
  const getCurrentTheme = (): Theme => {
    if (!practice?.selected_theme) return getDefaultTheme();
    return getThemeById(practice.selected_theme) || getDefaultTheme();
  };

  // 根据主题生成配色方案
  const getThemeColors = () => {
    const theme = getCurrentTheme();
    return getThemeColorsById(theme.id);
  };

  return (
    <>
      {/* 添加自定义抖动动画 */}
      <style jsx global>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg) translateX(-2px); }
          75% { transform: rotate(3deg) translateX(2px); }
        }
      `}</style>

      <div className={`min-h-screen p-4 relative overflow-hidden bg-gradient-to-br ${getCurrentTheme().bgClass}`}>
        {/* Decorative stars */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[10%] left-[10%] text-yellow-400 text-xl animate-pulse">⭐</div>
          <div className="absolute top-[20%] right-[20%] text-yellow-300 text-lg animate-bounce">✨</div>
          <div className="absolute bottom-[30%] left-[15%] text-yellow-400 text-xl animate-pulse delay-1000">🌟</div>
          <div className="absolute bottom-[20%] right-[15%] text-yellow-300 text-lg animate-bounce delay-500">⭐</div>
          <div className="absolute top-[30%] right-[30%] text-yellow-400 text-lg animate-pulse delay-2000">✨</div>
        </div>

        <div className="relative z-10 max-w-md mx-auto pb-20 sm:pb-0">
          
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-4">
            <Image src="/images/plus.png" alt="LittlePlus" width={32} height={32} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
            <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${getThemeColors().text} tracking-wide`}>
              LittlePlus
            </p>
          </div>

          {/* Game Container */}
          <Card className={`border-0 sm:border-0 ${getThemeColors().border}  sm:shadow-none bg-white relative overflow-hidden rounded sm:rounded`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${getThemeColors().secondary}/30 rounded`}></div>

            <CardHeader className="relative z-10 text-center pb-2 sm:pb-4">
              <CardTitle className={`text-xl hidden sm:text-2xl md:text-3xl font-bold ${getThemeColors().text} mb-2 sm:mb-4 tracking-wide`}>
                {getCurrentTheme().icon} {practice?.child_name || '小朋友'}的数学小天地 {getCurrentTheme().icon}
              </CardTitle>

              {/* Score Board */}
              <div className="flex gap-1 sm:gap-2 mb-3 sm:mb-4">
                <Badge className={`flex-1 ${getThemeColors().accent} hover:${getThemeColors().accent} text-white py-1.5 sm:py-2 px-1 sm:px-2 text-xs font-bold`}>
                  🏆 答对: {correctAnswers}
                </Badge>
                {practice?.test_mode === 'timed' ? (
                  <Badge className={`flex-1 ${getThemeColors().accent} hover:${getThemeColors().accent} text-white py-1.5 sm:py-2 px-1 sm:px-2 text-xs font-bold`}>
                    ⏰ 限时: {practice.time_limit}分钟
                  </Badge>
                ) : (
                  <Badge className={`flex-1 ${getThemeColors().accent} hover:${getThemeColors().accent} text-white py-1.5 sm:py-2 px-1 sm:px-2 text-xs font-bold`}>
                    📚 题数: {totalQuestions}/{getMaxQuestions()}
                  </Badge>
                )}
                {gameActive && (
                  <Badge className={`flex-1 ${getTimerDisplay().color} hover:${getTimerDisplay().color} text-white py-1.5 sm:py-2 px-1 sm:px-2 text-xs font-bold`}>
                    ⏱️ {getTimerDisplay().text}
                  </Badge>
                )}
              </div>

              {/* Progress Bar - 只在开始练习后显示 */}
              {(gameActive || gameEnded) && (
                <div className="mb-3 sm:mb-4">
                  <div className="text-sm font-bold text-gray-700 mb-2">练习进度</div>
                  <div className="w-full h-3 sm:h-4 bg-gray-200 border border-gray-300 sm:border-2 sm:border-gray-800 rounded-lg overflow-hidden">
                    <div
                      className={`h-full transition-all duration-800 ease-out relative ${getThemeColors().progress}`}
                      style={{
                        width: `${practice?.test_mode === 'timed' && practice.time_limit
                          ? Math.min(100, (elapsedTime / (practice.time_limit * 60 * 1000)) * 100) // 基于时间进度
                          : (totalQuestions / getMaxQuestions()) * 100 // 基于题目进度
                          }%`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent className="relative z-10 px-3 sm:px-4 pb-4 sm:pb-6">
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600">加载中...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-700">练习不存在</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <Link href={`/${locale}/practice`}>
                    <Button className={`${getThemeColors().button} text-white font-bold py-3 px-6 rounded-lg shadow-lg`}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      返回
                    </Button>
                  </Link>
                </div>
              )}

              {!loading && !error && practice && !gameActive && !gameEnded && (
                <div className="space-y-4">
                  {/* Practice Info */}
                  <Card className={`${getThemeColors().light}`}>
                    <CardContent className="py-4">
                      <h3 className={`font-bold text-lg ${getThemeColors().text} mb-2`}>{practice.title}</h3>
                      {practice.description && (
                        <p className={`${getThemeColors().text} mb-3`}>{practice.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={`${getThemeColors().accent} text-white`}>
                          {practice.difficulty === 'within10' && '10以内'}
                          {practice.difficulty === 'within20' && '20以内'}
                          {practice.difficulty === 'within50' && '50以内'}
                          {practice.difficulty === 'within100' && '100以内'}
                        </Badge>
                        <Badge className={`${getThemeColors().accent} text-white`}>
                          {practice.calculation_type === 'add' && '加法'}
                          {practice.calculation_type === 'sub' && '减法'}
                          {practice.calculation_type === 'addsub' && '加减混合'}
                        </Badge>
                        {practice?.test_mode !== 'timed' && (
                          <Badge className={`${getThemeColors().accent} text-white`}>
                            {getMaxQuestions()} 道题
                          </Badge>
                        )}
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${getThemeColors().text}`}>
                        <span>为 {practice.child_name} 定制</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rewards Preview */}
                  {practice.rewards && practice.rewards.length > 0 && (
                    <Card className={`${getThemeColors().light}`}>
                      <CardContent className="py-4">
                        <h4 className={`font-bold ${getThemeColors().text} mb-2 flex items-center`}>
                          <Star className="w-4 h-4 mr-2" />
                          完成可获得奖励
                        </h4>
                         {/* 奖励条件 */}
                         <div className={`text-sm ${getThemeColors().text} bg-purple-500/2 px-1 py-1 mb-2 rounded ${getThemeColors().border}`}>
                          <div className="text-xs">
                            {practice.reward_condition ? (
                              practice.test_mode === 'normal' ? (
                                `需要答对 ${practice.reward_condition.targetCorrect || Math.max(1, Math.ceil((practice.question_count || 10) * 0.8))} 题且在 ${practice.reward_condition.maxTime || Math.max(1, Math.ceil((practice.question_count || 10) * 0.5))} 分钟内完成`
                              ) : (
                                `需要答对至少 ${practice.reward_condition.minCorrect || Math.max(5, Math.ceil((practice.time_limit || 5) * 3 * 0.7))} 题，错误率不超过 ${practice.reward_condition.maxErrorRate !== undefined ? practice.reward_condition.maxErrorRate : 20}%`
                              )
                            ) : (
                              '需要全部答对才能获得奖励'
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {practice.rewards.slice(0, 12).map((reward, index) => {
                            const rewardText = typeof reward === 'string'
                              ? reward
                              : (typeof reward === 'object' && reward !== null)
                                ? (reward.text || reward.name || '奖励')
                                : '奖励';
                            const rewardEmoji = typeof reward === 'object' && reward !== null
                              ? (reward.emoji || '🎁')
                              : getRewardEmoji(rewardText);
                            
                            return (
                              <Badge key={index} className={`${getThemeColors().accent} text-white flex items-center gap-1`}>
                                <span>{rewardEmoji}</span>
                                <span>{rewardText}</span>
                              </Badge>
                            );
                          })}
                          {practice.rewards.length > 3 && (
                            <Badge className={`bg-gradient-to-r ${getThemeColors().secondary} hidden text-white`}>
                              +{practice.rewards.length - 3} 更多
                            </Badge>
                          )}
                        </div>
                    
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    onClick={startGame}
                    className={`${getThemeColors().button} text-white font-bold py-3 sm:py-4 px-4 sm:px-6 text-base sm:text-lg rounded-lg shadow-lg transform transition-transform hover:scale-105 sm:relative fixed bottom-4 left-4 right-4 z-50 sm:bottom-auto sm:left-auto sm:right-auto sm:z-auto sm:w-full`}
                  >
                    开始
                    <Play className="w-5 h-5 mr-2" />
                  </Button>
                </div>
              )}

              {gameActive && currentQuestion && (
                <>
                  {/* Question */}
                  <Card className={`bg-gradient-to-br ${getThemeColors().secondary} border-0 sm:border-4 ${getThemeColors().border} mb-4 sm:mb-6 relative`}>
                    <div className="absolute -top-4 -right-2 text-3xl animate-bounce">🤔</div>
                    <CardContent className="py-6 text-center">
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                        {currentQuestion.question} = ?
                      </div>
                    </CardContent>
                  </Card>

                  {/* Choices */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    {currentQuestion.choices.map((choice, index) => (
                      <div
                        key={index}
                        className={`
                        ${selectedAnswer === index && index !== currentQuestion.correctIndex
                            ? 'animate-[wiggle_0.3s_ease-in-out_3]'
                            : ''
                          }
                      `}
                      >
                        <Button
                          onClick={() => selectAnswer(index)}
                          disabled={selectedAnswer !== -1}
                          className={`
                          w-full h-12 sm:h-16 text-xl sm:text-2xl font-bold border-2 sm:border-4 transition-all duration-200 transform
                          ${selectedAnswer === -1
                              ? `${getThemeColors().button} ${getThemeColors().border} text-white hover:scale-105 active:scale-95`
                              : selectedAnswer === index
                                ? index === currentQuestion.correctIndex
                                  ? 'bg-green-500 border-green-700 text-white animate-pulse'
                                  : 'bg-red-500 border-red-700 text-white'
                                : index === currentQuestion.correctIndex && selectedAnswer !== -1
                                  ? 'bg-green-500 border-green-700 text-white animate-pulse'
                                  : 'bg-gray-400 border-gray-600 text-gray-200'
                            }
                        `}
                        >
                          {choice}
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Feedback - 计时模式下不显示文字反馈 */}
                  {feedback && practice?.test_mode !== 'timed' && (
                    <Card className={`mb-3 sm:mb-4 border-0 sm:border-4 ${feedbackType === 'correct'
                      ? 'bg-green-100 border-green-500'
                      : 'bg-red-100 border-red-500'
                      }`}>
                      <CardContent className="py-4 text-center">
                        <div className={`text-lg font-bold ${feedbackType === 'correct' ? 'text-green-800' : 'text-red-800'
                          }`}>
                          {feedback}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {gameEnded && (
                <>
                  {/* Final Score */}
                  <Card className={`bg-gradient-to-br ${getThemeColors().secondary}/20 border-0 sm:border-4 ${getThemeColors().border} mb-3 sm:mb-4`}>
                    <CardContent className="py-6 text-center">
                      <div className={`text-lg sm:text-xl font-bold ${getThemeColors().text} mb-2`}>
                        {(() => {
                          const message = getFinalMessage(getAccuracy(), correctAnswers, practice?.child_name || '小朋友');
                          return (
                            <>
                              <div>{message.first}</div>
                              <div>{message.second}</div>
                            </>
                          );
                        })()}
                      </div>
                      <div className={`text-lg font-bold ${getThemeColors().text} mb-2`}>
                        正确率: {getAccuracy()}%
                      </div>
                      {totalTime > 0 && (
                        <div className={`text-md font-bold ${getThemeColors().text}`}>
                          完成时间: {formatTime(totalTime)}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Reward */}
                  {showReward && (
                    <Card className={`${getThemeColors().light} border-0 sm:border-4 ${getThemeColors().border} mb-3 sm:mb-4 animate-pulse`}>
                      <CardHeader>
                        <CardTitle className={`text-center ${getThemeColors().text} text-xl font-bold`}>
                          恭喜获得奖励
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="text-3xl sm:text-4xl mb-2 animate-bounce">
                          {selectedReward ? getRewardEmoji(selectedReward) : '🎁'}
                        </div>
                        <div className={`text-base sm:text-lg font-bold ${getThemeColors().text} mb-2`}>
                          {selectedReward || '完成练习'}！
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 如果没有获得奖励，显示鼓励信息 */}
                  {!showReward && !showRewardChoice && practice?.rewards && practice.rewards.length > 0 && (
                    <Card className={`${getThemeColors().light} border-0 sm:border-2 ${getThemeColors().border} mb-3 sm:mb-4`}>
                      <CardContent className="py-4 text-center">
                        <div className="text-2xl mb-2">💪</div>
                        <div className={`text-sm ${getThemeColors().text} mb-2`}>
                          继续努力，下次就能获得奖励了！
                        </div>
                        <div className={`text-xs ${getThemeColors().text} opacity-70`}>
                          {practice.reward_condition ? (
                            practice.test_mode === 'normal' ? (
                              `需要答对 ${practice.reward_condition.targetCorrect || Math.max(1, Math.ceil(totalQuestions * 0.8))} 题且在 ${practice.reward_condition.maxTime || Math.max(1, Math.ceil(totalQuestions * 0.5))} 分钟内完成`
                            ) : (
                              `需要答对至少 ${practice.reward_condition.minCorrect || Math.max(5, Math.ceil((practice.time_limit || 5) * 3 * 0.7))} 题，错误率不超过 ${practice.reward_condition.maxErrorRate !== undefined ? practice.reward_condition.maxErrorRate : 20}%`
                            )
                          ) : (
                            '需要全部答对才能获得奖励'
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 奖励选择对话框 */}
                  <Dialog open={showRewardChoice} onOpenChange={setShowRewardChoice}>
                    <DialogContent className={`max-w-sm mx-4 sm:mx-auto px-3 sm:px-4 border-0 sm:border-2 ${getThemeColors().border}`}>
                      <DialogHeader>
                        <DialogTitle className={`text-center ${getThemeColors().text} text-xl font-bold`}>
                          🎉 恭喜获得奖励！
                        </DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="text-center mb-4">
                          <p className={`text-base sm:text-lg ${getThemeColors().text} mb-2 font-bold`}>
                            太棒了！
                          </p>
                          <p className={`text-sm ${getThemeColors().text} mb-3 sm:mb-4 font-bold`}>
                            赶快选择一个你喜欢的奖励吧！
                          </p>
                        </div>
                        <div className="grid gap-3 max-h-60 overflow-y-auto">
                          {getAvailableRewards().map((reward, index) => (
                            <Button
                              key={index}
                              onClick={() => {
                                setSelectedReward(reward);
                                setShowRewardChoice(false);
                                setShowReward(true);
                              }}
                              className={`w-full ${getThemeColors().button} text-white font-bold py-3 sm:py-4 px-3 sm:px-4 rounded text-left transform transition-transform shadow-md`}
                            >
                              <div className="flex items-center">
                                <span className="text-sm sm:text-base mr-2 sm:mr-3">{getRewardEmoji(reward)}</span>
                                <span className="text-base sm:text-lg">{reward}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Restart Button */}
                  <div className="text-center">
                    <Button
                      onClick={restartGame}
                      className={`${getThemeColors().button} text-white cursor-pointer font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg`}
                    >
                      再来一次
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          {/* Next Button */}
          {showNextButton && (
            <div className="text-center mt-4 w-full">
                <Button
                 onClick={nextQuestion}
                 className={`${getThemeColors().button} w-full text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded`}
               >
                 下一题
                 <ChevronRight className="w-4 h-4 ml-0" />
               </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}