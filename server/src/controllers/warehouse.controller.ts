import type { Request, Response } from 'express';
import { WarehouseService } from '../services/warehouse.service.js';
import { WarehouseSchema } from '../models/warehouse.js';

const warehouseService = new WarehouseService();

export class WarehouseController {
  // Get all warehouses / search with pagination
  async getAllWarehouses(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status ? String(req.query.status) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;

      const result = await warehouseService.getWarehouses({ status, search, page, limit });
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (error: any) {
      console.error('Error fetching warehouses:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Không thể tải danh sách kho bãi' 
      });
    }
  }

  // Get warehouse by ID
  async getWarehouseById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID kho không hợp lệ' });
        return;
      }

      const warehouse = await warehouseService.getWarehouseById(id);
      if (!warehouse) {
        res.status(404).json({ success: false, message: 'Không tìm thấy kho bãi' });
        return;
      }

      res.status(200).json({ success: true, data: warehouse });
    } catch (error: any) {
      console.error('Error fetching warehouse:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Không thể lấy thông tin kho bãi' 
      });
    }
  }

  // Get warehouse by Code
  async getWarehouseByCode(req: Request, res: Response): Promise<void> {
    try {
      const code = String(req.params.code);
      const warehouse = await warehouseService.getWarehouseByCode(code);
      if (!warehouse) {
        res.status(404).json({ success: false, message: 'Không tìm thấy kho bãi với mã tương ứng' });
        return;
      }

      res.status(200).json({ success: true, data: warehouse });
    } catch (error: any) {
      console.error('Error fetching warehouse by code:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Không thể tìm kiếm kho bãi' 
      });
    }
  }

  // Create new warehouse
  async createWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const parsed = WarehouseSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ 
          success: false, 
          message: 'Dữ liệu không hợp lệ: ' + parsed.error.issues.map(i => i.message).join(', '), 
          errors: parsed.error.issues 
        });
        return;
      }

      const created = await warehouseService.createWarehouse(parsed.data);
      res.status(201).json({ success: true, message: 'Thêm mới kho bãi thành công', data: created });
    } catch (error: any) {
      if (error.code === '23505') {
        res.status(409).json({ success: false, message: 'Mã kho bãi đã tồn tại trên hệ thống' });
        return;
      }
      console.error('Error creating warehouse:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Không thể thêm mới kho bãi' 
      });
    }
  }

  // Update existing warehouse
  async updateWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID kho không hợp lệ' });
        return;
      }

      const parsed = WarehouseSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ 
          success: false, 
          message: 'Dữ liệu không hợp lệ: ' + parsed.error.issues.map(i => i.message).join(', '), 
          errors: parsed.error.issues 
        });
        return;
      }

      const updated = await warehouseService.updateWarehouse(id, parsed.data);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Không tìm thấy kho bãi' });
        return;
      }

      res.status(200).json({ success: true, message: 'Cập nhật kho bãi thành công', data: updated });
    } catch (error: any) {
      console.error('Error updating warehouse:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Không thể cập nhật kho bãi' 
      });
    }
  }

  // Delete warehouse
  async deleteWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID kho không hợp lệ' });
        return;
      }

      const result = await warehouseService.deleteWarehouse(id);

      res.status(200).json({
        success: true,
        message: result.isHardDelete
          ? 'Đã xóa hoàn toàn kho bãi khỏi hệ thống'
          : 'Kho bãi đã phát sinh phiếu nhập nên được chuyển sang trạng thái ngưng hoạt động (xóa mềm)',
        action: result.isHardDelete ? 'HARD_DELETE' : 'SOFT_DELETE'
      });
    } catch (error: any) {
      console.error('Error deleting warehouse:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Không thể xóa kho bãi' 
      });
    }
  }
}
