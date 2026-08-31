import { describe, it, expect } from '@jest/globals';
import { SupplierSchema } from '../../../src/models/supplier.js';

describe('Unit Test: SupplierSchema (Zod Validation)', () => {
  const validSupplier = {
    id: 1,
    name: 'Công ty Cổ phần Dược phẩm VIMES',
    status: 'ACTIVE',
  };

  // Kiểm tra nhà cung cấp hợp lệ
  it('phải validate thành công khi dữ liệu nhà cung cấp hợp lệ', () => {
    const result = SupplierSchema.safeParse(validSupplier);
    expect(result.success).toBe(true);
  });

  // Kiểm tra chặn khi tên nhà cung cấp để trống
  it('phải báo lỗi khi tên nhà cung cấp bị để trống', () => {
    const result = SupplierSchema.safeParse({ ...validSupplier, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tên nhà cung cấp không được để trống');
    }
  });

  // Kiểm tra tự động gán status mặc định là ACTIVE
  it('phải tự động gán status là ACTIVE khi không truyền', () => {
    const result = SupplierSchema.safeParse({ name: 'Nhà thuốc A' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('ACTIVE');
    }
  });
});
