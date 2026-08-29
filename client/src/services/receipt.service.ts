import { fetchApi } from './api';
import type { ApiResponse, ReceiptVoucher, ReceiptVoucherPayload } from '@/types';

export const receiptService = {
  async getAll(): Promise<ApiResponse<ReceiptVoucher[]>> {
    return fetchApi<ApiResponse<ReceiptVoucher[]>>('/receipts');
  },

  async getById(id: number): Promise<ApiResponse<ReceiptVoucher>> {
    return fetchApi<ApiResponse<ReceiptVoucher>>(`/receipts/${id}`);
  },

  async create(payload: ReceiptVoucherPayload): Promise<ApiResponse<{ voucherId: number; voucherCode: string; totalAmount: number }>> {
    return fetchApi<ApiResponse<{ voucherId: number; voucherCode: string; totalAmount: number }>>('/receipts', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
