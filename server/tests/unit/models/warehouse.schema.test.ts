import { describe, it, expect } from '@jest/globals';
import { WarehouseSchema } from '../../../src/models/warehouse.js';

describe('Unit Test: WarehouseSchema (Zod Validation)', () => {
  const validWarehouse = {
    id: 1,
    code: 'KHO_DUOC',
    name: 'Kho Dược Trung Tâm',
    location: 'Tầng 1 - Tòa A',
    status: 'ACTIVE',
  };

  // Kiểm tra kho bãi hợp lệ
  it('phải validate thành công khi dữ liệu kho hợp lệ', () => {
    const result = WarehouseSchema.safeParse(validWarehouse);
    expect(result.success).toBe(true);
  });

  // Kiểm tra chặn khi mã kho bị để trống
  it('phải báo lỗi khi mã kho bị để trống', () => {
    const result = WarehouseSchema.safeParse({ ...validWarehouse, code: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Mã kho không được để trống');
    }
  });

  // Kiểm tra chặn khi tên kho bị để trống
  it('phải báo lỗi khi tên kho bị để trống', () => {
    const result = WarehouseSchema.safeParse({ ...validWarehouse, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tên kho không được để trống');
    }
  });

  // Kiểm tra chặn khi địa điểm kho bị để trống
  it('phải báo lỗi khi địa điểm kho bị để trống', () => {
    const result = WarehouseSchema.safeParse({ ...validWarehouse, location: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Địa điểm không được để trống');
    }
  });
});
