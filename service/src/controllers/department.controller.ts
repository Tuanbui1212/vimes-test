import type { Request, Response } from 'express';
import { DepartmentService } from '../services/department.service.js';

const departmentService = new DepartmentService();

export class DepartmentController {
  async getAllDepartments(req: Request, res: Response): Promise<void> {
    try {
      const departments = await departmentService.getAllDepartments();
      res.status(200).json({ success: true, data: departments });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn vị/phòng ban:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
  }

  async getDepartmentById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID đơn vị/phòng ban không hợp lệ' });
        return;
      }

      const department = await departmentService.getDepartmentById(id);
      if (!department) {
        res.status(404).json({ success: false, message: 'Không tìm thấy đơn vị/phòng ban' });
        return;
      }

      res.status(200).json({ success: true, data: department });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin đơn vị/phòng ban:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
  }
}
