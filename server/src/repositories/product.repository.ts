import { pool } from '../config/db.js';
import type { Product } from '../models/product.js';
import type { PoolClient } from 'pg';

export class ProductRepository {
  // Get products with optional search, status filter, and pagination
  async getProducts(
    params: { search?: string; status?: string; page?: number; limit?: number },
    client?: PoolClient
  ): Promise<{ products: Product[]; total: number }> {
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
      conditions.push(`(
        code ILIKE $${paramIndex} OR 
        name ILIKE $${paramIndex} OR 
        brand ILIKE $${paramIndex} OR 
        specifications ILIKE $${paramIndex} OR 
        category_type ILIKE $${paramIndex}
      )`);
      values.push(searchTerm);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Get Total Count
    const countQuery = `SELECT COUNT(*) AS count FROM products ${whereClause};`;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0]?.count || '0', 10);

    // 2. Get Paginated Data
    let dataQuery = `
      SELECT id, code, name, brand, specifications, quality, category_type, unit, COALESCE(status, 'ACTIVE') AS status 
      FROM products 
      ${whereClause} 
      ORDER BY id ASC
    `;

    if (params.limit && params.limit > 0) {
      const page = params.page && params.page > 0 ? params.page : 1;
      const offset = (page - 1) * params.limit;
      dataQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      values.push(params.limit, offset);
    }

    const result = await db.query(dataQuery, values);
    return { products: result.rows, total };
  }

  // Get all products (compatibility wrapper)
  async getAllProducts(status?: string, client?: PoolClient): Promise<Product[]> {
    const res = await this.getProducts({ status }, client);
    return res.products;
  }

  // Get product by ID
  async getProductById(id: number, client?: PoolClient): Promise<Product | null> {
    const db = client || pool;
    const query = `
      SELECT id, code, name, brand, specifications, quality, category_type, unit, COALESCE(status, 'ACTIVE') AS status 
      FROM products 
      WHERE id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  // Get multiple products by IDs in a single query
  async getProductsByIds(ids: number[], client?: PoolClient): Promise<Product[]> {
    if (!ids || ids.length === 0) return [];
    const db = client || pool;
    const query = `
      SELECT id, code, name, brand, specifications, quality, category_type, unit, COALESCE(status, 'ACTIVE') AS status 
      FROM products 
      WHERE id = ANY($1::int[]);
    `;
    const result = await db.query(query, [ids]);
    return result.rows;
  }

  // Get product by Code
  async getProductByCode(code: string, client?: PoolClient): Promise<Product | null> {
    const db = client || pool;
    const query = `
      SELECT id, code, name, brand, specifications, quality, category_type, unit, COALESCE(status, 'ACTIVE') AS status 
      FROM products 
      WHERE code = $1;
    `;
    const result = await db.query(query, [code]);
    return result.rows[0] || null;
  }

  // Insert new product
  async insertProduct(product: Product, client?: PoolClient): Promise<Product> {
    const db = client || pool;
    const query = `
      INSERT INTO products (code, name, brand, specifications, quality, category_type, unit, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'ACTIVE'))
      RETURNING id, code, name, brand, specifications, quality, category_type, unit, status;
    `;
    const values = [
      product.code,
      product.name,
      product.brand || null,
      product.specifications || null,
      product.quality || null,
      product.category_type || null,
      product.unit,
      product.status || 'ACTIVE'
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Update existing product
  async updateProduct(id: number, data: Partial<Product>, client?: PoolClient): Promise<Product | null> {
    const db = client || pool;
    const query = `
      UPDATE products 
      SET code = COALESCE($2, code),
          name = COALESCE($3, name),
          brand = COALESCE($4, brand),
          specifications = COALESCE($5, specifications),
          quality = COALESCE($6, quality),
          category_type = COALESCE($7, category_type),
          unit = COALESCE($8, unit),
          status = COALESCE($9, status)
      WHERE id = $1
      RETURNING id, code, name, brand, specifications, quality, category_type, unit, status;
    `;
    const values = [
      id,
      data.code,
      data.name,
      data.brand,
      data.specifications,
      data.quality,
      data.category_type,
      data.unit,
      data.status
    ];

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  // Check if product is referenced in receipt voucher details
  async isReferenced(id: number, client?: PoolClient): Promise<boolean> {
    const db = client || pool;
    const query = `SELECT 1 FROM receipt_voucher_details WHERE product_id = $1 LIMIT 1;`;
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Permanently delete product from database
  async hardDelete(id: number, client?: PoolClient): Promise<boolean> {
    const db = client || pool;
    const query = `DELETE FROM products WHERE id = $1;`;
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Soft delete product by updating status to INACTIVE
  async softDelete(id: number, client?: PoolClient): Promise<boolean> {
    const db = client || pool;
    const query = `UPDATE products SET status = 'INACTIVE' WHERE id = $1;`;
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
