'use client'

import { createClient } from '@/lib/supabase/client';
import type { Practice, PracticeFormData, practiceFormToDbData } from '@/lib/supabase/types';

// 客户端API
export async function listPublicPractices(): Promise<Practice[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('practices')
    .select()
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取公开练习列表失败:', error);
    throw error;
  }

  return data || [];
}

export async function listUserPractices(userId: string): Promise<Practice[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('practices')
    .select()
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取用户练习列表失败:', error);
    throw error;
  }

  return data || [];
}

export async function getPracticeBySlug(slug: string): Promise<Practice | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('practices')
    .select()
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('获取练习失败:', error);
    throw error;
  }

  return data;
}

export async function createPractice(formData: PracticeFormData, userId: string): Promise<Practice> {
  const supabase = createClient();
  const dbData = {
    created_by: userId,
    title: formData.title,
    description: formData.description || '',
    child_name: formData.childName,
    gender: formData.gender,
    difficulty: formData.difficulty,
    calculation_type: formData.calculationType || 'add',
    test_mode: formData.testMode,
    question_count: formData.testMode === 'normal' ? formData.questionCount : null,
    time_limit: formData.testMode === 'timed' ? formData.timeLimit : null,
    is_public: formData.isPublic,
    selected_theme: formData.selectedTheme || 'default',
    reward_distribution_mode: formData.rewardDistributionMode || 'random',
    rewards: formData.rewards || [],
    stats: {
      total_attempts: 0,
      completed_attempts: 0,
      average_score: 0,
      best_score: 0,
      best_time: null
    }
  };

  const { data, error } = await supabase
    .from('practices')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error('创建练习失败:', error);
    throw error;
  }

  return data;
}

export async function updatePractice(id: string, formData: PracticeFormData, userId: string): Promise<Practice> {
  const supabase = createClient();
  const dbData = {
    is_public: formData.isPublic,
    difficulty: formData.difficulty,
    question_count: formData.questionCount,
    metadata: {
      title: formData.title,
      description: formData.description,
      rewards: formData.rewards
    },
    child_info: {
      name: formData.childName,
      gender: formData.gender
    }
  };

  const { data, error } = await supabase
    .from('practices')
    .update(dbData)
    .eq('id', id)
    .eq('created_by', userId)
    .select()
    .single();

  if (error) {
    console.error('更新练习失败:', error);
    throw error;
  }

  return data;
}

export async function deletePractice(id: string, userId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('practices')
    .delete()
    .eq('id', id)
    .eq('created_by', userId);

  if (error) {
    console.error('删除练习失败:', error);
    throw error;
  }
}

export async function updatePracticeStats(
  id: string,
  userId: string,
  stats: { completed: boolean; score: number }
): Promise<void> {
  const supabase = createClient();

  // 首先获取当前练习
  const { data: practice, error: fetchError } = await supabase
    .from('practices')
    .select('stats')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('获取练习统计信息失败:', fetchError);
    throw fetchError;
  }

  const currentStats = practice.stats as {
    total_attempts: number;
    completed_attempts: number;
    average_score: number;
    last_attempt_at?: string;
  };

  // 更新统计信息
  const newStats = {
    total_attempts: (currentStats.total_attempts || 0) + 1,
    completed_attempts: (currentStats.completed_attempts || 0) + (stats.completed ? 1 : 0),
    average_score: (
      ((currentStats.average_score || 0) * (currentStats.total_attempts || 0) + stats.score) /
      ((currentStats.total_attempts || 0) + 1)
    ).toFixed(2),
    last_attempt_at: new Date().toISOString()
  };

  const { error: updateError } = await supabase
    .from('practices')
    .update({ stats: newStats })
    .eq('id', id);

  if (updateError) {
    console.error('更新练习统计信息失败:', updateError);
    throw updateError;
  }
} 