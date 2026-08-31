import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ReceiptService } from '../../../src/services/receipt.service.js';
import { ReceiptRepository } from '../../../src/repositories/receipt.repository.js';
import { WarehouseRepository } from '../../../src/repositories/warehouse.repository.js';
import { SupplierRepository } from '../../../src/repositories/supplier.repository.js';
import { DepartmentRepository } from '../../../src/repositories/department.repository.js';
import { ProductRepository } from '../../../src/repositories/product.repository.js';
import { pool } from '../../../src/config/db.js';
import type { ReceiptVoucherPayload } from '../../../src/models/receipt.js';

describe('Unit Test: ReceiptService', () => {
  let receiptService: ReceiptService;
  let mockClient: any;

  const samplePayload: ReceiptVoucherPayload = {
    voucher_code: 'PNK-2026-0001',
    receipt_date: '2026-08-31',
    supplier_id: 1,
    department_id: 1,
    warehouse_id: 1,
    status: 'COMPLETED',
    items: [
      { product_id: 1, doc_quantity: 10, actual_quantity: 10, price: 50000, total_amount: 500000 },
      { product_id: 2, doc_quantity: 5, actual_quantity: 5, price: 100000, total_amount: 500000 },
    ],
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    receiptService = new ReceiptService();

    mockClient = {
      query: jest.fn<any>().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    };
    (jest.spyOn(pool, 'connect') as any).mockResolvedValue(mockClient);
  });

  describe('getAllReceipts', () => {
    // Kiểm tra lấy toàn bộ danh sách phiếu nhập kho
    it('phải trả về danh sách phiếu nhập kho', async () => {
      jest.spyOn(ReceiptRepository.prototype, 'getAllReceipts').mockResolvedValueOnce([{ id: 1, voucher_code: 'PN001' }]);

      const result = await receiptService.getAllReceipts();
      expect(result).toHaveLength(1);
    });
  });

  describe('getReceiptById', () => {
    // Kiểm tra lấy chi tiết phiếu nhập kèm danh sách hàng hóa
    it('phải trả về thông tin phiếu nhập kèm danh mục hàng hóa khi tìm thấy ID', async () => {
      jest.spyOn(ReceiptRepository.prototype, 'getReceiptById').mockResolvedValueOnce({ id: 1, voucher_code: 'PN001' });
      jest.spyOn(ReceiptRepository.prototype, 'getReceiptDetailsByVoucherId').mockResolvedValueOnce([{ id: 10, product_id: 1 }]);

      const result = await receiptService.getReceiptById(1);
      expect(result).toEqual({
        id: 1,
        voucher_code: 'PN001',
        items: [{ id: 10, product_id: 1 }],
      });
    });

    // Kiểm tra trả về null khi không tìm thấy phiếu nhập
    it('phải trả về null khi không tìm thấy phiếu nhập', async () => {
      jest.spyOn(ReceiptRepository.prototype, 'getReceiptById').mockResolvedValueOnce(null);

      const result = await receiptService.getReceiptById(999);
      expect(result).toBeNull();
    });
  });

  describe('autoGenerateReceiptCode', () => {
    // Kiểm tra tạo mã phiếu tự động tăng từ bảng counter và format tại service
    it('phải tạo mã phiếu tự động tăng đúng định dạng', async () => {
      const currentYear = new Date().getFullYear();
      jest.spyOn(ReceiptRepository.prototype, 'getNextReceiptVoucherNumber').mockResolvedValueOnce(6);

      const code = await receiptService.autoGenerateReceiptCode();
      expect(code).toBe(`PNK-${currentYear}-0006`);
    });
  });

  describe('createReceipt (Nghiệp vụ lập phiếu nhập & Transaction)', () => {
    // Kiểm tra ném lỗi khi kho nhập không tồn tại
    it('phải ném lỗi nếu kho nhập không tồn tại', async () => {
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouseById').mockResolvedValueOnce(null);

      await expect(receiptService.createReceipt(samplePayload)).rejects.toThrow('Kho nhập (ID: 1) không tồn tại trên hệ thống');
    });

    // Kiểm tra ném lỗi khi kho nhập đã ngưng hoạt động
    it('phải ném lỗi nếu kho nhập ở trạng thái ngưng hoạt động', async () => {
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouseById').mockResolvedValueOnce({
        id: 1,
        code: 'KHO_1',
        name: 'Kho Dược',
        location: 'Tầng 1',
        status: 'INACTIVE',
      });

      await expect(receiptService.createReceipt(samplePayload)).rejects.toThrow("Kho nhập 'Kho Dược' đã ngưng hoạt động");
    });

    // Kiểm tra ném lỗi khi phòng ban không thuộc đơn vị được chọn
    it('phải ném lỗi nếu phòng ban không trực thuộc đơn vị được chọn', async () => {
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouseById').mockResolvedValueOnce({ id: 1, code: 'KHO', name: 'Kho', location: 'T1', status: 'ACTIVE' });
      jest.spyOn(SupplierRepository.prototype, 'getSupplierById').mockResolvedValueOnce({ id: 1, name: 'Công ty A', status: 'ACTIVE' });
      jest.spyOn(DepartmentRepository.prototype, 'getDepartmentById').mockResolvedValueOnce({ id: 1, name: 'Khoa Ngoại', supplier_id: 2, status: 'ACTIVE' });

      await expect(receiptService.createReceipt(samplePayload)).rejects.toThrow("Phòng ban 'Khoa Ngoại' không trực thuộc Đơn vị được chọn");
    });

    // Kiểm tra ném lỗi khi mặt hàng đã ngưng sử dụng
    it('phải ném lỗi nếu trong phiếu có mặt hàng ngưng sử dụng', async () => {
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouseById').mockResolvedValueOnce({ id: 1, code: 'KHO', name: 'Kho', location: 'T1', status: 'ACTIVE' });
      jest.spyOn(SupplierRepository.prototype, 'getSupplierById').mockResolvedValueOnce({ id: 1, name: 'Công ty A', status: 'ACTIVE' });
      jest.spyOn(DepartmentRepository.prototype, 'getDepartmentById').mockResolvedValueOnce({ id: 1, name: 'Khoa Ngoại', supplier_id: 1, status: 'ACTIVE' });
      jest.spyOn(ProductRepository.prototype, 'getProductsByIds').mockResolvedValueOnce([
        { id: 1, code: 'VT001', name: 'Bông băng', brand: 'VN', specifications: '1 cuộn', quality: 'Tốt', category_type: 'VT', unit: 'Cuộn', status: 'INACTIVE' },
        { id: 2, code: 'VT002', name: 'Cồn 70 độ', brand: 'VN', specifications: '500ml', quality: 'Tốt', category_type: 'HC', unit: 'Chai', status: 'ACTIVE' },
      ]);

      await expect(receiptService.createReceipt(samplePayload)).rejects.toThrow("Vật tư 'Bông băng' (VT001) đã ngưng sử dụng");
    });

    // Kiểm tra thực hiện transaction BEGIN -> COMMIT thành công và tính đúng tổng tiền
    it('phải thực hiện transaction BEGIN -> COMMIT và tính đúng tổng tiền khi tạo phiếu thành công', async () => {
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouseById').mockResolvedValueOnce({ id: 1, code: 'KHO', name: 'Kho', location: 'T1', status: 'ACTIVE' });
      jest.spyOn(SupplierRepository.prototype, 'getSupplierById').mockResolvedValueOnce({ id: 1, name: 'Công ty A', status: 'ACTIVE' });
      jest.spyOn(DepartmentRepository.prototype, 'getDepartmentById').mockResolvedValueOnce({ id: 1, name: 'Khoa Ngoại', supplier_id: 1, status: 'ACTIVE' });
      jest.spyOn(ProductRepository.prototype, 'getProductsByIds').mockResolvedValueOnce([
        { id: 1, code: 'VT001', name: 'Bông băng', brand: 'VN', specifications: '1 cuộn', quality: 'Tốt', category_type: 'VT', unit: 'Cuộn', status: 'ACTIVE' },
        { id: 2, code: 'VT002', name: 'Cồn 70 độ', brand: 'VN', specifications: '500ml', quality: 'Tốt', category_type: 'HC', unit: 'Chai', status: 'ACTIVE' },
      ]);
      jest.spyOn(ReceiptRepository.prototype, 'insertVoucher').mockResolvedValueOnce(100);
      jest.spyOn(ReceiptRepository.prototype, 'insertVoucherDetails').mockResolvedValueOnce(undefined);

      const result = await receiptService.createReceipt(samplePayload);

      expect(result).toEqual({
        success: true,
        voucherId: 100,
        voucherCode: 'PNK-2026-0001',
        totalAmount: 1000000,
      });
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    // Kiểm tra thực hiện ROLLBACK khi xảy ra lỗi trong quá trình lưu chi tiết phiếu
    it('phải gọi ROLLBACK và giải phóng kết nối khi có lỗi xảy ra', async () => {
      jest.spyOn(WarehouseRepository.prototype, 'getWarehouseById').mockResolvedValueOnce({ id: 1, code: 'KHO', name: 'Kho', location: 'T1', status: 'ACTIVE' });
      jest.spyOn(SupplierRepository.prototype, 'getSupplierById').mockResolvedValueOnce({ id: 1, name: 'Công ty A', status: 'ACTIVE' });
      jest.spyOn(DepartmentRepository.prototype, 'getDepartmentById').mockResolvedValueOnce({ id: 1, name: 'Khoa Ngoại', supplier_id: 1, status: 'ACTIVE' });
      jest.spyOn(ProductRepository.prototype, 'getProductsByIds').mockResolvedValueOnce([
        { id: 1, code: 'VT001', name: 'Bông băng', brand: 'VN', specifications: '1 cuộn', quality: 'Tốt', category_type: 'VT', unit: 'Cuộn', status: 'ACTIVE' },
        { id: 2, code: 'VT002', name: 'Cồn 70 độ', brand: 'VN', specifications: '500ml', quality: 'Tốt', category_type: 'HC', unit: 'Chai', status: 'ACTIVE' },
      ]);
      jest.spyOn(ReceiptRepository.prototype, 'insertVoucher').mockRejectedValueOnce(new Error('Lỗi ghi Database'));

      await expect(receiptService.createReceipt(samplePayload)).rejects.toThrow('Lỗi ghi Database');
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
