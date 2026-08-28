import { fetchApi } from './api';
import type { ApiResponse, PaginationParams, Supplier } from '@/types';

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

export const supplierService = {
  async getAll(params?: PaginationParams | string): Promise<ApiResponse<Supplier[]>> {
    const query = buildQuery(params);
    return fetchApi<ApiResponse<Supplier[]>>(`/suppliers${query}`);
  },

  async getById(id: number): Promise<ApiResponse<Supplier>> {
    return fetchApi<ApiResponse<Supplier>>(`/suppliers/${id}`);
  },

  async create(data: { name: string; status?: string }): Promise<ApiResponse<Supplier>> {
    return fetchApi<ApiResponse<Supplier>>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async update(id: number, data: { name?: string; status?: string }): Promise<ApiResponse<Supplier>> {
    return fetchApi<ApiResponse<Supplier>>(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    return fetchApi<ApiResponse<void>>(`/suppliers/${id}`, {
      method: 'DELETE'
    });
  }
};
