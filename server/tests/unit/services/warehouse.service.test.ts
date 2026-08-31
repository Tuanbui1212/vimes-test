import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { WarehouseService } from '../../../src/services/warehouse.service.js';
import { WarehouseRepository } from '../../../src/repositories/warehouse.repository.js';
import type { Warehouse } from '../../../src/models/warehouse.js';

describe('Unit Test: WarehouseService', () => {
  let warehouseService: WarehouseService;

  const sampleWarehouse: Warehouse = {
    id: 1,
    code: 'KHO_DUOC',
    name: 'Kho Dược Trung Tâm',
    location: 'Tầng 1 - Tòa nhà A',
    status: 'ACTIVE',
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    warehouseService = new WarehouseService();
  });

  describe('createWarehouse', () => {
    // Kiểm tra ném lỗi khi mã kho đã tồn tại trong hệ thống
    it('phải ném lỗi nếu mã kho đã tồn tại', async () => {
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouseByCode').mockResolvedValueOnce(sampleWarehouse);
      const spyCreate = jest.spyOn(WarehouseRepository.prototype, 'createWarehouse');

      await expect(warehouseService.createWarehouse(sampleWarehouse)).rejects.toThrow("Mã kho 'KHO_DUOC' đã tồn tại trên hệ thống");
      expect(spyCreate).not.toHaveBeenCalled();
    });

    // Kiểm tra tạo mới kho bãi thành công khi mã kho chưa tồn tại
    it('phải tạo thành công và trả về thông tin kho mới', async () => {
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouseByCode').mockResolvedValueOnce(null);
      jest.spyOn(WarehouseRepository.prototype, 'createWarehouse').mockResolvedValueOnce(sampleWarehouse);

      const result = await warehouseService.createWarehouse(sampleWarehouse);
      expect(result).toEqual(sampleWarehouse);
    });
  });

  describe('getWarehouses & getAllWarehouses', () => {
    // Kiểm tra tính toán phân trang danh sách kho
    it('phải tính toán đúng số trang totalPages và cờ hasMore khi phân trang kho', async () => {
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouses').mockResolvedValueOnce({
        warehouses: [sampleWarehouse],
        total: 15,
      });

      const result = await warehouseService.getWarehouses({ page: 1, limit: 5 });
      expect(result.items).toEqual([sampleWarehouse]);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasMore).toBe(true);
    });

    // Kiểm tra lấy toàn bộ danh sách kho không phân trang
    it('phải trả về danh sách tất cả các kho', async () => {
      jest.spyOn(WarehouseRepository.prototype, 'getAllWarehouses').mockResolvedValueOnce([sampleWarehouse]);

      const result = await warehouseService.getAllWarehouses('ACTIVE');
      expect(result).toEqual([sampleWarehouse]);
    });
  });

  describe('getWarehouseById & getWarehouseByCode', () => {
    // Kiểm tra tra cứu kho theo ID khi tìm thấy
    it('phải trả về thông tin kho khi tìm thấy ID', async () => {
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouseById').mockResolvedValueOnce(sampleWarehouse);

      const result = await warehouseService.getWarehouseById(1);
      expect(result).toEqual(sampleWarehouse);
    });

    // Kiểm tra tra cứu kho theo Mã khi không tìm thấy
    it('phải trả về null khi không tìm thấy mã kho', async () => {
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouseByCode').mockResolvedValueOnce(null);

      const result = await warehouseService.getWarehouseByCode('UNKNOWN');
      expect(result).toBeNull();
    });
  });

  describe('updateWarehouse', () => {
    // Kiểm tra ném lỗi khi cập nhật kho không tồn tại
    it('phải ném lỗi nếu cập nhật kho không tồn tại', async () => {
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouseById').mockResolvedValueOnce(null);

      await expect(warehouseService.updateWarehouse(999, { name: 'Kho mới' })).rejects.toThrow('Kho bãi không tồn tại trên hệ thống');
    });

    // Kiểm tra ném lỗi khi cập nhật sang mã kho đã bị kho khác sử dụng
    it('phải ném lỗi nếu cập nhật sang mã kho đã bị kho khác sử dụng', async () => {
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouseById').mockResolvedValueOnce(sampleWarehouse);
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouseByCode').mockResolvedValueOnce({
        ...sampleWarehouse,
        id: 2,
        code: 'KHO_LE',
      });

      await expect(warehouseService.updateWarehouse(1, { code: 'KHO_LE' })).rejects.toThrow("Mã kho 'KHO_LE' đã được sử dụng bởi kho khác");
    });

    // Kiểm tra cập nhật thông tin kho thành công
    it('phải cập nhật thành công khi dữ liệu hợp lệ', async () => {
      const updated = { ...sampleWarehouse, name: 'Kho Dược Mở Rộng' };
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouseById').mockResolvedValueOnce(sampleWarehouse);
      jest.spyOn(WarehouseRepository.prototype, 'updateWarehouse').mockResolvedValueOnce(updated);

      const result = await warehouseService.updateWarehouse(1, { name: 'Kho Dược Mở Rộng' });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteWarehouse', () => {
    // Kiểm tra ném lỗi khi xóa kho không tồn tại
    it('phải ném lỗi nếu xóa kho không tồn tại', async () => {
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouseById').mockResolvedValueOnce(null);

      await expect(warehouseService.deleteWarehouse(999)).rejects.toThrow('Kho bãi không tồn tại trên hệ thống');
    });

    // Kiểm tra thực hiện xóa mềm khi kho đã có liên kết phiếu nhập
    it('phải thực hiện xóa mềm nếu kho đã có chứng từ liên kết', async () => {
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouseById').mockResolvedValueOnce(sampleWarehouse);
      jest.spyOn(WarehouseRepository.prototype, 'isReferenced').mockResolvedValueOnce(true);
      const spySoftDelete = jest.spyOn(WarehouseRepository.prototype, 'softDelete').mockResolvedValueOnce(true);
      const spyHardDelete = jest.spyOn(WarehouseRepository.prototype, 'hardDelete');

      const result = await warehouseService.deleteWarehouse(1);
      expect(result).toEqual({ isHardDelete: false });
      expect(spySoftDelete).toHaveBeenCalledWith(1);
      expect(spyHardDelete).not.toHaveBeenCalled();
    });

    // Kiểm tra thực hiện xóa cứng khi kho chưa từng có liên kết chứng từ
    it('phải thực hiện xóa cứng nếu kho chưa từng có chứng từ liên kết', async () => {
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouseById').mockResolvedValueOnce(sampleWarehouse);
      jest.spyOn(WarehouseRepository.prototype, 'isReferenced').mockResolvedValueOnce(false);
      const spyHardDelete = jest.spyOn(WarehouseRepository.prototype, 'hardDelete').mockResolvedValueOnce(true);
      const spySoftDelete = jest.spyOn(WarehouseRepository.prototype, 'softDelete');

      const result = await warehouseService.deleteWarehouse(1);
      expect(result).toEqual({ isHardDelete: true });
      expect(spyHardDelete).toHaveBeenCalledWith(1);
      expect(spySoftDelete).not.toHaveBeenCalled();
    });
  });
});
