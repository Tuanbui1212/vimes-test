import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ProductService } from '../../../src/services/product.service.js';
import { ProductRepository } from '../../../src/repositories/product.repository.js';
import type { Product } from '../../../src/models/product.js';

describe('Unit Test: ProductService', () => {
  let productService: ProductService;

  const sampleProduct: Product = {
    id: 1,
    code: 'VT001',
    name: 'Bơm tiêm 5ml',
    brand: 'Vinamed',
    specifications: '5ml/ống',
    quality: 'Loại 1',
    category_type: 'Vật tư tiêu hao',
    unit: 'Ống',
    status: 'ACTIVE',
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    productService = new ProductService();
  });

  describe('createProduct', () => {
    // Kiểm tra ném lỗi khi mã sản phẩm đã tồn tại trong hệ thống
    it('phải ném lỗi nếu mã vật tư đã tồn tại', async () => {
      const spyGetByCode = jest.spyOn(ProductRepository.prototype, 'getProductByCode').mockResolvedValueOnce(sampleProduct);
      const spyInsert = jest.spyOn(ProductRepository.prototype, 'insertProduct');

      await expect(productService.createProduct(sampleProduct)).rejects.toThrow("Mã vật tư 'VT001' đã tồn tại trên hệ thống");
      expect(spyGetByCode).toHaveBeenCalledWith('VT001');
      expect(spyInsert).not.toHaveBeenCalled();
    });

    // Kiểm tra tạo mới thành công khi mã sản phẩm chưa tồn tại
    it('phải tạo thành công và trả về vật tư mới nếu mã chưa tồn tại', async () => {
      const spyGetByCode = jest.spyOn(ProductRepository.prototype, 'getProductByCode').mockResolvedValueOnce(null);
      const spyInsert = jest.spyOn(ProductRepository.prototype, 'insertProduct').mockResolvedValueOnce(sampleProduct);

      const result = await productService.createProduct(sampleProduct);
      expect(result).toEqual(sampleProduct);
      expect(spyGetByCode).toHaveBeenCalledWith('VT001');
      expect(spyInsert).toHaveBeenCalledWith(sampleProduct);
    });
  });

  describe('getProducts', () => {
    // Kiểm tra tính toán phân trang và cờ còn dữ liệu tiếp theo
    it('phải tính toán đúng số trang totalPages và cờ hasMore khi có nhiều trang', async () => {
      jest.spyOn(ProductRepository.prototype, 'getProducts').mockResolvedValueOnce({
        products: [sampleProduct],
        total: 45,
      });

      const result = await productService.getProducts({ page: 2, limit: 10 });
      expect(result.items).toEqual([sampleProduct]);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 45,
        totalPages: 5,
        hasMore: true,
      });
    });

    // Kiểm tra cờ hasMore trả về false khi đã ở trang cuối cùng
    it('phải đánh dấu hasMore = false khi đang ở trang cuối cùng', async () => {
      jest.spyOn(ProductRepository.prototype, 'getProducts').mockResolvedValueOnce({
        products: [sampleProduct],
        total: 45,
      });

      const result = await productService.getProducts({ page: 5, limit: 10 });
      expect(result.pagination.totalPages).toBe(5);
      expect(result.pagination.hasMore).toBe(false);
    });
  });

  describe('getProductById & getProductByCode', () => {
    // Kiểm tra tra cứu vật tư theo ID thành công
    it('phải trả về vật tư tương ứng khi tìm thấy ID', async () => {
      jest.spyOn(ProductRepository.prototype, 'getProductById').mockResolvedValueOnce(sampleProduct);

      const result = await productService.getProductById(1);
      expect(result).toEqual(sampleProduct);
    });

    // Kiểm tra trả về null khi không tìm thấy mã vật tư
    it('phải trả về null khi không tìm thấy mã vật tư', async () => {
      jest.spyOn(ProductRepository.prototype, 'getProductByCode').mockResolvedValueOnce(null);

      const result = await productService.getProductByCode('UNKNOWN_CODE');
      expect(result).toBeNull();
    });
  });

  describe('updateProduct', () => {
    // Kiểm tra ném lỗi khi cập nhật vật tư không tồn tại
    it('phải ném lỗi nếu cập nhật vật tư không tồn tại', async () => {
      jest.spyOn(ProductRepository.prototype, 'getProductById').mockResolvedValueOnce(null);

      await expect(productService.updateProduct(999, { name: 'Tên mới' })).rejects.toThrow('Vật tư/dược phẩm không tồn tại trên hệ thống');
    });

    // Kiểm tra ném lỗi khi đổi sang mã code đã bị vật tư khác sử dụng
    it('phải ném lỗi nếu cập nhật sang mã code đã bị vật tư khác sử dụng', async () => {
      jest.spyOn(ProductRepository.prototype, 'getProductById').mockResolvedValueOnce(sampleProduct);
      jest.spyOn(ProductRepository.prototype, 'getProductByCode').mockResolvedValueOnce({
        ...sampleProduct,
        id: 2,
        code: 'VT002',
      });

      await expect(productService.updateProduct(1, { code: 'VT002' })).rejects.toThrow("Mã vật tư 'VT002' đã được sử dụng bởi mặt hàng khác");
    });

    // Kiểm tra cập nhật thành công khi dữ liệu hợp lệ
    it('phải cập nhật thành công khi dữ liệu hợp lệ', async () => {
      const updatedProduct = { ...sampleProduct, name: 'Bơm tiêm 5ml cải tiến' };
      jest.spyOn(ProductRepository.prototype, 'getProductById').mockResolvedValueOnce(sampleProduct);
      jest.spyOn(ProductRepository.prototype, 'updateProduct').mockResolvedValueOnce(updatedProduct);

      const result = await productService.updateProduct(1, { name: 'Bơm tiêm 5ml cải tiến' });
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('deleteProduct', () => {
    // Kiểm tra ném lỗi khi xóa vật tư không tồn tại
    it('phải ném lỗi nếu vật tư không tồn tại', async () => {
      jest.spyOn(ProductRepository.prototype, 'getProductById').mockResolvedValueOnce(null);

      await expect(productService.deleteProduct(999)).rejects.toThrow('Vật tư/dược phẩm không tồn tại trên hệ thống');
    });

    // Kiểm tra thực hiện xóa mềm khi vật tư đã từng phát sinh chứng từ
    it('phải thực hiện xóa mềm nếu vật tư đã từng phát sinh chứng từ', async () => {
      jest.spyOn(ProductRepository.prototype, 'getProductById').mockResolvedValueOnce(sampleProduct);
      jest.spyOn(ProductRepository.prototype, 'isReferenced').mockResolvedValueOnce(true);
      const spySoftDelete = jest.spyOn(ProductRepository.prototype, 'softDelete').mockResolvedValueOnce(true);
      const spyHardDelete = jest.spyOn(ProductRepository.prototype, 'hardDelete');

      const result = await productService.deleteProduct(1);
      expect(result).toEqual({ isHardDelete: false });
      expect(spySoftDelete).toHaveBeenCalledWith(1);
      expect(spyHardDelete).not.toHaveBeenCalled();
    });

    // Kiểm tra thực hiện xóa cứng khi vật tư chưa từng phát sinh chứng từ
    it('phải thực hiện xóa cứng nếu vật tư chưa từng phát sinh chứng từ', async () => {
      jest.spyOn(ProductRepository.prototype, 'getProductById').mockResolvedValueOnce(sampleProduct);
      jest.spyOn(ProductRepository.prototype, 'isReferenced').mockResolvedValueOnce(false);
      const spyHardDelete = jest.spyOn(ProductRepository.prototype, 'hardDelete').mockResolvedValueOnce(true);
      const spySoftDelete = jest.spyOn(ProductRepository.prototype, 'softDelete');

      const result = await productService.deleteProduct(1);
      expect(result).toEqual({ isHardDelete: true });
      expect(spyHardDelete).toHaveBeenCalledWith(1);
      expect(spySoftDelete).not.toHaveBeenCalled();
    });
  });
});
