import { z } from 'zod';

export const WarehouseSchema = z.object({
  id: z.number().int("ID kho phải là số nguyên").optional(),
  code: z.string()
    .min(1, "Mã kho không được để trống")
    .max(50, "Mã kho không được vượt quá 50 ký tự"),
  name: z.string()
    .min(1, "Tên kho không được để trống")
    .max(255, "Tên kho không được vượt quá 255 ký tự"),
  location: z.string()
    .min(1, "Địa điểm không được để trống")
    .max(255, "Địa điểm không được vượt quá 255 ký tự"),
  status: z.string().default('ACTIVE').optional()
});

export type Warehouse = z.infer<typeof WarehouseSchema>;
