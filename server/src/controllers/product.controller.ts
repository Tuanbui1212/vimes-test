import type { Request, Response } from 'express';
import { ProductService } from '../services/product.service.js';
import { ProductSchema } from '../models/product.js';

const productService = new ProductService();

export class ProductController {
  // Get all products / search with pagination
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status ? String(req.query.status) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;

      const result = await productService.getProducts({ status, search, page, limit });
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (error: any) {
      console.error('Error fetching products:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Không thể tải danh sách vật tư' 
      });
    }
  }

  // Get product by ID
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID vật tư/dược phẩm không hợp lệ' });
        return;
      }

      const product = await productService.getProductById(id);
      if (!product) {
        res.status(404).json({ success: false, message: 'Không tìm thấy vật tư/dược phẩm' });
        return;
      }

      res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      console.error('Error fetching product:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Không thể lấy thông tin vật tư' 
      });
    }
  }

  // Get product by Code
  async getProductByCode(req: Request, res: Response): Promise<void> {
    try {
      const code = String(req.params.code);
      const product = await productService.getProductByCode(code);
      if (!product) {
        res.status(404).json({ success: false, message: 'Không tìm thấy vật tư/dược phẩm với mã tương ứng' });
        return;
      }

      res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      console.error('Error fetching product by code:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Không thể tìm kiếm vật tư' 
      });
    }
  }

  // Create new product
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const parsed = ProductSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ 
          success: false, 
          message: 'Dữ liệu không hợp lệ: ' + parsed.error.issues.map(i => i.message).join(', '), 
          errors: parsed.error.issues 
        });
        return;
      }

      const created = await productService.createProduct(parsed.data);
      res.status(201).json({ success: true, message: 'Thêm mới vật tư/dược phẩm thành công', data: created });
    } catch (error: any) {
      if (error.code === '23505') {
        res.status(409).json({ success: false, message: 'Mã vật tư đã tồn tại trên hệ thống' });
        return;
      }
      console.error('Error creating product:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Không thể tạo mới vật tư' 
      });
    }
  }

  // Update existing product
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID vật tư/dược phẩm không hợp lệ' });
        return;
      }

      const parsed = ProductSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ 
          success: false, 
          message: 'Dữ liệu không hợp lệ: ' + parsed.error.issues.map(i => i.message).join(', '), 
          errors: parsed.error.issues 
        });
        return;
      }

      const updated = await productService.updateProduct(id, parsed.data);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Không tìm thấy vật tư/dược phẩm' });
        return;
      }

      res.status(200).json({ success: true, message: 'Cập nhật vật tư/dược phẩm thành công', data: updated });
    } catch (error: any) {
      console.error('Error updating product:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Không thể cập nhật vật tư' 
      });
    }
  }

  // Delete product
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID vật tư/dược phẩm không hợp lệ' });
        return;
      }

      const result = await productService.deleteProduct(id);

      res.status(200).json({
        success: true,
        message: result.isHardDelete
          ? 'Đã xóa hoàn toàn vật tư khỏi hệ thống'
          : 'Vật tư đã phát sinh trong phiếu nhập nên được chuyển sang trạng thái ngưng hoạt động (xóa mềm)',
        action: result.isHardDelete ? 'HARD_DELETE' : 'SOFT_DELETE'
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Không thể xóa vật tư' 
      });
    }
  }
}
