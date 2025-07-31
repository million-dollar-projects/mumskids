export interface Reward {
  id: string;
  text: string;
  name?: string;
  emoji: string;
}

export interface RewardCondition {
  mode: 'normal' | 'timed';
  // Normal mode
  targetCorrect?: number;
  maxTime?: number;
  // Timed mode
  minCorrect?: number;
  maxErrorRate?: number;
}

export interface Practice {
  id: string;
  slug: string;
  title: string;
  description: string;
  child_name: string;
  gender: 'boy' | 'girl';
  difficulty: 'within10' | 'within20' | 'within50' | 'within100';
  calculation_type: 'add' | 'sub' | 'addsub';
  test_mode: 'normal' | 'timed';
  question_count: number | null;
  time_limit: number | null;
  is_public: boolean;
  selected_theme: string;
  reward_distribution_mode: 'random' | 'choice';
  rewards: (string | Reward)[];
  reward_condition: RewardCondition | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  stats: {
    total_attempts: number;
    completed_attempts: number;
    average_score: number;
    best_score: number;
    best_time: number | null;
  };
}

export interface PracticeForm {
  title: string;
  description: string;
  childName: string;
  gender: 'boy' | 'girl';
  difficulty: 'within10' | 'within20' | 'within50' | 'within100';
  testMode: 'normal' | 'timed';
  questionCount: number;
  timeLimit: number; // 单位：分钟
  isPublic: boolean;
  rewards: Reward[];
  rewardDistributionMode: 'random' | 'choice';
  rewardCondition: RewardCondition | null;
  selectedTheme: string;
  calculationType: 'add' | 'sub' | 'addsub';
}