'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { PAGINATION_CONFIG } from '@/lib/pagination-config'
import { Practice } from '@/types/practice'
import { PaginatedResponse } from '@/types/pagination'

async function fetchPractices(type: 'my' | 'public', userId?: string, pageParam = 1): Promise<PaginatedResponse<Practice>> {
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
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPractices(type, userId || undefined, pageParam),
    getNextPageParam: (lastPage: PaginatedResponse<Practice>, allPages) => {
      return lastPage.pagination.hasMore ? allPages.length + 1 : undefined
    },
    // 如果用户ID不存在且类型是'my'，则不执行查询
    enabled: !(type === 'my' && !userId),
  })
}