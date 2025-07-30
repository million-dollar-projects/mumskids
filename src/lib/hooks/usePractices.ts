'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { PAGINATION_CONFIG } from '@/lib/pagination-config'

interface Practice {
  id: string
  slug: string
  created_at: string
  updated_at: string
  created_by: string
  title: string
  description: string
  child_name: string
  gender: 'boy' | 'girl'
  difficulty: 'within10' | 'within20' | 'within50' | 'within100'
  calculation_type: 'add' | 'sub' | 'addsub'
  test_mode: 'normal' | 'timed'
  question_count: number | null
  time_limit: number | null
  is_public: boolean
  selected_theme: string
  reward_distribution_mode: 'random' | 'choice'
  rewards: any[]
  reward_condition?: any
  stats: {
    total_attempts: number
    completed_attempts: number
    average_score: number
    best_score: number
    best_time: number | null
  }
}

interface PaginatedResponse {
  data: Practice[]
  pagination: {
    totalCount: number
    hasMore: boolean
  }
}

async function fetchPractices(type: 'my' | 'public', userId?: string, pageParam = 1): Promise<PaginatedResponse> {
  const params = new URLSearchParams({
    type: type === 'my' ? 'user' : 'public',
    page: pageParam.toString(),
    limit: PAGINATION_CONFIG.PRACTICES_PER_PAGE.toString(),
  })

  if (type === 'my' && userId) {
    params.append('userId', userId)
  }

  const response = await fetch(`/api/practices?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch practices')
  }

  return response.json()
}

export function usePractices(type: 'my' | 'public', userId?: string | null) {
  return useInfiniteQuery({
    queryKey: ['practices', type, userId],
    queryFn: ({ pageParam = 1 }) => fetchPractices(type, userId || undefined, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.pagination.hasMore ? allPages.length + 1 : undefined
    },
    // 如果用户ID不存在且类型是'my'，则不执行查询
    enabled: !(type === 'my' && !userId),
  })
}