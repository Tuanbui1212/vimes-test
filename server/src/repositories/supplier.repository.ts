import { pool } from '../config/db.js';
import type { Supplier, SupplierWithDepartments } from '../models/supplier.js';
import type { PoolClient } from 'pg';

export class SupplierRepository {
  // Private helper to count total suppliers
  private async getCount(whereClause: string, values: any[], db: PoolClient | typeof pool): Promise<number> {
    const countQuery = `SELECT COUNT(*) AS count FROM suppliers s ${whereClause};`;
    const countResult = await db.query(countQuery, values);
    return parseInt(countResult.rows[0]?.count || '0', 10);
  }

  // Get suppliers with optional search, status filter, and pagination
  async getSuppliers(
    params: { search?: string; status?: string; page?: number; limit?: number },
    client?: PoolClient
  ): Promise<{ suppliers: Supplier[]; total: number }> {
    const db = client || pool;
    const conditions: string[] = [];
    const filterValues: any[] = [];
    let paramIndex = 1;

    if (params.status) {
      conditions.push(`s.status = $${paramIndex++}`);
      filterValues.push(params.status);
    }

    if (params.search && params.search.trim()) {
      const searchTerm = `%${params.search.trim()}%`;
      conditions.push(`s.name ILIKE $${paramIndex++}`);
      filterValues.push(searchTerm);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Data Query
    const dataValues = [...filterValues];
    let dataQuery = `SELECT id, name, COALESCE(status, 'ACTIVE') AS status FROM suppliers s ${whereClause} ORDER BY id ASC`;
    if (params.limit && params.limit > 0) {
      const page = params.page && params.page > 0 ? params.page : 1;
      const offset = (page - 1) * params.limit;
      dataQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      dataValues.push(params.limit, offset);
    }

    // Run count query and data query in parallel using Promise.all
    const [total, result] = await Promise.all([
      this.getCount(whereClause, filterValues, db),
      db.query(dataQuery, dataValues)
    ]);

    return { suppliers: result.rows, total };
  }

  // Get all suppliers with optional status filter (compatibility wrapper)
  async getAllSuppliers(status?: string, client?: PoolClient): Promise<Supplier[]> {
    const res = await this.getSuppliers({ status }, client);
    return res.suppliers;
  }

  // get all suppliers with departments and total count
  async getAllSuppliersWithDepartments(
    params: { search?: string; status?: string; page?: number; limit?: number },
    client?: PoolClient
  ): Promise<{ items: SupplierWithDepartments[]; total: number }> {
    const db = client || pool;
    const conditions: string[] = [];
    const filterValues: any[] = [];
    let paramIndex = 1;

    if (params.status) {
      conditions.push(`s.status = $${paramIndex++}`);
      filterValues.push(params.status);
    }

    if (params.search && params.search.trim()) {
      const searchTerm = `%${params.search.trim()}%`;
      conditions.push(`s.name ILIKE $${paramIndex++}`);
      filterValues.push(searchTerm);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Data Query
    const dataValues = [...filterValues];
    let query = `
      SELECT 
        s.id, 
        s.name, 
        COALESCE(s.status, 'ACTIVE') AS status,
        COALESCE(
          json_agg(
            json_build_object(
              'id', d.id,
              'name', d.name,
              'status', COALESCE(d.status, 'ACTIVE')
            )
          ) FILTER (WHERE d.id IS NOT NULL), 
          '[]'::json
        ) AS departments
      FROM suppliers s
      LEFT JOIN departments d ON d.supplier_id = s.id
      ${whereClause}
      GROUP BY s.id
      ORDER BY s.id ASC
    `;

    if (params.limit && params.limit > 0) {
      const page = params.page && params.page > 0 ? params.page : 1;
      const offset = (page - 1) * params.limit;
      query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      dataValues.push(params.limit, offset);
    }

    query += ';';

    // Run count query and data query concurrently using Promise.all
    const [total, result] = await Promise.all([
      this.getCount(whereClause, filterValues, db),
      db.query(query, dataValues)
    ]);

    return { items: result.rows, total };
  }

  // Get supplier by ID
  async getSupplierById(id: number, client?: PoolClient): Promise<Supplier | null> {
    const db = client || pool;
    const query = `SELECT id, name, COALESCE(status, 'ACTIVE') AS status FROM suppliers WHERE id = $1;`;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  // Create new supplier
  async createSupplier(data: { name: string; status?: string }, client?: PoolClient): Promise<Supplier> {
    const db = client || pool;
    const query = `
      INSERT INTO suppliers (name, status) 
      VALUES ($1, COALESCE($2, 'ACTIVE')) 
      RETURNING id, name, status;
    `;
    const result = await db.query(query, [data.name, data.status || 'ACTIVE']);
    return result.rows[0];
  }

  // Update existing supplier
  async updateSupplier(id: number, data: { name?: string; status?: string }, client?: PoolClient): Promise<Supplier | null> {
    const db = client || pool;
    const query = `
      UPDATE suppliers 
      SET name = COALESCE($2, name), 
          status = COALESCE($3, status) 
      WHERE id = $1 
      RETURNING id, name, status;
    `;
    const result = await db.query(query, [id, data.name, data.status]);
    return result.rows[0] || null;
  }

  // Check if supplier is referenced in receipt vouchers
  async isReferenced(id: number, client?: PoolClient): Promise<boolean> {
    const db = client || pool;
    const query = `SELECT 1 FROM receipt_vouchers WHERE supplier_id = $1 LIMIT 1;`;
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Permanently delete supplier from database
  async hardDelete(id: number, client?: PoolClient): Promise<boolean> {
    const db = client || pool;
    const query = `DELETE FROM suppliers WHERE id = $1;`;
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Soft delete supplier by updating status to INACTIVE
  async softDelete(id: number, client?: PoolClient): Promise<boolean> {
    const db = client || pool;
    const query = `UPDATE suppliers SET status = 'INACTIVE' WHERE id = $1;`;
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
