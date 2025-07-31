'use client'

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Play, Star, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { getEncouragements, getConsolations, getFinalMessage } from '@/config/messages';

interface PracticeDetailProps {
  params: Promise<{ locale: string; slug: string }>;
}

interface Reward {
  id?: string;
  text?: string;
  name?: string;
  emoji?: string;
}

interface RewardCondition {
  mode: 'normal' | 'timed';
  // 一般模式
  targetCorrect?: number; // 目标正确题数
  maxTime?: number; // 最大时间限制（分钟）
  // 计时模式（时间限制来自练习设置）
  minCorrect?: number; // 最少正确题数
  maxErrorRate?: number; // 最大错误率（百分比）
}

interface Practice {
  id: string;
  slug: string;
  title: string;
  description: string;
  child_name: string;
  gender: 'boy' | 'girl';
  difficulty: 'within10' | 'within20' | 'within50' | 'within100';
  calculation_type: 'add' | 'subtract' | 'multiply' | 'divide' | 'mixed';
  test_mode: 'normal' | 'timed';
  question_count: number | null;
  time_limit: number | null;
  is_public: boolean;
  selected_theme: string;
  reward_distribution_mode: string;
  rewards: (string | Reward)[];
  reward_condition: RewardCondition | null;
  created_by: string;
  created_at: string;
}

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
      case 'subtract':
        operation = '-';
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        question = `${larger} - ${smaller}`;
        correctAnswer = larger - smaller;
        break;
      case 'multiply':
        operation = '×';
        const smallNum1 = Math.floor(Math.random() * 10) + 1;
        const smallNum2 = Math.floor(Math.random() * 10) + 1;
        question = `${smallNum1} × ${smallNum2}`;
        correctAnswer = smallNum1 * smallNum2;
        break;
      case 'divide':
        operation = '÷';
        const divisor = Math.floor(Math.random() * 9) + 2;
        const quotient = Math.floor(Math.random() * 10) + 1;
        const dividend = divisor * quotient;
        question = `${dividend} ÷ ${divisor}`;
        correctAnswer = quotient;
        break;
      case 'mixed':
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



  // 获取随机奖励
  const getRandomReward = () => {
    if (practice?.rewards && practice.rewards.length > 0) {
      const randomReward = practice.rewards[Math.floor(Math.random() * practice.rewards.length)];
      if (typeof randomReward === 'string') {
        return randomReward;
      } else if (typeof randomReward === 'object' && randomReward !== null) {
        return randomReward.text || randomReward.name || '完成练习';
      }
    }
    return '完成练习'; // 默认奖励文本
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
    const maxQuestions = getMaxQuestions();
    if (totalQuestions >= maxQuestions) {
      endGame();
      return;
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
    } else {
      const consolations = getConsolations(practice?.child_name || '小朋友');
      const consolation = consolations[Math.floor(Math.random() * consolations.length)];
      setFeedback(`${consolation} 正确答案是 ${currentQuestion.correctAnswer}`);
      setFeedbackType('incorrect');

      // Show next button for incorrect answers
      setTimeout(() => {
        setShowNextButton(true);
      }, 2000);
    }
  };



  const restartGame = () => {
    setGameActive(false);
    setGameEnded(false);
    setShowReward(false);
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

  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      {/* Decorative stars */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] text-yellow-400 text-xl animate-pulse">⭐</div>
        <div className="absolute top-[20%] right-[20%] text-yellow-300 text-lg animate-bounce">✨</div>
        <div className="absolute bottom-[30%] left-[15%] text-yellow-400 text-xl animate-pulse delay-1000">🌟</div>
        <div className="absolute bottom-[20%] right-[15%] text-yellow-300 text-lg animate-bounce delay-500">⭐</div>
        <div className="absolute top-[30%] right-[30%] text-yellow-400 text-lg animate-pulse delay-2000">✨</div>
      </div>

      <div className="relative z-10 max-w-md mx-auto">

        {/* Game Container */}
        <Card className="border-4 border-orange-400 shadow-2xl bg-white relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-yellow-100/50 rounded-2xl"></div>

          <CardHeader className="relative z-10 text-center pb-4">
            <CardTitle className="text-2xl md:text-3xl font-bold text-orange-600 mb-4 tracking-wide">
              🌟 {practice?.child_name || '小朋友'}的数学小天地 🌟
            </CardTitle>

            {/* Characters */}
            <div className="flex justify-center gap-4 mb-4">
              <span className="text-3xl animate-bounce">🦁</span>
              <span className="text-3xl animate-bounce delay-300">🐸</span>
              <span className="text-3xl animate-bounce delay-700">🐙</span>
            </div>

            {/* Score Board */}
            <div className="flex gap-2 mb-4">
              <Badge className="flex-1 bg-teal-500 hover:bg-teal-500 text-white py-2 px-2 text-xs font-bold">
                🏆 答对: {correctAnswers}
              </Badge>
              <Badge className="flex-1 bg-teal-500 hover:bg-teal-500 text-white py-2 px-2 text-xs font-bold">
                📚 题数: {totalQuestions}/{getMaxQuestions()}
              </Badge>
              {gameActive && (
                <Badge className={`flex-1 ${getTimerDisplay().color} hover:${getTimerDisplay().color} text-white py-2 px-2 text-xs font-bold`}>
                  ⏱️ {getTimerDisplay().text}
                </Badge>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="text-sm font-bold text-gray-700 mb-2">游戏进度</div>
              <div className="w-full h-4 bg-gray-200 border-2 border-gray-800 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-800 ease-out relative"
                  style={{ width: `${(totalQuestions / getMaxQuestions()) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 px-4 pb-6">
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
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    错误
                  </Button>
                </Link>
              </div>
            )}

            {!loading && !error && practice && !gameActive && !gameEnded && (
              <div className="space-y-4">
                {/* Practice Info */}
                <Card className="bg-blue-50 border-2 border-blue-200">
                  <CardContent className="py-4">
                    <h3 className="font-bold text-lg text-blue-800 mb-2">{practice.title}</h3>
                    {practice.description && (
                      <p className="text-blue-700 mb-3">{practice.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className="bg-blue-500 text-white">
                        {practice.difficulty === 'within10' && '10以内'}
                        {practice.difficulty === 'within20' && '20以内'}
                        {practice.difficulty === 'within50' && '50以内'}
                        {practice.difficulty === 'within100' && '100以内'}
                      </Badge>
                      <Badge className="bg-green-500 text-white">
                        {practice.calculation_type === 'add' && '加法'}
                        {practice.calculation_type === 'subtract' && '减法'}
                        {practice.calculation_type === 'multiply' && '乘法'}
                        {practice.calculation_type === 'divide' && '除法'}
                        {practice.calculation_type === 'mixed' && '混合运算'}
                      </Badge>
                      <Badge className="bg-purple-500 text-white">
                        {getMaxQuestions()} 道题
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <span className="text-2xl">{practice.gender === 'boy' ? '👦' : '👧'}</span>
                      <span>为 {practice.child_name} 定制</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Rewards Preview */}
                {practice.rewards && practice.rewards.length > 0 && (
                  <Card className="bg-pink-50 border-2 border-pink-200">
                    <CardContent className="py-4">
                      <h4 className="font-bold text-pink-800 mb-2 flex items-center">
                        <Star className="w-4 h-4 mr-2" />
                        完成奖励
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {practice.rewards.slice(0, 3).map((reward, index) => (
                          <Badge key={index} className="bg-pink-500 text-white">
                            {typeof reward === 'string'
                              ? reward
                              : (typeof reward === 'object' && reward !== null)
                                ? (reward.text || reward.name || '奖励')
                                : '奖励'}
                          </Badge>
                        ))}
                        {practice.rewards.length > 3 && (
                          <Badge className="bg-pink-300 text-pink-800">
                            +{practice.rewards.length - 3} 更多
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={startGame}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 text-lg rounded-lg shadow-lg transform transition-transform hover:scale-105"
                >
                  <Play className="w-5 h-5 mr-2" />
                  🚀 开始游戏
                </Button>
              </div>
            )}

            {gameActive && currentQuestion && (
              <>
                {/* Question */}
                <Card className="bg-yellow-300 border-4 border-orange-400 mb-6 relative">
                  <div className="absolute -top-4 -right-2 text-3xl animate-bounce">🤔</div>
                  <CardContent className="py-6 text-center">
                    <div className="text-3xl md:text-4xl font-bold text-orange-800">
                      {currentQuestion.question} = ?
                    </div>
                  </CardContent>
                </Card>

                {/* Choices */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {currentQuestion.choices.map((choice, index) => (
                    <Button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      disabled={selectedAnswer !== -1}
                      className={`
                        h-16 text-2xl font-bold border-4 transition-all duration-200 transform
                        ${selectedAnswer === -1
                          ? 'bg-orange-500 hover:bg-orange-600 border-orange-700 text-white hover:scale-105 active:scale-95'
                          : selectedAnswer === index
                            ? index === currentQuestion.correctIndex
                              ? 'bg-green-500 border-green-700 text-white animate-pulse'
                              : 'bg-red-500 border-red-700 text-white animate-pulse'
                            : index === currentQuestion.correctIndex && selectedAnswer !== -1
                              ? 'bg-green-500 border-green-700 text-white animate-pulse'
                              : 'bg-gray-400 border-gray-600 text-gray-200'
                        }
                      `}
                    >
                      {choice}
                    </Button>
                  ))}
                </div>

                {/* Feedback */}
                {feedback && (
                  <Card className={`mb-4 border-4 ${feedbackType === 'correct'
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

                {/* Next Button */}
                {showNextButton && (
                  <div className="text-center">
                    <Button
                      onClick={nextQuestion}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
                    >
                      ➡️ 下一题
                    </Button>
                  </div>
                )}
              </>
            )}

            {gameEnded && (
              <>
                {/* Final Score */}
                <Card className="bg-yellow-100 border-4 border-yellow-600 mb-4">
                  <CardContent className="py-6 text-center">
                    <div className="text-5xl mb-4 animate-bounce">{getFinalEmoji()}</div>
                    <div className="text-xl font-bold text-yellow-800 mb-2">
                      {getFinalMessage(getAccuracy(), correctAnswers, practice?.child_name || '小朋友')}
                    </div>
                    <div className="text-lg font-bold text-yellow-700 mb-2">
                      正确率: {getAccuracy()}%
                    </div>
                    {totalTime > 0 && (
                      <div className="text-md font-bold text-yellow-600">
                        完成时间: {formatTime(totalTime)}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Reward */}
                {showReward && (
                  <Card className="bg-pink-100 border-4 border-pink-500 mb-4 animate-pulse">
                    <CardHeader>
                      <CardTitle className="text-center text-pink-600 text-xl font-bold">
                        🎉 恭喜获得奖励！
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-4xl mb-2 animate-bounce">
                        🎁
                      </div>
                      <div className="text-lg font-bold text-pink-600 mb-2">
                        获得奖励：{selectedReward || '完成练习'}！
                      </div>
                      <div className="text-sm text-pink-500">
                        你已经满足了奖励条件，真棒！
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 如果没有获得奖励，显示鼓励信息 */}
                {!showReward && !showRewardChoice && practice?.rewards && practice.rewards.length > 0 && (
                  <Card className="bg-blue-50 border-2 border-blue-200 mb-4">
                    <CardContent className="py-4 text-center">
                      <div className="text-2xl mb-2">💪</div>
                      <div className="text-sm text-blue-600 mb-2">
                        继续努力，下次就能获得奖励了！
                      </div>
                      <div className="text-xs text-blue-500">
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
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-center text-xl font-bold text-pink-600">
                        🎉 选择你的奖励！
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-2">🎁</div>
                        <p className="text-sm text-gray-600 mb-4">
                          恭喜你完成了练习！请选择一个你喜欢的奖励：
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
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-4 px-4 rounded-lg text-left transform transition-transform hover:scale-105 shadow-lg"
                          >
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">🎁</span>
                              <span className="text-lg">{reward}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                      <div className="mt-4 text-center">
                        <Button
                          onClick={() => setShowRewardChoice(false)}
                          variant="outline"
                          className="text-gray-600 hover:text-gray-800"
                        >
                          稍后选择
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Restart Button */}
                <div className="text-center">
                  <Button
                    onClick={restartGame}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg"
                  >
                    🔄 重新开始
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}