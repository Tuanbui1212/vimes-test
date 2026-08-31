import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { DepartmentService } from '../../../src/services/department.service.js';
import { DepartmentRepository } from '../../../src/repositories/department.repository.js';
import type { Department } from '../../../src/models/department.js';

describe('Unit Test: DepartmentService', () => {
  let departmentService: DepartmentService;

  const sampleDepartment: Department = {
    id: 1,
    name: 'Khoa Hồi sức Cấp cứu',
    supplier_id: 1,
    status: 'ACTIVE',
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    departmentService = new DepartmentService();
  });

  describe('createDepartment', () => {
    // Kiểm tra tạo mới phòng ban thành công
    it('phải tạo thành công và trả về phòng ban mới', async () => {
      const spyInsert = jest.spyOn(DepartmentRepository.prototype, 'insertDepartment').mockResolvedValueOnce(sampleDepartment);

      const result = await departmentService.createDepartment({ name: 'Khoa Hồi sức Cấp cứu', supplier_id: 1 });
      expect(result).toEqual(sampleDepartment);
      expect(spyInsert).toHaveBeenCalledWith({ name: 'Khoa Hồi sức Cấp cứu', supplier_id: 1 });
    });
  });

  describe('getDepartments & getAllDepartments', () => {
    // Kiểm tra tính toán phân trang danh sách phòng ban
    it('phải tính toán đúng phân trang danh sách phòng ban', async () => {
      jest.spyOn(DepartmentRepository.prototype, 'getDepartments').mockResolvedValueOnce({
        departments: [sampleDepartment],
        total: 12,
      });

      const result = await departmentService.getDepartments({ page: 1, limit: 5 });
      expect(result.items).toEqual([sampleDepartment]);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasMore).toBe(true);
    });

    // Kiểm tra lấy toàn bộ danh sách phòng ban
    it('phải trả về toàn bộ danh sách phòng ban theo bộ lọc', async () => {
      jest.spyOn(DepartmentRepository.prototype, 'getAllDepartments').mockResolvedValueOnce([sampleDepartment]);

      const result = await departmentService.getAllDepartments('ACTIVE', 1);
      expect(result).toEqual([sampleDepartment]);
    });
  });

  describe('getDepartmentById', () => {
    // Kiểm tra tìm kiếm phòng ban theo ID thành công
    it('phải trả về thông tin phòng ban khi tìm thấy ID', async () => {
      jest.spyOn(DepartmentRepository.prototype, 'getDepartmentById').mockResolvedValueOnce(sampleDepartment);

      const result = await departmentService.getDepartmentById(1);
      expect(result).toEqual(sampleDepartment);
    });

    // Kiểm tra trả về null khi không tìm thấy phòng ban
    it('phải trả về null khi không tìm thấy phòng ban', async () => {
      jest.spyOn(DepartmentRepository.prototype, 'getDepartmentById').mockResolvedValueOnce(null);

      const result = await departmentService.getDepartmentById(999);
      expect(result).toBeNull();
    });
  });

  describe('updateDepartment', () => {
    // Kiểm tra ném lỗi khi cập nhật phòng ban không tồn tại
    it('phải ném lỗi nếu cập nhật phòng ban không tồn tại', async () => {
      jest.spyOn(DepartmentRepository.prototype, 'getDepartmentById').mockResolvedValueOnce(null);

      await expect(departmentService.updateDepartment(999, { name: 'Tên mới' })).rejects.toThrow('Phòng ban không tồn tại trên hệ thống');
    });

    // Kiểm tra cập nhật thông tin phòng ban thành công
    it('phải cập nhật thành công khi phòng ban tồn tại', async () => {
      const updated = { ...sampleDepartment, name: 'Khoa Cấp cứu Đa khoa' };
      jest.spyOn(DepartmentRepository.prototype, 'getDepartmentById').mockResolvedValueOnce(sampleDepartment);
      jest.spyOn(DepartmentRepository.prototype, 'updateDepartment').mockResolvedValueOnce(updated);

      const result = await departmentService.updateDepartment(1, { name: 'Khoa Cấp cứu Đa khoa' });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteDepartment', () => {
    // Kiểm tra ném lỗi khi xóa phòng ban không tồn tại
    it('phải ném lỗi nếu xóa phòng ban không tồn tại', async () => {
      jest.spyOn(DepartmentRepository.prototype, 'getDepartmentById').mockResolvedValueOnce(null);

      await expect(departmentService.deleteDepartment(999)).rejects.toThrow('Phòng ban không tồn tại trên hệ thống');
    });

    // Kiểm tra thực hiện xóa mềm khi phòng ban đã từng phát sinh phiếu nhập
    it('phải thực hiện xóa mềm nếu phòng ban đã có liên kết chứng từ', async () => {
      jest.spyOn(DepartmentRepository.prototype, 'getDepartmentById').mockResolvedValueOnce(sampleDepartment);
      jest.spyOn(DepartmentRepository.prototype, 'isReferenced').mockResolvedValueOnce(true);
      const spySoftDelete = jest.spyOn(DepartmentRepository.prototype, 'softDelete').mockResolvedValueOnce(true);
      const spyHardDelete = jest.spyOn(DepartmentRepository.prototype, 'hardDelete');

      const result = await departmentService.deleteDepartment(1);
      expect(result).toEqual({ isHardDelete: false });
      expect(spySoftDelete).toHaveBeenCalledWith(1);
      expect(spyHardDelete).not.toHaveBeenCalled();
    });

    // Kiểm tra thực hiện xóa cứng khi phòng ban chưa từng phát sinh chứng từ
    it('phải thực hiện xóa cứng nếu phòng ban chưa từng liên kết chứng từ', async () => {
      jest.spyOn(DepartmentRepository.prototype, 'getDepartmentById').mockResolvedValueOnce(sampleDepartment);
      jest.spyOn(DepartmentRepository.prototype, 'isReferenced').mockResolvedValueOnce(false);
      const spyHardDelete = jest.spyOn(DepartmentRepository.prototype, 'hardDelete').mockResolvedValueOnce(true);
      const spySoftDelete = jest.spyOn(DepartmentRepository.prototype, 'softDelete');

      const result = await departmentService.deleteDepartment(1);
      expect(result).toEqual({ isHardDelete: true });
      expect(spyHardDelete).toHaveBeenCalledWith(1);
      expect(spySoftDelete).not.toHaveBeenCalled();
    });
  });
});
