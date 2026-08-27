import { DepartmentRepository } from '../repositories/department.repository.js';
import type { Department } from '../models/department.js';

export class DepartmentService {
  private departmentRepository: DepartmentRepository;

  constructor() {
    this.departmentRepository = new DepartmentRepository();
  }

  // Lấy toàn bộ danh sách đơn vị/phòng ban
  async getAllDepartments(): Promise<Department[]> {
    return await this.departmentRepository.getAllDepartments();
  }

  // Lấy đơn vị/phòng ban theo ID
  async getDepartmentById(id: number): Promise<Department | null> {
    return await this.departmentRepository.getDepartmentById(id);
  }
}
