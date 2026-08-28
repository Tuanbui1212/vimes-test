import { WarehouseRepository } from '../repositories/warehouse.repository.js';
import type { Warehouse } from '../models/warehouse.js';

export class WarehouseService {
  private warehouseRepository: WarehouseRepository;

  constructor() {
    this.warehouseRepository = new WarehouseRepository();
  }

  // Get warehouses with search and pagination metadata
  async getWarehouses(params: { search?: string; status?: string; page?: number; limit?: number }): Promise<{
    items: Warehouse[];
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
    const { warehouses, total } = await this.warehouseRepository.getWarehouses({
      ...params,
      page,
      limit
    });
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
    const hasMore = limit > 0 ? page < totalPages : false;
    return {
      items: warehouses,
      pagination: {
        page,
        limit: limit > 0 ? limit : total,
        total,
        totalPages,
        hasMore
      }
    };
  }

  // Get all warehouses with optional status filter
  async getAllWarehouses(status?: string): Promise<Warehouse[]> {
    return await this.warehouseRepository.getAllWarehouses(status);
  }

  // Get warehouse by ID
  async getWarehouseById(id: number): Promise<Warehouse | null> {
    return await this.warehouseRepository.getWarehouseById(id);
  }

  // Get warehouse by Code
  async getWarehouseByCode(code: string): Promise<Warehouse | null> {
    return await this.warehouseRepository.getWarehouseByCode(code);
  }

  // Create new warehouse
  async createWarehouse(data: { code: string; name: string; location?: string; status?: string }): Promise<Warehouse> {
    const existingCode = await this.warehouseRepository.getWarehouseByCode(data.code);
    if (existingCode) {
      throw new Error(`Mã kho '${data.code}' đã tồn tại trên hệ thống`);
    }

    return await this.warehouseRepository.createWarehouse(data);
  }

  // Update existing warehouse
  async updateWarehouse(
    id: number,
    data: { code?: string; name?: string; location?: string; status?: string }
  ): Promise<Warehouse | null> {
    const existing = await this.warehouseRepository.getWarehouseById(id);
    if (!existing) {
      throw new Error('Kho bãi không tồn tại trên hệ thống');
    }

    if (data.code && data.code !== existing.code) {
      const duplicate = await this.warehouseRepository.getWarehouseByCode(data.code);
      if (duplicate && duplicate.id !== id) {
        throw new Error(`Mã kho '${data.code}' đã được sử dụng bởi kho khác`);
      }
    }

    return await this.warehouseRepository.updateWarehouse(id, data);
  }

  // Delete warehouse
  async deleteWarehouse(id: number): Promise<{ isHardDelete: boolean }> {
    const existing = await this.warehouseRepository.getWarehouseById(id);
    if (!existing) {
      throw new Error('Kho bãi không tồn tại trên hệ thống');
    }

    const isReferenced = await this.warehouseRepository.isReferenced(id);
    if (isReferenced) {
      await this.warehouseRepository.softDelete(id);
      return { isHardDelete: false };
    } else {
      await this.warehouseRepository.hardDelete(id);
      return { isHardDelete: true };
    }
  }
}
