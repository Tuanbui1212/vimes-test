import { z } from 'zod';

export const SupplierSchema = z.object({
  id: z.number().int("ID nhà cung cấp phải là số nguyên").optional(),
  name: z.string()
    .min(1, "Tên nhà cung cấp không được để trống")
    .max(255, "Tên nhà cung cấp không được vượt quá 255 ký tự")
});

export type Supplier = z.infer<typeof SupplierSchema>;
