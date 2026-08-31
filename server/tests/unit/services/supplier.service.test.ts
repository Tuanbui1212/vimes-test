import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { SupplierService } from '../../../src/services/supplier.service.js';
import { SupplierRepository } from '../../../src/repositories/supplier.repository.js';
import type { Supplier, SupplierWithDepartments } from '../../../src/models/supplier.js';

describe('Unit Test: SupplierService', () => {
  let supplierService: SupplierService;

  const sampleSupplier: Supplier = {
    id: 1,
    name: 'Công ty Cổ phần Dược phẩm TEST-VIMES',
    status: 'ACTIVE',
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    supplierService = new SupplierService();
  });

  describe('createSupplier', () => {
    // Kiểm tra tạo mới nhà cung cấp thành công
    it('phải tạo thành công và trả về nhà cung cấp mới', async () => {
      const spyCreate = jest.spyOn(SupplierRepository.prototype, 'createSupplier').mockResolvedValueOnce(sampleSupplier);

      const result = await supplierService.createSupplier({ name: 'Công ty Cổ phần Dược phẩm TEST-VIMES' });
      expect(result).toEqual(sampleSupplier);
      expect(spyCreate).toHaveBeenCalledWith({ name: 'Công ty Cổ phần Dược phẩm TEST-VIMES' });
    });
  });

  describe('getSuppliers & getAllSuppliers', () => {
    // Kiểm tra tính toán phân trang danh sách nhà cung cấp
    it('phải tính toán đúng số trang totalPages và cờ hasMore khi phân trang', async () => {
      jest.spyOn(SupplierRepository.prototype, 'getSuppliers').mockResolvedValueOnce({
        suppliers: [sampleSupplier],
        total: 25,
      });

      const result = await supplierService.getSuppliers({ page: 1, limit: 10 });
      expect(result.items).toEqual([sampleSupplier]);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasMore: true,
      });
    });

    // Kiểm tra lấy toàn bộ danh sách nhà cung cấp không phân trang
    it('phải trả về danh sách tất cả nhà cung cấp', async () => {
      jest.spyOn(SupplierRepository.prototype, 'getAllSuppliers').mockResolvedValueOnce([sampleSupplier]);

      const result = await supplierService.getAllSuppliers('ACTIVE');
      expect(result).toEqual([sampleSupplier]);
    });
  });

  describe('getAllSuppliersWithDepartments', () => {
    // Kiểm tra lấy danh sách nhà cung cấp kèm danh sách khoa phòng trực thuộc
    it('phải trả về danh sách nhà cung cấp kèm danh sách phòng ban tương ứng', async () => {
      const sampleSupplierWithDeps: SupplierWithDepartments = {
        ...sampleSupplier,
        departments: [{ id: 1, name: 'Khoa Dược', status: 'ACTIVE' }],
      };

      jest.spyOn(SupplierRepository.prototype, 'getAllSuppliersWithDepartments').mockResolvedValueOnce({
        items: [sampleSupplierWithDeps],
        total: 1,
      });

      const result = await supplierService.getAllSuppliersWithDepartments({ page: 1, limit: 10 });
      expect(result.items).toEqual([sampleSupplierWithDeps]);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getSupplierById', () => {
    // Kiểm tra tra cứu nhà cung cấp theo ID khi tìm thấy
    it('phải trả về nhà cung cấp tương ứng khi tìm thấy ID', async () => {
      jest.spyOn(SupplierRepository.prototype, 'getSupplierById').mockResolvedValueOnce(sampleSupplier);

      const result = await supplierService.getSupplierById(1);
      expect(result).toEqual(sampleSupplier);
    });

    // Kiểm tra tra cứu nhà cung cấp theo ID khi không tìm thấy
    it('phải trả về null khi không tìm thấy nhà cung cấp', async () => {
      jest.spyOn(SupplierRepository.prototype, 'getSupplierById').mockResolvedValueOnce(null);

      const result = await supplierService.getSupplierById(999);
      expect(result).toBeNull();
    });
  });

  describe('updateSupplier', () => {
    // Kiểm tra ném lỗi khi cập nhật nhà cung cấp không tồn tại
    it('phải ném lỗi nếu cập nhật nhà cung cấp không tồn tại', async () => {
      jest.spyOn(SupplierRepository.prototype, 'getSupplierById').mockResolvedValueOnce(null);

      await expect(supplierService.updateSupplier(999, { name: 'Tên mới' })).rejects.toThrow('Đơn vị không tồn tại trên hệ thống');
    });

    // Kiểm tra cập nhật tên nhà cung cấp thành công
    it('phải cập nhật thành công khi nhà cung cấp tồn tại', async () => {
      const updated = { ...sampleSupplier, name: 'TEST-VIMES Pharma' };
      jest.spyOn(SupplierRepository.prototype, 'getSupplierById').mockResolvedValueOnce(sampleSupplier);
      jest.spyOn(SupplierRepository.prototype, 'updateSupplier').mockResolvedValueOnce(updated);

      const result = await supplierService.updateSupplier(1, { name: 'TEST-VIMES Pharma' });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteSupplier', () => {
    // Kiểm tra ném lỗi khi xóa nhà cung cấp không tồn tại
    it('phải ném lỗi nếu xóa nhà cung cấp không tồn tại', async () => {
      jest.spyOn(SupplierRepository.prototype, 'getSupplierById').mockResolvedValueOnce(null);

      await expect(supplierService.deleteSupplier(999)).rejects.toThrow('Đơn vị không tồn tại trên hệ thống');
    });

    // Kiểm tra thực hiện xóa mềm khi nhà cung cấp đã có phát sinh chứng từ
    it('phải thực hiện xóa mềm nếu nhà cung cấp đã có chứng từ liên kết', async () => {
      jest.spyOn(SupplierRepository.prototype, 'getSupplierById').mockResolvedValueOnce(sampleSupplier);
      jest.spyOn(SupplierRepository.prototype, 'isReferenced').mockResolvedValueOnce(true);
      const spySoftDelete = jest.spyOn(SupplierRepository.prototype, 'softDelete').mockResolvedValueOnce(true);
      const spyHardDelete = jest.spyOn(SupplierRepository.prototype, 'hardDelete');

      const result = await supplierService.deleteSupplier(1);
      expect(result).toEqual({ isHardDelete: false });
      expect(spySoftDelete).toHaveBeenCalledWith(1);
      expect(spyHardDelete).not.toHaveBeenCalled();
    });

    // Kiểm tra thực hiện xóa cứng khi nhà cung cấp chưa từng phát sinh chứng từ
    it('phải thực hiện xóa cứng nếu nhà cung cấp chưa từng có chứng từ liên kết', async () => {
      jest.spyOn(SupplierRepository.prototype, 'getSupplierById').mockResolvedValueOnce(sampleSupplier);
      jest.spyOn(SupplierRepository.prototype, 'isReferenced').mockResolvedValueOnce(false);
      const spyHardDelete = jest.spyOn(SupplierRepository.prototype, 'hardDelete').mockResolvedValueOnce(true);
      const spySoftDelete = jest.spyOn(SupplierRepository.prototype, 'softDelete');

      const result = await supplierService.deleteSupplier(1);
      expect(result).toEqual({ isHardDelete: true });
      expect(spyHardDelete).toHaveBeenCalledWith(1);
      expect(spySoftDelete).not.toHaveBeenCalled();
    });
  });
});
