import { fetchApi } from './api';
import type { ApiResponse, Product } from '@/types';

export const productService = {
  async getAll(): Promise<ApiResponse<Product[]>> {
    return fetchApi<ApiResponse<Product[]>>('/products');
  },

  async getById(id: number): Promise<ApiResponse<Product>> {
    return fetchApi<ApiResponse<Product>>(`/products/${id}`);
  },

  async getByCode(code: string): Promise<ApiResponse<Product>> {
    return fetchApi<ApiResponse<Product>>(`/products/code/${code}`);
  }
};
