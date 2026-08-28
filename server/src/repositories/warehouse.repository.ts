import { pool } from '../config/db.js';
import type { Warehouse } from '../models/warehouse.js';
import type { PoolClient } from 'pg';

export class WarehouseRepository {
  // Get warehouses with optional search, status filter, and pagination
  async getWarehouses(
    params: { search?: string; status?: string; page?: number; limit?: number },
    client?: PoolClient
  ): Promise<{ warehouses: Warehouse[]; total: number }> {
    const db = client || pool;
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(params.status);
    }

    if (params.search && params.search.trim()) {
      const searchTerm = `%${params.search.trim()}%`;
      conditions.push(`(code ILIKE $${paramIndex} OR name ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`);
      values.push(searchTerm);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Total Count
    const countQuery = `SELECT COUNT(*) AS count FROM warehouses ${whereClause};`;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0]?.count || '0', 10);

    // 2. Data
    let dataQuery = `SELECT id, code, name, location, COALESCE(status, 'ACTIVE') AS status FROM warehouses ${whereClause} ORDER BY id ASC`;
    if (params.limit && params.limit > 0) {
      const page = params.page && params.page > 0 ? params.page : 1;
      const offset = (page - 1) * params.limit;
      dataQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      values.push(params.limit, offset);
    }

    const result = await db.query(dataQuery, values);
    return { warehouses: result.rows, total };
  }

  // Get all warehouses with optional status filter (compatibility wrapper)
  async getAllWarehouses(status?: string, client?: PoolClient): Promise<Warehouse[]> {
    const res = await this.getWarehouses({ status }, client);
    return res.warehouses;
  }

  // Get warehouse by ID
  async getWarehouseById(id: number, client?: PoolClient): Promise<Warehouse | null> {
    const db = client || pool;
    const query = `SELECT id, code, name, location, COALESCE(status, 'ACTIVE') AS status FROM warehouses WHERE id = $1;`;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  // Get warehouse by Code
  async getWarehouseByCode(code: string, client?: PoolClient): Promise<Warehouse | null> {
    const db = client || pool;
    const query = `SELECT id, code, name, location, COALESCE(status, 'ACTIVE') AS status FROM warehouses WHERE code = $1;`;
    const result = await db.query(query, [code]);
    return result.rows[0] || null;
  }

  // Create new warehouse
  async createWarehouse(
    data: { code: string; name: string; location?: string; status?: string },
    client?: PoolClient
  ): Promise<Warehouse> {
    const db = client || pool;
    const query = `
      INSERT INTO warehouses (code, name, location, status) 
      VALUES ($1, $2, $3, COALESCE($4, 'ACTIVE')) 
      RETURNING id, code, name, location, status;
    `;
    const result = await db.query(query, [
      data.code,
      data.name,
      data.location || null,
      data.status || 'ACTIVE'
    ]);
    return result.rows[0];
  }

  // Update existing warehouse
  async updateWarehouse(
    id: number,
    data: { code?: string; name?: string; location?: string; status?: string },
    client?: PoolClient
  ): Promise<Warehouse | null> {
    const db = client || pool;
    const query = `
      UPDATE warehouses 
      SET code = COALESCE($2, code), 
          name = COALESCE($3, name), 
          location = COALESCE($4, location), 
          status = COALESCE($5, status) 
      WHERE id = $1 
      RETURNING id, code, name, location, status;
    `;
    const result = await db.query(query, [
      id,
      data.code,
      data.name,
      data.location,
      data.status
    ]);
    return result.rows[0] || null;
  }

  // Check if warehouse is referenced in receipt vouchers
  async isReferenced(id: number, client?: PoolClient): Promise<boolean> {
    const db = client || pool;
    const query = `SELECT 1 FROM receipt_vouchers WHERE warehouse_id = $1 LIMIT 1;`;
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Permanently delete warehouse from database
  async hardDelete(id: number, client?: PoolClient): Promise<boolean> {
    const db = client || pool;
    const query = `DELETE FROM warehouses WHERE id = $1;`;
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Soft delete warehouse by updating status to INACTIVE
  async softDelete(id: number, client?: PoolClient): Promise<boolean> {
    const db = client || pool;
    const query = `UPDATE warehouses SET status = 'INACTIVE' WHERE id = $1;`;
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
