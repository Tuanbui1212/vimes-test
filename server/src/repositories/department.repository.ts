import { pool } from '../config/db.js';
import type { Department } from '../models/department.js';
import type { PoolClient } from 'pg';

export class DepartmentRepository {
  // Get departments with optional search, status filter, supplierId filter, and pagination
  async getDepartments(
    params: { search?: string; status?: string; supplierId?: number; page?: number; limit?: number },
    client?: PoolClient
  ): Promise<{ departments: Department[]; total: number }> {
    const db = client || pool;
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.status) {
      conditions.push(`d.status = $${paramIndex++}`);
      values.push(params.status);
    }

    if (params.supplierId) {
      conditions.push(`d.supplier_id = $${paramIndex++}`);
      values.push(params.supplierId);
    }

    if (params.search && params.search.trim()) {
      const searchTerm = `%${params.search.trim()}%`;
      conditions.push(`d.name ILIKE $${paramIndex++}`);
      values.push(searchTerm);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Total Count
    const countQuery = `SELECT COUNT(*) AS count FROM departments d ${whereClause};`;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0]?.count || '0', 10);

    // 2. Data with JOIN to suppliers table
    let dataQuery = `
      SELECT d.id, d.name, d.supplier_id, s.name AS supplier_name, COALESCE(d.status, 'ACTIVE') AS status 
      FROM departments d 
      LEFT JOIN suppliers s ON d.supplier_id = s.id 
      ${whereClause} 
      ORDER BY d.id ASC
    `;
    if (params.limit && params.limit > 0) {
      const page = params.page && params.page > 0 ? params.page : 1;
      const offset = (page - 1) * params.limit;
      dataQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      values.push(params.limit, offset);
    }

    const result = await db.query(dataQuery, values);
    return { departments: result.rows, total };
  }

  // Get all departments with optional status & supplierId filter
  async getAllDepartments(status?: string, supplierId?: number, client?: PoolClient): Promise<Department[]> {
    const res = await this.getDepartments({ status, supplierId }, client);
    return res.departments;
  }

  // Get department by ID
  async getDepartmentById(id: number, client?: PoolClient): Promise<Department | null> {
    const db = client || pool;
    const query = `
      SELECT d.id, d.name, d.supplier_id, s.name AS supplier_name, COALESCE(d.status, 'ACTIVE') AS status 
      FROM departments d 
      LEFT JOIN suppliers s ON d.supplier_id = s.id 
      WHERE d.id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  // Create new department
  async insertDepartment(data: { name: string; supplier_id?: number | null; status?: string }, client?: PoolClient): Promise<Department> {
    const db = client || pool;
    const query = `
      INSERT INTO departments (name, supplier_id, status) 
      VALUES ($1, $2, COALESCE($3, 'ACTIVE')) 
      RETURNING id, name, supplier_id, status;
    `;
    const result = await db.query(query, [data.name, data.supplier_id ?? null, data.status || 'ACTIVE']);
    return result.rows[0];
  }

  // Update existing department
  async updateDepartment(id: number, data: { name?: string; supplier_id?: number | null; status?: string }, client?: PoolClient): Promise<Department | null> {
    const db = client || pool;
    const query = `
      UPDATE departments 
      SET name = COALESCE($2, name), 
          supplier_id = CASE WHEN $3::INTEGER IS NOT NULL THEN $3::INTEGER ELSE supplier_id END,
          status = COALESCE($4, status) 
      WHERE id = $1 
      RETURNING id, name, supplier_id, status;
    `;
    const result = await db.query(query, [id, data.name ?? null, data.supplier_id ?? null, data.status ?? null]);
    return result.rows[0] || null;
  }

  // Check if department is referenced in receipt vouchers
  async isReferenced(id: number, client?: PoolClient): Promise<boolean> {
    const db = client || pool;
    const query = `SELECT 1 FROM receipt_vouchers WHERE department_id = $1 LIMIT 1;`;
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Permanently delete department from database
  async hardDelete(id: number, client?: PoolClient): Promise<boolean> {
    const db = client || pool;
    const query = `DELETE FROM departments WHERE id = $1;`;
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Soft delete department by updating status to INACTIVE
  async softDelete(id: number, client?: PoolClient): Promise<boolean> {
    const db = client || pool;
    const query = `UPDATE departments SET status = 'INACTIVE' WHERE id = $1;`;
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
