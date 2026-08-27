import { pool } from '../config/db.js';
import type { ReceiptVoucherPayload } from '../models/receipt.js';
import { ReceiptRepository } from '../repositories/receipt.repository.js';

export class ReceiptService {
  private receiptRepository: ReceiptRepository;

  constructor() {
    this.receiptRepository = new ReceiptRepository();
  }

  // 1. Lấy danh sách toàn bộ phiếu nhập kho
  async getAllReceipts() {
    return await this.receiptRepository.getAllReceipts();
  }

  // 2. Lấy chi tiết 1 phiếu nhập kho (gồm thông tin chung và danh sách mặt hàng)
  async getReceiptById(voucherId: number) {
    const voucher = await this.receiptRepository.getReceiptById(voucherId);
    if (!voucher) {
      return null;
    }

    const items = await this.receiptRepository.getReceiptDetailsByVoucherId(voucherId);
    return {
      ...voucher,
      items
    };
  }

  // 3. Tạo mới phiếu nhập kho (Sử dụng Transaction an toàn)
  async createReceipt(payload: ReceiptVoucherPayload) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Tự động tính tổng tiền của cả phiếu nhập = sum(actual_quantity * price)
      let calculatedTotal = 0;
      if (payload.items && payload.items.length > 0) {
        calculatedTotal = payload.items.reduce((sum, item) => {
          const itemTotal = item.total_amount !== undefined ? item.total_amount : (item.actual_quantity * item.price);
          return sum + itemTotal;
        }, 0);
      }

      // Insert vào bảng receipt_vouchers
      const voucherId = await this.receiptRepository.insertVoucher(client, payload, calculatedTotal);

      // Insert hàng loạt vào bảng receipt_voucher_details
      if (payload.items && payload.items.length > 0) {
        await this.receiptRepository.insertVoucherDetails(client, voucherId, payload.items);
      }

      await client.query('COMMIT');
      return { success: true, voucherId, totalAmount: calculatedTotal };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
