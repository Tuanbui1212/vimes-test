import { fetchApi } from './api';
import type { ApiResponse, Department, PaginationParams } from '@/types';

function buildQuery(params?: PaginationParams | string): string {
  if (!params) return '';
  if (typeof params === 'string') return `?status=${encodeURIComponent(params)}`;
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.append('status', params.status);
  if (params.search) searchParams.append('search', params.search);
  const supId = params.supplier_id ?? params.supplierId;
  if (supId !== undefined && supId !== null) searchParams.append('supplier_id', String(supId));
  if (params.page !== undefined) searchParams.append('page', String(params.page));
  if (params.limit !== undefined) searchParams.append('limit', String(params.limit));
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export const departmentService = {
  async getAll(params?: PaginationParams | string): Promise<ApiResponse<Department[]>> {
    const query = buildQuery(params);
    return fetchApi<ApiResponse<Department[]>>(`/departments${query}`);
  },

  async getById(id: number): Promise<ApiResponse<Department>> {
    return fetchApi<ApiResponse<Department>>(`/departments/${id}`);
  },

  async create(data: { name: string; supplier_id?: number | null; status?: string }): Promise<ApiResponse<Department>> {
    return fetchApi<ApiResponse<Department>>('/departments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async update(id: number, data: { name?: string; supplier_id?: number | null; status?: string }): Promise<ApiResponse<Department>> {
    return fetchApi<ApiResponse<Department>>(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    return fetchApi<ApiResponse<void>>(`/departments/${id}`, {
      method: 'DELETE'
    });
  }
};
