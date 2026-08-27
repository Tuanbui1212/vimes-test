import { pool } from '../config/db.js';
import type { Product } from '../models/product.js';
import type { PoolClient } from 'pg';

export class ProductRepository {
  // Lấy toàn bộ danh sách sản phẩm/vật tư
  async getAllProducts(): Promise<Product[]> {
    const query = `
      SELECT id, code, name, brand, specifications, quality, category_type, unit 
      FROM products 
      ORDER BY id ASC;
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Lấy sản phẩm theo ID
  async getProductById(id: number): Promise<Product | null> {
    const query = `
      SELECT id, code, name, brand, specifications, quality, category_type, unit 
      FROM products 
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Lấy sản phẩm theo Mã sản phẩm (Code)
  async getProductByCode(code: string): Promise<Product | null> {
    const query = `
      SELECT id, code, name, brand, specifications, quality, category_type, unit 
      FROM products 
      WHERE code = $1;
    `;
    const result = await pool.query(query, [code]);
    return result.rows[0] || null;
  }

  // Insert vật tư mới
  async insertProduct(client: PoolClient, product: Product): Promise<Product> {
    const query = `
      INSERT INTO products (code, name, brand, specifications, quality, category_type, unit)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, code, name, brand, specifications, quality, category_type, unit;
    `;
    const values = [
      product.code,
      product.name,
      product.brand || null,
      product.specifications || null,
      product.quality || null,
      product.category_type || null,
      product.unit
    ];

    const result = await client.query(query, values);
    return result.rows[0];
  }
}
