import { describe, it, expect } from '@jest/globals';
import { numberToWords, formatCurrency } from '../../../src/utils/format';

describe('Unit Test: Format Utils (Client)', () => {
  describe('formatCurrency (Định dạng tiền tệ VND)', () => {
    // Kiểm tra định dạng số tiền hợp lệ
    it('phải định dạng số tiền thành chuỗi tiền tệ VND chuẩn', () => {
      const formatted = formatCurrency(5000000);
      expect(formatted).toContain('5.000.000');
    });

    // Kiểm tra xử lý khi số tiền là 0 hoặc NaN
    it('phải trả về định dạng 0 khi truyền vào số 0 hoặc NaN', () => {
      expect(formatCurrency(0)).toContain('0');
      expect(formatCurrency(NaN)).toBe('0 ₫');
    });
  });

  describe('numberToWords (Dịch số tiền thành chữ tiếng Việt)', () => {
    // Kiểm tra trường hợp số 0 hoặc không hợp lệ
    it('phải trả về "Không đồng" khi truyền vào số 0 hoặc NaN', () => {
      expect(numberToWords(0)).toBe('Không đồng');
      expect(numberToWords(NaN)).toBe('Không đồng');
    });

    // Kiểm tra các quy tắc phát âm đặc biệt ở hàng chục và đơn vị (mốt, tư, lăm)
    it('phải áp dụng đúng quy tắc phát âm tiếng Việt (mốt, tư, lăm)', () => {
      expect(numberToWords(15)).toBe('Mười lăm đồng.');
      expect(numberToWords(21)).toBe('Hai mươi mốt đồng.');
      expect(numberToWords(24)).toBe('Hai mươi tư đồng.');
      expect(numberToWords(25)).toBe('Hai mươi lăm đồng.');
    });

    // Kiểm tra đọc số có số 0 ở giữa (lẻ, không trăm)
    it('phải đọc đúng các số có số không ở giữa (lẻ, không trăm)', () => {
      expect(numberToWords(105)).toBe('Một trăm lẻ năm đồng.');
      expect(numberToWords(1005)).toBe('Một nghìn không trăm lẻ năm đồng.');
    });

    // Kiểm tra các số tiền lớn (hàng triệu, hàng tỷ)
    it('phải đọc chính xác số tiền hàng triệu và hàng tỷ', () => {
      expect(numberToWords(4250000)).toBe('Bốn triệu hai trăm năm mươi nghìn đồng.');
      expect(numberToWords(1000000000)).toBe('Một tỷ đồng.');
    });

    // Kiểm tra tự động lấy giá trị tuyệt đối khi truyền số âm
    it('phải xử lý chính xác khi truyền vào số âm', () => {
      expect(numberToWords(-500000)).toBe('Năm trăm nghìn đồng.');
    });
  });
});
