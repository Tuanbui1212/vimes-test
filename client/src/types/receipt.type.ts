export interface ReceiptItem {
  id?: number;
  product_id: number;
  product_code?: string;
  product_name?: string;
  brand?: string;
  specifications?: string;
  quality?: string;
  category_type?: string;
  unit?: string;
  doc_quantity: number;
  actual_quantity: number;
  price: number;
  total_amount?: number;
}

export interface ReceiptVoucherPayload {
  voucher_code: string;
  receipt_date?: string;
  supplier_id?: number | null;
  department_id?: number | null;
  warehouse_id?: number | null;
  deliverer_name?: string | null;
  debit_account?: string | null;
  credit_account?: string | null;
  ref_document_type?: string | null;
  ref_document_no?: string | null;
  ref_document_date?: string | null;
  attached_docs?: string | null;
  status?: 'DRAFT' | 'COMPLETED';
  items: ReceiptItem[];
}

export interface ReceiptVoucher extends Omit<ReceiptVoucherPayload, 'items'> {
  id: number;
  total_amount: number;
  created_at: string;
  supplier_name?: string;
  department_name?: string;
  warehouse_name?: string;
  warehouse_location?: string;
  items?: ReceiptItem[];
}
