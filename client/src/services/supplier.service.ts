import { fetchApi } from './api';
import type { ApiResponse, Supplier } from '@/types';

export const supplierService = {
  async getAll(): Promise<ApiResponse<Supplier[]>> {
    return fetchApi<ApiResponse<Supplier[]>>('/suppliers');
  },

  async getById(id: number): Promise<ApiResponse<Supplier>> {
    return fetchApi<ApiResponse<Supplier>>(`/suppliers/${id}`);
  }
};
