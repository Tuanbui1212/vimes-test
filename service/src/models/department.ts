import { z } from 'zod';

export const DepartmentSchema = z.object({
  id: z.number().int("ID đơn vị/phòng ban phải là số nguyên").optional(),
  name: z.string()
    .min(1, "Tên đơn vị/phòng ban không được để trống")
    .max(255, "Tên đơn vị/phòng ban không được vượt quá 255 ký tự")
});

export type Department = z.infer<typeof DepartmentSchema>;
