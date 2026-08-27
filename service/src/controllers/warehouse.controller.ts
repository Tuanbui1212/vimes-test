import type { Request, Response } from 'express';
import { WarehouseService } from '../services/warehouse.service.js';

const warehouseService = new WarehouseService();

export class WarehouseController {
  async getAllWarehouses(req: Request, res: Response): Promise<void> {
    try {
      const warehouses = await warehouseService.getAllWarehouses();
      res.status(200).json({ success: true, data: warehouses });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách kho bãi:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
  }

  async getWarehouseById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID kho bãi không hợp lệ' });
        return;
      }

      const warehouse = await warehouseService.getWarehouseById(id);
      if (!warehouse) {
        res.status(404).json({ success: false, message: 'Không tìm thấy kho bãi' });
        return;
      }

      res.status(200).json({ success: true, data: warehouse });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin kho bãi:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
  }
}
