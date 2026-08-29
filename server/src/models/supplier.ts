import { z } from 'zod';
import type { Department } from './department.js';

export const SupplierSchema = z.object({
  id: z.number().int("ID nhà cung cấp phải là số nguyên").optional(),
  name: z.string()
    .min(1, "Tên nhà cung cấp không được để trống")
    .max(255, "Tên nhà cung cấp không được vượt quá 255 ký tự"),
  status: z.string().default('ACTIVE').optional()
});

export type Supplier = z.infer<typeof SupplierSchema>;
export type SupplierWithDepartments = Supplier & {
  departments: Department[];
}