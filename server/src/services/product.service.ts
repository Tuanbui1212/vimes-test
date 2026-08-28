import { ProductRepository } from '../repositories/product.repository.js';
import type { Product } from '../models/product.js';

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  // Get products with search and pagination metadata
  async getProducts(params: { search?: string; status?: string; page?: number; limit?: number }): Promise<{
    items: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    const page = params.page && Number(params.page) > 0 ? Number(params.page) : 1;
    const limit = params.limit && Number(params.limit) > 0 ? Number(params.limit) : (params.page ? 15 : 0);
    const { products, total } = await this.productRepository.getProducts({
      ...params,
      page,
      limit
    });
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
    const hasMore = limit > 0 ? page < totalPages : false;
    return {
      items: products,
      pagination: {
        page,
        limit: limit > 0 ? limit : total,
        total,
        totalPages,
        hasMore
      }
    };
  }

  // Get all products with optional status filter
  async getAllProducts(status?: string): Promise<Product[]> {
    return await this.productRepository.getAllProducts(status);
  }

  // Get product by ID
  async getProductById(id: number): Promise<Product | null> {
    return await this.productRepository.getProductById(id);
  }

  // Get product by Code
  async getProductByCode(code: string): Promise<Product | null> {
    return await this.productRepository.getProductByCode(code);
  }

  // Create new product
  async createProduct(product: Product): Promise<Product> {
    const existing = await this.productRepository.getProductByCode(product.code);
    if (existing) {
      throw new Error(`Mã vật tư '${product.code}' đã tồn tại trên hệ thống`);
    }

    return await this.productRepository.insertProduct(product);
  }

  // Update existing product
  async updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
    const existing = await this.productRepository.getProductById(id);
    if (!existing) {
      throw new Error('Vật tư/dược phẩm không tồn tại trên hệ thống');
    }

    if (data.code && data.code !== existing.code) {
      const duplicate = await this.productRepository.getProductByCode(data.code);
      if (duplicate && duplicate.id !== id) {
        throw new Error(`Mã vật tư '${data.code}' đã được sử dụng bởi mặt hàng khác`);
      }
    }

    return await this.productRepository.updateProduct(id, data);
  }

  // Delete product
  async deleteProduct(id: number): Promise<{ isHardDelete: boolean }> {
    const existing = await this.productRepository.getProductById(id);
    if (!existing) {
      throw new Error('Vật tư/dược phẩm không tồn tại trên hệ thống');
    }

    const isReferenced = await this.productRepository.isReferenced(id);
    if (isReferenced) {
      await this.productRepository.softDelete(id);
      return { isHardDelete: false };
    } else {
      await this.productRepository.hardDelete(id);
      return { isHardDelete: true };
    }
  }
}
