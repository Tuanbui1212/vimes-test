import { pool } from '../config/db.js';
import type { Supplier } from '../models/supplier.js';

export class SupplierRepository {
  // Lấy toàn bộ danh sách nhà cung cấp
  async getAllSuppliers(): Promise<Supplier[]> {
    const query = `SELECT id, name FROM suppliers ORDER BY id ASC;`;
    const result = await pool.query(query);
    return result.rows;
  }

  // Lấy nhà cung cấp theo ID
  async getSupplierById(id: number): Promise<Supplier | null> {
    const query = `SELECT id, name FROM suppliers WHERE id = $1;`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}
