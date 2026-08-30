import { z } from 'zod';

export const ReceiptItemSchema = z.object({
  product_id: z.number({ message: 'Vui lòng chọn mặt hàng' }).int().min(1, 'Vui lòng chọn mặt hàng'),
  doc_quantity: z.number({ message: 'Số lượng chứng từ phải là số' }).int().min(0, 'Số lượng chứng từ không được âm'),
  actual_quantity: z.number({ message: 'Số lượng thực nhập phải là số' }).int().min(1, 'Số lượng thực nhập phải lớn hơn 0'),
  price: z.number({ message: 'Đơn giá phải là số' }).min(0, 'Đơn giá không được âm'),
  total_amount: z.number().min(0, 'Thành tiền không được âm').optional()
});

export const ReceiptVoucherPayloadSchema = z.object({
  voucher_code: z.string()
    .trim()
    .max(50, 'Mã phiếu không được vượt quá 50 ký tự')
    .optional(),
  receipt_date: z.string()
    .trim()
    .min(1, 'Ngày lập phiếu không được để trống'),
  supplier_id: z.number({ message: 'Vui lòng chọn Đơn vị' })
    .int()
    .min(1, 'Vui lòng chọn Đơn vị')
    .nullable()
    .optional(),
  department_id: z.number({ message: 'Vui lòng chọn Phòng ban' })
    .int()
    .min(1, 'Vui lòng chọn Phòng ban')
    .nullable()
    .optional(),
  warehouse_id: z.number({ message: 'Vui lòng chọn Kho nhập hàng' })
    .int()
    .min(1, 'Vui lòng chọn Kho nhập hàng'),
  deliverer_name: z.string()
    .trim()
    .max(255, 'Họ tên người giao không vượt quá 255 ký tự')
    .nullable()
    .optional(),
  debit_account: z.string()
    .trim()
    .max(50, 'Tài khoản Nợ không vượt quá 50 ký tự')
    .nullable()
    .optional(),
  credit_account: z.string()
    .trim()
    .max(50, 'Tài khoản Có không vượt quá 50 ký tự')
    .nullable()
    .optional(),
  ref_document_type: z.string()
    .trim()
    .max(100, 'Loại chứng từ không vượt quá 100 ký tự')
    .nullable()
    .optional(),
  ref_document_no: z.string()
    .trim()
    .max(100, 'Số chứng từ kèm theo không vượt quá 100 ký tự')
    .nullable()
    .optional(),
  ref_document_date: z.string()
    .trim()
    .nullable()
    .optional(),
  attached_docs: z.string()
    .trim()
    .max(255, 'Chứng từ gốc kèm theo không vượt quá 255 ký tự')
    .nullable()
    .optional(),
  total_amount: z.number().min(0).optional(),
  status: z.enum(['DRAFT', 'COMPLETED']).default('COMPLETED'),
  items: z.array(ReceiptItemSchema).min(1, 'Phải có ít nhất 1 mặt hàng trong phiếu nhập')
});

export type ReceiptItem = z.infer<typeof ReceiptItemSchema>;
export type ReceiptVoucherPayload = z.infer<typeof ReceiptVoucherPayloadSchema>;
