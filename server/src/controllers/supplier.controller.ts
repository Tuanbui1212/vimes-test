import type { Request, Response } from 'express';
import { SupplierService } from '../services/supplier.service.js';
import { SupplierSchema } from '../models/supplier.js';

const supplierService = new SupplierService();

export class SupplierController {
  // Get all suppliers / search with pagination
  async getAllSuppliers(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status ? String(req.query.status) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;

      const result = await supplierService.getSuppliers({ status, search, page, limit });
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (error: any) {
      console.error('Error fetching suppliers:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Không thể tải danh sách đơn vị'
      });
    }
  }

  async getAllSuppliersWithDepartments(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status ? String(req.query.status) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;

      const result = await supplierService.getAllSuppliersWithDepartments({ status, search, page, limit });
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (error: any) {
      console.error('Error fetching suppliers with departments:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Không thể tải danh sách đơn vị'
      });
    }
  }

  // Get supplier by ID
  async getSupplierById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID đơn vị không hợp lệ' });
        return;
      }

      const supplier = await supplierService.getSupplierById(id);
      if (!supplier) {
        res.status(404).json({ success: false, message: 'Không tìm thấy đơn vị' });
        return;
      }

      res.status(200).json({ success: true, data: supplier });
    } catch (error: any) {
      console.error('Error fetching supplier:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Không thể lấy thông tin đơn vị'
      });
    }
  }

  // Create new supplier
  async createSupplier(req: Request, res: Response): Promise<void> {
    try {
      const parsed = SupplierSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ: ' + parsed.error.issues.map(i => i.message).join(', '),
          errors: parsed.error.issues
        });
        return;
      }

      const created = await supplierService.createSupplier(parsed.data);
      res.status(201).json({ success: true, message: 'Thêm mới đơn vị thành công', data: created });
    } catch (error: any) {
      if (error.code === '23505') {
        res.status(409).json({ success: false, message: 'Tên đơn vị đã tồn tại trên hệ thống' });
        return;
      }
      console.error('Error creating supplier:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Không thể thêm mới đơn vị'
      });
    }
  }

  // Update existing supplier
  async updateSupplier(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID đơn vị không hợp lệ' });
        return;
      }

      const parsed = SupplierSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ: ' + parsed.error.issues.map(i => i.message).join(', '),
          errors: parsed.error.issues
        });
        return;
      }

      const updated = await supplierService.updateSupplier(id, parsed.data);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Không tìm thấy đơn vị' });
        return;
      }

      res.status(200).json({ success: true, message: 'Cập nhật đơn vị thành công', data: updated });
    } catch (error: any) {
      console.error('Error updating supplier:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Không thể cập nhật đơn vị'
      });
    }
  }

  // Delete supplier
  async deleteSupplier(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID đơn vị không hợp lệ' });
        return;
      }

      const result = await supplierService.deleteSupplier(id);

      res.status(200).json({
        success: true,
        message: result.isHardDelete
          ? 'Đã xóa hoàn toàn đơn vị khỏi hệ thống'
          : 'Đơn vị đã phát sinh phiếu nhập nên được chuyển sang trạng thái ngưng hoạt động (xóa mềm)',
        action: result.isHardDelete ? 'HARD_DELETE' : 'SOFT_DELETE'
      });
    } catch (error: any) {
      console.error('Error deleting supplier:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Không thể xóa đơn vị'
      });
    }
  }
}
