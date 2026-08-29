import { SupplierRepository } from '../repositories/supplier.repository.js';
import type { Supplier, SupplierWithDepartments } from '../models/supplier.js';

export class SupplierService {
  private supplierRepository: SupplierRepository;

  constructor() {
    this.supplierRepository = new SupplierRepository();
  }

  // Get suppliers with search and pagination metadata
  async getSuppliers(params: { search?: string; status?: string; page?: number; limit?: number }): Promise<{
    items: Supplier[];
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
    const { suppliers, total } = await this.supplierRepository.getSuppliers({
      ...params,
      page,
      limit
    });
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
    const hasMore = limit > 0 ? page < totalPages : false;
    return {
      items: suppliers,
      pagination: {
        page,
        limit: limit > 0 ? limit : total,
        total,
        totalPages,
        hasMore
      }
    };
  }

  // Get all suppliers with optional status filter
  async getAllSuppliers(status?: string): Promise<Supplier[]> {
    return await this.supplierRepository.getAllSuppliers(status);
  }

  async getAllSuppliersWithDepartments(
    params: { search?: string; status?: string; page?: number; limit?: number }
  ): Promise<{
    items: SupplierWithDepartments[];
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
    const { items, total } = await this.supplierRepository.getAllSuppliersWithDepartments({ ...params, page, limit });
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
    const hasMore = limit > 0 ? page < totalPages : false;
    return {
      items,
      pagination: {
        page,
        limit: limit > 0 ? limit : total,
        total,
        totalPages,
        hasMore
      }
    };
  }

  // Get supplier by ID
  async getSupplierById(id: number): Promise<Supplier | null> {
    return await this.supplierRepository.getSupplierById(id);
  }

  // Create new supplier
  async createSupplier(data: { name: string; status?: string }): Promise<Supplier> {
    return await this.supplierRepository.createSupplier(data);
  }

  // Update existing supplier
  async updateSupplier(id: number, data: { name?: string; status?: string }): Promise<Supplier | null> {
    const existing = await this.supplierRepository.getSupplierById(id);
    if (!existing) {
      throw new Error('Đơn vị không tồn tại trên hệ thống');
    }
    return await this.supplierRepository.updateSupplier(id, data);
  }

  // Delete supplier
  async deleteSupplier(id: number): Promise<{ isHardDelete: boolean }> {
    const existing = await this.supplierRepository.getSupplierById(id);
    if (!existing) {
      throw new Error('Đơn vị không tồn tại trên hệ thống');
    }

    const isReferenced = await this.supplierRepository.isReferenced(id);
    if (isReferenced) {
      await this.supplierRepository.softDelete(id);
      return { isHardDelete: false };
    } else {
      await this.supplierRepository.hardDelete(id);
      return { isHardDelete: true };
    }
  }
}
