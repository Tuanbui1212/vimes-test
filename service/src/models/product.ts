import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.number().int("ID sản phẩm phải là số nguyên").optional(),
  code: z.string()
    .min(1, "Mã sản phẩm không được để trống")
    .max(50, "Mã sản phẩm không vượt quá 50 ký tự"),
  name: z.string()
    .min(1, "Tên sản phẩm không được để trống")
    .max(255, "Tên sản phẩm không vượt quá 255 ký tự"),
  brand: z.string()
    .max(255, "Nhãn hiệu không được vượt quá 255 ký tự")
    .optional(),
  specifications: z.string()
    .max(255, "Quy cách không được vượt quá 255 ký tự")
    .optional(),
  quality: z.string()
    .max(255, "Phẩm chất không được vượt quá 255 ký tự")
    .optional(),
  category_type: z.string()
    .max(100, "Loại hàng hóa không được vượt quá 100 ký tự")
    .optional(),
  unit: z.string()
    .min(1, "Đơn vị tính không được để trống")
    .max(50, "Đơn vị tính không vượt quá 50 ký tự")
});

export type Product = z.infer<typeof ProductSchema>;
