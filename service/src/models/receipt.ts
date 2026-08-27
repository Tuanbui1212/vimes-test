import { z } from 'zod';

export const ReceiptItemSchema = z.object({
  product_id: z.number().int("Product ID phải là số nguyên"),
  doc_quantity: z.number().int("Số lượng theo chứng từ phải là số nguyên").min(0, "Số lượng theo chứng từ không được âm").default(0),
  actual_quantity: z.number().int("Số lượng thực nhập phải là số nguyên").min(1, "Số lượng thực nhập phải lớn hơn 0"),
  price: z.number().min(0, "Đơn giá không được âm"),
  total_amount: z.number().min(0, "Thành tiền không được âm").optional()
});

export const ReceiptVoucherPayloadSchema = z.object({
  voucher_code: z.string()
    .min(1, "Mã phiếu không được để trống")
    .max(50, "Mã phiếu không được vượt quá 50 ký tự"),
  receipt_date: z.string().optional(),
  supplier_id: z.number().int("Supplier ID phải là số nguyên").optional().nullable(),
  department_id: z.number().int("Department ID phải là số nguyên").optional().nullable(),
  warehouse_id: z.number().int("Warehouse ID phải là số nguyên").optional().nullable(),
  deliverer_name: z.string().max(255, "Họ tên người giao không vượt quá 255 ký tự").optional().nullable(),
  debit_account: z.string().max(50, "Tài khoản Nợ không vượt quá 50 ký tự").optional().nullable(),
  credit_account: z.string().max(50, "Tài khoản Có không vượt quá 50 ký tự").optional().nullable(),
  ref_document_no: z.string().max(100, "Số chứng từ kèm theo không vượt quá 100 ký tự").optional().nullable(),
  ref_document_date: z.string().optional().nullable(),
  attached_docs: z.string().max(255, "Chứng từ gốc kèm theo không vượt quá 255 ký tự").optional().nullable(),
  total_amount: z.number().min(0).optional(),
  status: z.enum(['DRAFT', 'COMPLETED']).optional().default('COMPLETED'),
  items: z.array(ReceiptItemSchema).min(1, "Phải có ít nhất 1 mặt hàng trong phiếu nhập")
});

export type ReceiptItem = z.infer<typeof ReceiptItemSchema>;
export type ReceiptVoucherPayload = z.infer<typeof ReceiptVoucherPayloadSchema>;
