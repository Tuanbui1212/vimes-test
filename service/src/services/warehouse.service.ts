import { WarehouseRepository } from '../repositories/warehouse.repository.js';
import type { Warehouse } from '../models/warehouse.js';

export class WarehouseService {
  private warehouseRepository: WarehouseRepository;

  constructor() {
    this.warehouseRepository = new WarehouseRepository();
  }

  // Lấy toàn bộ danh sách kho bãi
  async getAllWarehouses(): Promise<Warehouse[]> {
    return await this.warehouseRepository.getAllWarehouses();
  }

  // Lấy kho bãi theo ID
  async getWarehouseById(id: number): Promise<Warehouse | null> {
    return await this.warehouseRepository.getWarehouseById(id);
  }
}
