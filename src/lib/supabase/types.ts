import { Database, Json } from '@/types/supabase';

export type Practice = Database['public']['Tables']['practices']['Row'];
export type PracticeInsert = Database['public']['Tables']['practices']['Insert'];
export type PracticeUpdate = Database['public']['Tables']['practices']['Update'];

export interface PracticeStats {
  total_attempts: number;
  completed_attempts: number;
  average_score: number;
  best_score: number;
  best_time: number | null;
  last_attempt_at?: string;
}

export interface Reward {
  id: string;
  text: string;
  emoji: string;
  condition?: {
    mode: 'normal' | 'timed';
    targetCorrect?: number;
    maxTime?: number;
    minCorrect?: number;
    maxErrorRate?: number;
  };
}

export interface PracticeFormData {
  title: string;
  description: string;
  childName: string;
  gender: 'boy' | 'girl';
  difficulty: 'within10' | 'within20' | 'within50' | 'within100';
  calculationType: 'add' | 'sub' | 'addsub';
  testMode: 'normal' | 'timed';
  questionCount: number;
  timeLimit: number;
  isPublic: boolean;
  selectedTheme: string;
  rewardDistributionMode: 'random' | 'choice';
  rewards: Reward[];
}

export function practiceFormToDbData(form: PracticeFormData, userId: string): PracticeInsert {
  return {
    created_by: userId,
    title: form.title,
    description: form.description,
    child_name: form.childName,
    gender: form.gender,
    difficulty: form.difficulty,
    calculation_type: form.calculationType,
    test_mode: form.testMode,
    question_count: form.testMode === 'normal' ? form.questionCount : null,
    time_limit: form.testMode === 'timed' ? form.timeLimit : null,
    is_public: form.isPublic,
    selected_theme: form.selectedTheme,
    reward_distribution_mode: form.rewardDistributionMode,
    rewards: form.rewards as unknown as Json,
    stats: {
      total_attempts: 0,
      completed_attempts: 0,
      average_score: 0,
      best_score: 0,
      best_time: null
    }
  };
}

export function dbDataToPracticeForm(practice: Practice): PracticeFormData {
  return {
    title: practice.title,
    description: practice.description,
    childName: practice.child_name,
    gender: practice.gender,
    difficulty: practice.difficulty,
    calculationType: practice.calculation_type,
    testMode: practice.test_mode,
    questionCount: practice.question_count || 10,
    timeLimit: practice.time_limit || 5,
    isPublic: practice.is_public,
    selectedTheme: practice.selected_theme,
    rewardDistributionMode: practice.reward_distribution_mode,
    rewards: (practice.rewards as unknown as Reward[]) || []
  };
} 