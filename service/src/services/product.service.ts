import { ProductRepository } from '../repositories/product.repository.js';
import type { Product } from '../models/product.js';

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  // Lấy toàn bộ danh sách sản phẩm/vật tư
  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.getAllProducts();
  }

  // Lấy chi tiết sản phẩm theo ID
  async getProductById(id: number): Promise<Product | null> {
    return await this.productRepository.getProductById(id);
  }

  // Lấy chi tiết sản phẩm theo Mã (Code)
  async getProductByCode(code: string): Promise<Product | null> {
    return await this.productRepository.getProductByCode(code);
  }
}
