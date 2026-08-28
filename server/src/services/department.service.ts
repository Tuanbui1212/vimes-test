import { DepartmentRepository } from '../repositories/department.repository.js';
import type { Department } from '../models/department.js';

export class DepartmentService {
  private departmentRepository: DepartmentRepository;

  constructor() {
    this.departmentRepository = new DepartmentRepository();
  }

  // Get departments with search and pagination metadata
  async getDepartments(params: { search?: string; status?: string; page?: number; limit?: number }): Promise<{
    items: Department[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    const page = params.page && Number(params.page) > 0 ? Number(params.page) : 1;
    const limit = params.limit && Number(params.limit) > 0 ? Number(params.limit) : (params.page ? 15 : 0);
    const { departments, total } = await this.departmentRepository.getDepartments({
      ...params,
      page,
      limit
    });
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
    const hasMore = limit > 0 ? page < totalPages : false;
    return {
      items: departments,
      pagination: {
        page,
        limit: limit > 0 ? limit : total,
        total,
        totalPages,
        hasMore
      }
    };
  }

  // Get all departments with optional status filter
  async getAllDepartments(status?: string): Promise<Department[]> {
    return await this.departmentRepository.getAllDepartments(status);
  }

  // Get department by ID
  async getDepartmentById(id: number): Promise<Department | null> {
    return await this.departmentRepository.getDepartmentById(id);
  }

  // Create new department
  async createDepartment(data: { name: string; status?: string }): Promise<Department> {
    return await this.departmentRepository.insertDepartment(data);
  }

  // Update existing department
  async updateDepartment(id: number, data: { name?: string; status?: string }): Promise<Department | null> {
    const existing = await this.departmentRepository.getDepartmentById(id);
    if (!existing) {
      throw new Error('Phòng ban không tồn tại trên hệ thống');
    }
    return await this.departmentRepository.updateDepartment(id, data);
  }

  // Delete department
  async deleteDepartment(id: number): Promise<{ isHardDelete: boolean }> {
    const existing = await this.departmentRepository.getDepartmentById(id);
    if (!existing) {
      throw new Error('Phòng ban không tồn tại trên hệ thống');
    }

    const isReferenced = await this.departmentRepository.isReferenced(id);
    if (isReferenced) {
      await this.departmentRepository.softDelete(id);
      return { isHardDelete: false };
    } else {
      await this.departmentRepository.hardDelete(id);
      return { isHardDelete: true };
    }
  }
}
