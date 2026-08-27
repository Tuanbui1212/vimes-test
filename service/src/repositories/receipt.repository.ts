import type { PoolClient } from 'pg';
import { pool } from '../config/db.js';
import type { ReceiptVoucherPayload, ReceiptItem } from '../models/receipt.js';

export class ReceiptRepository {
  // Lấy danh sách toàn bộ phiếu nhập kho
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

  // Lấy chi tiết 1 phiếu nhập kho theo ID
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

  // Lấy danh sách hàng hóa trong phiếu nhập kho
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

  // Insert phiếu nhập kho
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
        ref_document_no, 
        ref_document_date, 
        attached_docs, 
        total_amount, 
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
      payload.ref_document_no || null,
      payload.ref_document_date || null,
      payload.attached_docs || null,
      totalAmount,
      payload.status || 'COMPLETED'
    ];

    const result = await client.query(query, values);
    return result.rows[0].id;
  }

  // Insert nhiều chi tiết phiếu nhập kho cùng lúc (Batch Insert)
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
