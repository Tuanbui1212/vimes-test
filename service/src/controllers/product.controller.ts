import type { Request, Response } from 'express';
import { ProductService } from '../services/product.service.js';

const productService = new ProductService();

export class ProductController {
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await productService.getAllProducts();
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
        return;
      }

      const product = await productService.getProductById(id);
      if (!product) {
        res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        return;
      }

      res.status(200).json({ success: true, data: product });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin sản phẩm:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
  }

  async getProductByCode(req: Request, res: Response): Promise<void> {
    try {
      const code = String(req.params.code);
      const product = await productService.getProductByCode(code);
      if (!product) {
        res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm với mã này' });
        return;
      }

      res.status(200).json({ success: true, data: product });
    } catch (error) {
      console.error('Lỗi khi tìm sản phẩm theo mã:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
  }
}
