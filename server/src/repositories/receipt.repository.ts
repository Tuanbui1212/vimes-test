import type { PoolClient } from 'pg';
import { pool } from '../config/db.js';
import type { ReceiptVoucherPayload, ReceiptItem } from '../models/receipt.js';

export class ReceiptRepository {
  // Get all receipt vouchers with joined metadata
  async getAllReceipts(): Promise<any[]> {
    const query = `
      SELECT 
        rv.id,
        rv.voucher_code,
        rv.receipt_date,
        rv.deliverer_name,
        rv.debit_account,
        rv.credit_account,
        rv.ref_document_no,
        rv.ref_document_date,
        rv.attached_docs,
        rv.total_amount,
        rv.status,
        rv.created_at,
        s.name as supplier_name,
        d.name as department_name,
        w.name as warehouse_name,
        w.location as warehouse_location
      FROM receipt_vouchers rv
      LEFT JOIN suppliers s ON rv.supplier_id = s.id
      LEFT JOIN departments d ON rv.department_id = d.id
      LEFT JOIN warehouses w ON rv.warehouse_id = w.id
      ORDER BY rv.id DESC;
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Get a single receipt voucher by ID with metadata
  async getReceiptById(voucherId: number): Promise<any> {
    const query = `
      SELECT 
        rv.*,
        s.name as supplier_name,
        d.name as department_name,
        w.name as warehouse_name,
        w.location as warehouse_location
      FROM receipt_vouchers rv
      LEFT JOIN suppliers s ON rv.supplier_id = s.id
      LEFT JOIN departments d ON rv.department_id = d.id
      LEFT JOIN warehouses w ON rv.warehouse_id = w.id
      WHERE rv.id = $1;
    `;

    const result = await pool.query(query, [voucherId]);
    return result.rows[0] || null;
  }

  async getNextReceiptVoucherNumber(year: number, client?: PoolClient): Promise<number> {
    const executor = client || pool;
    const query = `
      INSERT INTO receipt_voucher_counters (year, last_number)
      VALUES ($1, 1)
      ON CONFLICT (year)
      DO UPDATE SET last_number = receipt_voucher_counters.last_number + 1
      RETURNING last_number;
    `;
    const result = await executor.query(query, [year]);
    return parseInt(result.rows[0].last_number, 10);
  }

  async getMaxReceiptCodeByYear(year: number): Promise<number> {
    const query = `
    SELECT COALESCE(
      MAX(CAST(SUBSTRING(voucher_code FROM '^PNK-[0-9]+-([0-9]+)$') AS INTEGER)), 
      0
    ) as max_num
    FROM receipt_vouchers
    WHERE voucher_code LIKE $1;
  `;
    const result = await pool.query(query, [`PNK-${year}-%`]);
    return parseInt(result.rows[0].max_num, 10) || 0;
  }


  // Get all line items for a receipt voucher
  async getReceiptDetailsByVoucherId(voucherId: number): Promise<any[]> {
    const query = `
      SELECT 
        rvd.id,
        rvd.voucher_id,
        rvd.product_id,
        rvd.doc_quantity,
        rvd.actual_quantity,
        rvd.price,
        rvd.total_amount,
        p.code as product_code,
        p.name as product_name,
        p.brand,
        p.specifications,
        p.quality,
        p.category_type,
        p.unit
      FROM receipt_voucher_details rvd
      JOIN products p ON rvd.product_id = p.id
      WHERE rvd.voucher_id = $1
      ORDER BY rvd.id ASC;
    `;

    const result = await pool.query(query, [voucherId]);
    return result.rows;
  }

  // Insert header record for receipt voucher
  async insertVoucher(client: PoolClient, payload: ReceiptVoucherPayload, totalAmount: number): Promise<number> {
    const query = `
      INSERT INTO receipt_vouchers (
        voucher_code, 
        receipt_date, 
        supplier_id, 
        department_id, 
        warehouse_id, 
        deliverer_name, 
        debit_account, 
        credit_account, 
        ref_document_type,
        ref_document_no, 
        ref_document_date, 
        attached_docs, 
        total_amount, 
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id;
    `;
    const values = [
      payload.voucher_code,
      payload.receipt_date || new Date(),
      payload.supplier_id || null,
      payload.department_id || null,
      payload.warehouse_id || null,
      payload.deliverer_name || null,
      payload.debit_account || null,
      payload.credit_account || null,
      payload.ref_document_type || null,
      payload.ref_document_no || null,
      payload.ref_document_date || null,
      payload.attached_docs || null,
      totalAmount,
      payload.status || 'COMPLETED'
    ];

    const result = await client.query(query, values);
    return result.rows[0].id;
  }

  // Batch insert line items for receipt voucher
  async insertVoucherDetails(client: PoolClient, voucherId: number, items: ReceiptItem[]): Promise<void> {
    if (!items || items.length === 0) return;

    const values: any[] = [];
    const placeholders: string[] = [];

    items.forEach((item, index) => {
      const offset = index * 6;
      placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`);
      const total_amount = item.total_amount !== undefined ? item.total_amount : (item.actual_quantity * item.price);
      values.push(
        voucherId,
        item.product_id,
        item.doc_quantity || 0,
        item.actual_quantity,
        item.price,
        total_amount
      );
    });

    const query = `
      INSERT INTO receipt_voucher_details (voucher_id, product_id, doc_quantity, actual_quantity, price, total_amount)
      VALUES ${placeholders.join(', ')};
    `;

    await client.query(query, values);
  }
}
