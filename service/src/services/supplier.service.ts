import { SupplierRepository } from '../repositories/supplier.repository.js';
import type { Supplier } from '../models/supplier.js';

export class SupplierService {
  private supplierRepository: SupplierRepository;

  constructor() {
    this.supplierRepository = new SupplierRepository();
  }

  // Lấy toàn bộ danh sách nhà cung cấp
  async getAllSuppliers(): Promise<Supplier[]> {
    return await this.supplierRepository.getAllSuppliers();
  }

  // Lấy nhà cung cấp theo ID
  async getSupplierById(id: number): Promise<Supplier | null> {
    return await this.supplierRepository.getSupplierById(id);
  }
}
