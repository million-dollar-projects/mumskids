'use client'

import { createClient } from '@/lib/supabase/client';
import type { Practice } from '@/lib/supabase/types';

export class PracticeService {
  private supabase = createClient();

  /**
   * 删除练习
   * @param practiceId 练习ID
   * @param userId 用户ID（用于权限验证）
   */
  async deletePractice(practiceId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('practices')
        .delete()
        .eq('id', practiceId)
        .eq('created_by', userId);

      if (error) {
        console.error('删除练习失败:', error);
        throw new Error(error.message || '删除练习失败');
      }
    } catch (error) {
      console.error('删除练习时发生错误:', error);
      throw error;
    }
  }

  /**
   * 根据slug删除练习
   * @param slug 练习slug
   * @param userId 用户ID（用于权限验证）
   */
  async deletePracticeBySlug(slug: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('practices')
        .delete()
        .eq('slug', slug)
        .eq('created_by', userId);

      if (error) {
        console.error('删除练习失败:', error);
        throw new Error(error.message || '删除练习失败');
      }
    } catch (error) {
      console.error('删除练习时发生错误:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const practiceService = new PracticeService(); 