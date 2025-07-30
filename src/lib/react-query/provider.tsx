'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 默认缓存时间设置为5分钟
            staleTime: 5 * 60 * 1000,
            // 缓存保留时间设置为10分钟
            gcTime: 10 * 60 * 1000,
            // 如果请求失败，最多重试2次
            retry: 2,
            // 启用网络重新连接时自动重新获取数据
            refetchOnReconnect: true,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}