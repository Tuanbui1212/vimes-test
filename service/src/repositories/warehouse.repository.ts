import { pool } from '../config/db.js';
import type { Warehouse } from '../models/warehouse.js';

export class WarehouseRepository {
  // Lấy toàn bộ danh sách kho bãi
  async getAllWarehouses(): Promise<Warehouse[]> {
    const query = `SELECT id, code, name, location FROM warehouses ORDER BY id ASC;`;
    const result = await pool.query(query);
    return result.rows;
  }

  // Lấy kho bãi theo ID
  async getWarehouseById(id: number): Promise<Warehouse | null> {
    const query = `SELECT id, code, name, location FROM warehouses WHERE id = $1;`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}
