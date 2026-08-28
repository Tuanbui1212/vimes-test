import { z } from 'zod';

export const ReceiptItemSchema = z.object({
  product_id: z.number().int().min(1, "Vui lòng chọn mặt hàng"),
  doc_quantity: z.number().int().min(1, "Số lượng theo chứng từ phải lớn hơn 0"),
  actual_quantity: z.number().int().min(1, "Số lượng thực nhập phải lớn hơn 0"),
  price: z.number().min(0.01, "Đơn giá phải lớn hơn 0"),
  total_amount: z.number().min(0, "Thành tiền không được âm").optional()
});

export const ReceiptVoucherPayloadSchema = z.object({
  voucher_code: z.string()
    .trim()
    .min(1, "Mã phiếu không được để trống")
    .max(50, "Mã phiếu không được vượt quá 50 ký tự"),
  receipt_date: z.string()
    .trim()
    .min(1, "Ngày lập phiếu không được để trống"),
  supplier_id: z.number()
    .int()
    .min(1, "Vui lòng chọn Đơn vị cung cấp"),
  department_id: z.number()
    .int()
    .min(1, "Vui lòng chọn Phòng ban yêu cầu"),
  warehouse_id: z.number()
    .int()
    .min(1, "Vui lòng chọn Kho nhập hàng"),
  deliverer_name: z.string()
    .trim()
    .min(1, "Họ tên người giao hàng không được để trống")
    .max(255, "Họ tên người giao không vượt quá 255 ký tự"),
  debit_account: z.string()
    .trim()
    .min(1, "Tài khoản Nợ không được để trống")
    .max(50, "Tài khoản Nợ không vượt quá 50 ký tự"),
  credit_account: z.string()
    .trim()
    .min(1, "Tài khoản Có không được để trống")
    .max(50, "Tài khoản Có không vượt quá 50 ký tự"),
  ref_document_type: z.string()
    .trim()
    .min(1, "Loại chứng từ gốc không được để trống")
    .max(100, "Loại chứng từ không vượt quá 100 ký tự"),
  ref_document_no: z.string()
    .trim()
    .min(1, "Số chứng từ kèm theo không được để trống")
    .max(100, "Số chứng từ kèm theo không vượt quá 100 ký tự"),
  ref_document_date: z.string()
    .trim()
    .min(1, "Ngày chứng từ gốc không được để trống"),
  attached_docs: z.string()
    .trim()
    .min(1, "Số chứng từ gốc kèm theo không được để trống")
    .max(255, "Chứng từ gốc kèm theo không vượt quá 255 ký tự"),
  total_amount: z.number().min(0).optional(),
  status: z.enum(['DRAFT', 'COMPLETED']).default('COMPLETED'),
  items: z.array(ReceiptItemSchema).min(1, "Phải có ít nhất 1 mặt hàng trong phiếu nhập")
});

export type ReceiptItem = z.infer<typeof ReceiptItemSchema>;
export type ReceiptVoucherPayload = z.infer<typeof ReceiptVoucherPayloadSchema>;
