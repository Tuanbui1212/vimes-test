export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginationParams {
  search?: string;
  status?: string;
  supplier_id?: number | null;
  supplierId?: number | null;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationMetadata;
  errors?: any[];
}
