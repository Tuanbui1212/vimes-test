import { pool } from '../config/db.js';
import type { ReceiptVoucherPayload, ReceiptItem } from '../models/receipt.js';
import { ReceiptRepository } from '../repositories/receipt.repository.js';
import { WarehouseRepository } from '../repositories/warehouse.repository.js';
import { SupplierRepository } from '../repositories/supplier.repository.js';
import { DepartmentRepository } from '../repositories/department.repository.js';
import { ProductRepository } from '../repositories/product.repository.js';

export class ReceiptService {
  private receiptRepository: ReceiptRepository;
  private warehouseRepository: WarehouseRepository;
  private supplierRepository: SupplierRepository;
  private departmentRepository: DepartmentRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.receiptRepository = new ReceiptRepository();
    this.warehouseRepository = new WarehouseRepository();
    this.supplierRepository = new SupplierRepository();
    this.departmentRepository = new DepartmentRepository();
    this.productRepository = new ProductRepository();
  }

  // Get all receipt vouchers
  async getAllReceipts() {
    return await this.receiptRepository.getAllReceipts();
  }

  // Get receipt voucher details by ID
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

  async autoGenerateReceiptCode(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const maxNumber = await this.receiptRepository.getMaxReceiptCodeByYear(currentYear);
    const nextNumber = maxNumber + 1;
    return `PNK-${currentYear}-${String(nextNumber).padStart(4, '0')}`;
  }


  // Create a new receipt voucher
  async createReceipt(payload: ReceiptVoucherPayload) {
    if (!payload.warehouse_id) {
      throw new Error('Vui lòng chọn Kho nhập hàng');
    }

    const warehouse = await this.warehouseRepository.getWarehouseById(payload.warehouse_id);
    if (!warehouse) {
      throw new Error(`Kho nhập (ID: ${payload.warehouse_id}) không tồn tại trên hệ thống`);
    }
    if (warehouse.status === 'INACTIVE') {
      throw new Error(`Kho nhập '${warehouse.name}' đã ngưng hoạt động, không thể nhập hàng`);
    }

    if (payload.supplier_id) {
      const supplier = await this.supplierRepository.getSupplierById(payload.supplier_id);
      if (!supplier) {
        throw new Error(`Đơn vị giao hàng (ID: ${payload.supplier_id}) không tồn tại trên hệ thống`);
      }
      if (supplier.status === 'INACTIVE') {
        throw new Error(`Đơn vị giao hàng '${supplier.name}' đã ngưng hoạt động`);
      }
    }

    if (payload.department_id) {
      const department = await this.departmentRepository.getDepartmentById(payload.department_id);
      if (!department) {
        throw new Error(`Phòng ban (ID: ${payload.department_id}) không tồn tại trên hệ thống`);
      }
      if (department.status === 'INACTIVE') {
        throw new Error(`Phòng ban '${department.name}' đã ngưng hoạt động`);
      }
      if (department.supplier_id && payload.supplier_id && department.supplier_id !== payload.supplier_id) {
        throw new Error(`Phòng ban '${department.name}' không trực thuộc Đơn vị được chọn`);
      }
    }

    const productIds = Array.from(new Set(payload.items.map((item: ReceiptItem) => item.product_id)));
    const products = await this.productRepository.getProductsByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of payload.items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        throw new Error(`Mặt hàng (ID: ${item.product_id}) không tồn tại trong danh mục vật tư`);
      }
      if (product.status === 'INACTIVE') {
        throw new Error(`Vật tư '${product.name}' (${product.code}) đã ngưng sử dụng, không thể lập phiếu`);
      }
    }

    const calculatedTotal = payload.items.reduce((sum: number, item: ReceiptItem) => {
      const itemTotal = item.total_amount !== undefined ? item.total_amount : (item.actual_quantity * item.price);
      return sum + itemTotal;
    }, 0);

    if (!payload.voucher_code || !payload.voucher_code.trim()) {
      payload.voucher_code = await this.autoGenerateReceiptCode();
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const voucherId = await this.receiptRepository.insertVoucher(client, payload, calculatedTotal);
      await this.receiptRepository.insertVoucherDetails(client, voucherId, payload.items);

      await client.query('COMMIT');
      return {
        success: true,
        voucherId,
        voucherCode: payload.voucher_code,
        totalAmount: calculatedTotal
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
