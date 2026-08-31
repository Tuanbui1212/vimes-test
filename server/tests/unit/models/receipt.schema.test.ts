import { describe, it, expect } from '@jest/globals';
import { ReceiptItemSchema, ReceiptVoucherPayloadSchema } from '../../../src/models/receipt.js';

describe('Unit Test: ReceiptSchema (Zod Validation)', () => {
  const validItem = {
    product_id: 1,
    doc_quantity: 10,
    actual_quantity: 10,
    price: 50000,
    total_amount: 500000,
  };

  const validPayload = {
    voucher_code: 'PNK-2026-0001',
    receipt_date: '2026-08-31',
    warehouse_id: 1,
    supplier_id: 1,
    department_id: 1,
    status: 'COMPLETED' as const,
    items: [validItem],
  };

  describe('ReceiptItemSchema', () => {
    // Kiểm tra dòng hàng hợp lệ
    it('phải validate thành công khi dữ liệu dòng hàng hợp lệ', () => {
      const result = ReceiptItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    // Kiểm tra chặn khi số lượng thực nhập <= 0
    it('phải báo lỗi khi số lượng thực nhập nhỏ hơn hoặc bằng 0', () => {
      const result = ReceiptItemSchema.safeParse({ ...validItem, actual_quantity: 0 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Số lượng thực nhập phải lớn hơn 0');
      }
    });

    // Kiểm tra chặn khi đơn giá là số âm
    it('phải báo lỗi khi đơn giá là số âm', () => {
      const result = ReceiptItemSchema.safeParse({ ...validItem, price: -5000 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Đơn giá không được âm');
      }
    });

    // Kiểm tra chặn khi số lượng chứng từ là số âm
    it('phải báo lỗi khi số lượng chứng từ là số âm', () => {
      const result = ReceiptItemSchema.safeParse({ ...validItem, doc_quantity: -1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Số lượng chứng từ không được âm');
      }
    });
  });

  describe('ReceiptVoucherPayloadSchema', () => {
    // Kiểm tra toàn bộ phiếu nhập hợp lệ
    it('phải validate thành công khi toàn bộ phiếu nhập hợp lệ', () => {
      const result = ReceiptVoucherPayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    // Kiểm tra chặn khi thiếu ngày lập phiếu
    it('phải báo lỗi khi ngày lập phiếu bị để trống', () => {
      const result = ReceiptVoucherPayloadSchema.safeParse({ ...validPayload, receipt_date: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Ngày lập phiếu không được để trống');
      }
    });

    // Kiểm tra chặn khi thiếu kho nhập hàng
    it('phải báo lỗi khi không chọn kho nhập hàng', () => {
      const result = ReceiptVoucherPayloadSchema.safeParse({ ...validPayload, warehouse_id: undefined });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Vui lòng chọn Kho nhập hàng');
      }
    });

    // Kiểm tra chặn khi danh sách hàng hóa rỗng
    it('phải báo lỗi khi phiếu không có mặt hàng nào', () => {
      const result = ReceiptVoucherPayloadSchema.safeParse({ ...validPayload, items: [] });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Phải có ít nhất 1 mặt hàng trong phiếu nhập');
      }
    });
  });
});
