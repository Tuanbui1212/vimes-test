import { fetchApi } from './api';
import type { ApiResponse, Department } from '@/types';

export const departmentService = {
  async getAll(): Promise<ApiResponse<Department[]>> {
    return fetchApi<ApiResponse<Department[]>>('/departments');
  },

  async getById(id: number): Promise<ApiResponse<Department>> {
    return fetchApi<ApiResponse<Department>>(`/departments/${id}`);
  }
};
