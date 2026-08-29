import { z } from 'zod';

export const DepartmentSchema = z.object({
  id: z.number().int("ID đơn vị/phòng ban phải là số nguyên").optional(),
  name: z.string()
    .min(1, "Tên đơn vị/phòng ban không được để trống")
    .max(255, "Tên đơn vị/phòng ban không được vượt quá 255 ký tự"),
  supplier_id: z.number().int("ID đơn vị phải là số nguyên").nullable().optional(),
  supplier_name: z.string().optional(),
  status: z.string().default('ACTIVE').optional()
});

export type Department = z.infer<typeof DepartmentSchema>;
