import { describe, it, expect } from '@jest/globals';
import { ProductSchema } from '../../../src/models/product.js';

describe('Unit Test: ProductSchema (Zod Validation)', () => {
  const validProduct = {
    id: 1,
    code: 'VT001',
    name: 'Bơm tiêm 5ml',
    brand: 'Vinamed',
    specifications: '5ml/ống',
    quality: 'Loại 1',
    category_type: 'Vật tư tiêu hao',
    unit: 'Ống',
    status: 'ACTIVE',
  };

  // Kiểm tra vật tư hợp lệ
  it('phải validate thành công khi dữ liệu vật tư hợp lệ', () => {
    const result = ProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  // Kiểm tra chặn khi mã sản phẩm để trống
  it('phải báo lỗi khi mã sản phẩm bị để trống', () => {
    const result = ProductSchema.safeParse({ ...validProduct, code: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Mã sản phẩm không được để trống');
    }
  });

  // Kiểm tra chặn khi tên sản phẩm để trống
  it('phải báo lỗi khi tên sản phẩm bị để trống', () => {
    const result = ProductSchema.safeParse({ ...validProduct, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tên sản phẩm không được để trống');
    }
  });

  // Kiểm tra chặn khi đơn vị tính để trống
  it('phải báo lỗi khi đơn vị tính bị để trống', () => {
    const result = ProductSchema.safeParse({ ...validProduct, unit: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Đơn vị tính không được để trống');
    }
  });

  // Kiểm tra tự động gán status là ACTIVE nếu không truyền
  it('phải tự động gán status là ACTIVE khi không truyền', () => {
    const { status, ...withoutStatus } = validProduct;
    const result = ProductSchema.safeParse(withoutStatus);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('ACTIVE');
    }
  });
});
