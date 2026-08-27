import { fetchApi } from './api';
import type { ApiResponse, Warehouse } from '@/types';

export const warehouseService = {
  async getAll(): Promise<ApiResponse<Warehouse[]>> {
    return fetchApi<ApiResponse<Warehouse[]>>('/warehouses');
  },

  async getById(id: number): Promise<ApiResponse<Warehouse>> {
    return fetchApi<ApiResponse<Warehouse>>(`/warehouses/${id}`);
  }
};
