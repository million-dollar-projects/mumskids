export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string | null;
  hasMore: boolean;
  pagination: {
    totalCount: number;
  };
}