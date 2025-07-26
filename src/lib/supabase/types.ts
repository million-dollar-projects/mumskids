import { Database } from '@/types/supabase';

export type Practice = Database['public']['Tables']['practices']['Row'];
export type PracticeInsert = Database['public']['Tables']['practices']['Insert'];
export type PracticeUpdate = Database['public']['Tables']['practices']['Update'];

export interface PracticeMetadata {
  title: string;
  description: string;
  rewards: string[];
}

export interface PracticeChildInfo {
  name: string;
  gender: 'boy' | 'girl';
}

export interface PracticeStats {
  total_attempts: number;
  completed_attempts: number;
  average_score: number;
  last_attempt_at?: string;
}

export interface PracticeFormData {
  title: string;
  description: string;
  childName: string;
  gender: 'boy' | 'girl';
  difficulty: 'within10' | 'within20' | 'within50' | 'within100';
  questionCount: number;
  isPublic: boolean;
  rewards: string[];
}

export function practiceFormToDbData(form: PracticeFormData, userId: string): PracticeInsert {
  return {
    created_by: userId,
    is_public: form.isPublic,
    difficulty: form.difficulty,
    question_count: form.questionCount,
    metadata: {
      title: form.title,
      description: form.description,
      rewards: form.rewards
    },
    child_info: {
      name: form.childName,
      gender: form.gender
    },
    stats: {
      total_attempts: 0,
      completed_attempts: 0,
      average_score: 0
    },
    slug: '' // 由数据库生成
  };
}

export function dbDataToPracticeForm(practice: Practice): PracticeFormData {
  const metadata = practice.metadata as unknown as PracticeMetadata;
  const childInfo = practice.child_info as unknown as PracticeChildInfo;

  return {
    title: metadata?.title || '',
    description: metadata?.description || '',
    childName: childInfo?.name || '',
    gender: childInfo?.gender || 'boy',
    difficulty: practice.difficulty,
    questionCount: practice.question_count,
    isPublic: practice.is_public,
    rewards: metadata?.rewards || []
  };
} 