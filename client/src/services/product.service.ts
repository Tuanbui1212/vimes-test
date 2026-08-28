import { fetchApi } from './api';
import type { ApiResponse, PaginationParams, Product } from '@/types';

function buildQuery(params?: PaginationParams | string): string {
  if (!params) return '';
  if (typeof params === 'string') return `?status=${encodeURIComponent(params)}`;
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.append('status', params.status);
  if (params.search) searchParams.append('search', params.search);
  if (params.page !== undefined) searchParams.append('page', String(params.page));
  if (params.limit !== undefined) searchParams.append('limit', String(params.limit));
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export const productService = {
  async getAll(params?: PaginationParams | string): Promise<ApiResponse<Product[]>> {
    const query = buildQuery(params);
    return fetchApi<ApiResponse<Product[]>>(`/products${query}`);
  },

  async getById(id: number): Promise<ApiResponse<Product>> {
    return fetchApi<ApiResponse<Product>>(`/products/${id}`);
  },

  async getByCode(code: string): Promise<ApiResponse<Product>> {
    return fetchApi<ApiResponse<Product>>(`/products/code/${code}`);
  },

  async create(product: Partial<Product>): Promise<ApiResponse<Product>> {
    return fetchApi<ApiResponse<Product>>('/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  },

  async update(id: number, product: Partial<Product>): Promise<ApiResponse<Product>> {
    return fetchApi<ApiResponse<Product>>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    });
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    return fetchApi<ApiResponse<void>>(`/products/${id}`, {
      method: 'DELETE'
    });
  }
};
