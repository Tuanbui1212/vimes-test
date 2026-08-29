import type { Request, Response } from 'express';
import { DepartmentService } from '../services/department.service.js';
import { DepartmentSchema } from '../models/department.js';

const departmentService = new DepartmentService();

export class DepartmentController {
  // Get all departments / search with pagination
  async getAllDepartments(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status ? String(req.query.status) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      const supplierIdQuery = req.query.supplier_id || req.query.supplierId;
      const supplierId = supplierIdQuery ? parseInt(String(supplierIdQuery), 10) : undefined;
      const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;

      const result = await departmentService.getDepartments({ status, search, supplierId: isNaN(Number(supplierId)) ? undefined : supplierId, page, limit });
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Không thể tải danh sách phòng ban' 
      });
    }
  }

  // Get department by ID
  async getDepartmentById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID phòng ban không hợp lệ' });
        return;
      }

      const department = await departmentService.getDepartmentById(id);
      if (!department) {
        res.status(404).json({ success: false, message: 'Không tìm thấy phòng ban' });
        return;
      }

      res.status(200).json({ success: true, data: department });
    } catch (error: any) {
      console.error('Error fetching department:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Không thể lấy thông tin phòng ban' 
      });
    }
  }

  // Create new department
  async createDepartment(req: Request, res: Response): Promise<void> {
    try {
      const parsed = DepartmentSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ 
          success: false, 
          message: 'Dữ liệu không hợp lệ: ' + parsed.error.issues.map(i => i.message).join(', '), 
          errors: parsed.error.issues 
        });
        return;
      }

      const created = await departmentService.createDepartment(parsed.data);
      res.status(201).json({ success: true, message: 'Thêm mới phòng ban thành công', data: created });
    } catch (error: any) {
      if (error.code === '23505') {
        res.status(409).json({ success: false, message: 'Tên phòng ban đã tồn tại trên hệ thống' });
        return;
      }
      console.error('Error creating department:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Không thể thêm mới phòng ban' 
      });
    }
  }

  // Update existing department
  async updateDepartment(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID phòng ban không hợp lệ' });
        return;
      }

      const parsed = DepartmentSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ 
          success: false, 
          message: 'Dữ liệu không hợp lệ: ' + parsed.error.issues.map(i => i.message).join(', '), 
          errors: parsed.error.issues 
        });
        return;
      }

      const updated = await departmentService.updateDepartment(id, parsed.data);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Không tìm thấy phòng ban' });
        return;
      }

      res.status(200).json({ success: true, message: 'Cập nhật phòng ban thành công', data: updated });
    } catch (error: any) {
      console.error('Error updating department:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Không thể cập nhật phòng ban' 
      });
    }
  }

  // Delete department
  async deleteDepartment(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID phòng ban không hợp lệ' });
        return;
      }

      const result = await departmentService.deleteDepartment(id);

      res.status(200).json({
        success: true,
        message: result.isHardDelete
          ? 'Đã xóa hoàn toàn phòng ban khỏi hệ thống'
          : 'Phòng ban đã phát sinh phiếu nhập nên được chuyển sang trạng thái ngưng hoạt động (xóa mềm)',
        action: result.isHardDelete ? 'HARD_DELETE' : 'SOFT_DELETE'
      });
    } catch (error: any) {
      console.error('Error deleting department:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Không thể xóa phòng ban' 
      });
    }
  }
}
