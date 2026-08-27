import type { Request, Response } from 'express';
import { SupplierService } from '../services/supplier.service.js';

const supplierService = new SupplierService();

export class SupplierController {
  async getAllSuppliers(req: Request, res: Response): Promise<void> {
    try {
      const suppliers = await supplierService.getAllSuppliers();
      res.status(200).json({ success: true, data: suppliers });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhà cung cấp:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
  }

  async getSupplierById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID nhà cung cấp không hợp lệ' });
        return;
      }

      const supplier = await supplierService.getSupplierById(id);
      if (!supplier) {
        res.status(404).json({ success: false, message: 'Không tìm thấy nhà cung cấp' });
        return;
      }

      res.status(200).json({ success: true, data: supplier });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin nhà cung cấp:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
  }
}
