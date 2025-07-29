// 分页配置
export const PAGINATION_CONFIG = {
  // 练习列表每页显示数量
  PRACTICES_PER_PAGE: 3,
  
  // 其他分页配置可以在这里添加
  REWARDS_PER_PAGE: 10,
  RESULTS_PER_PAGE: 20,
} as const;

export type PaginationConfig = typeof PAGINATION_CONFIG;