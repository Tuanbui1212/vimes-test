import { fetchApi } from './api';
import type { ApiResponse, PaginationParams, Warehouse } from '@/types';

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

export const warehouseService = {
  async getAll(params?: PaginationParams | string): Promise<ApiResponse<Warehouse[]>> {
    const query = buildQuery(params);
    return fetchApi<ApiResponse<Warehouse[]>>(`/warehouses${query}`);
  },

  async getById(id: number): Promise<ApiResponse<Warehouse>> {
    return fetchApi<ApiResponse<Warehouse>>(`/warehouses/${id}`);
  },

  async getByCode(code: string): Promise<ApiResponse<Warehouse>> {
    return fetchApi<ApiResponse<Warehouse>>(`/warehouses/code/${code}`);
  },

  async create(data: { code: string; name: string; location?: string; status?: string }): Promise<ApiResponse<Warehouse>> {
    return fetchApi<ApiResponse<Warehouse>>('/warehouses', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async update(id: number, data: { code?: string; name?: string; location?: string; status?: string }): Promise<ApiResponse<Warehouse>> {
    return fetchApi<ApiResponse<Warehouse>>(`/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    return fetchApi<ApiResponse<void>>(`/warehouses/${id}`, {
      method: 'DELETE'
    });
  }
};
