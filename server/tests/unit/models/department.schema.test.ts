import { describe, it, expect } from '@jest/globals';
import { DepartmentSchema } from '../../../src/models/department.js';

describe('Unit Test: DepartmentSchema (Zod Validation)', () => {
  const validDepartment = {
    id: 1,
    name: 'Khoa Hồi sức Cấp cứu',
    supplier_id: 1,
    status: 'ACTIVE',
  };

  // Kiểm tra phòng ban hợp lệ
  it('phải validate thành công khi dữ liệu phòng ban hợp lệ', () => {
    const result = DepartmentSchema.safeParse(validDepartment);
    expect(result.success).toBe(true);
  });

  // Kiểm tra chặn khi tên phòng ban bị để trống
  it('phải báo lỗi khi tên phòng ban bị để trống', () => {
    const result = DepartmentSchema.safeParse({ ...validDepartment, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tên đơn vị/phòng ban không được để trống');
    }
  });

  // Kiểm tra cho phép supplier_id là null hoặc không truyền
  it('phải validate thành công khi supplier_id là null hoặc undefined', () => {
    const result = DepartmentSchema.safeParse({ name: 'Phòng Kế hoạch', supplier_id: null });
    expect(result.success).toBe(true);
  });
});
