import { pool } from '../config/db.js';
import type { Department } from '../models/department.js';

export class DepartmentRepository {
  // Lấy toàn bộ danh sách đơn vị/phòng ban
  async getAllDepartments(): Promise<Department[]> {
    const query = `SELECT id, name FROM departments ORDER BY id ASC;`;
    const result = await pool.query(query);
    return result.rows;
  }

  // Lấy đơn vị/phòng ban theo ID
  async getDepartmentById(id: number): Promise<Department | null> {
    const query = `SELECT id, name FROM departments WHERE id = $1;`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}
