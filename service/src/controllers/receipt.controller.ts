import type { Request, Response } from 'express';
import { ReceiptService } from '../services/receipt.service.js';
import { ReceiptVoucherPayloadSchema } from '../models/receipt.js';
import { z } from 'zod';

const receiptService = new ReceiptService();

export class ReceiptController {
  // Lấy danh sách toàn bộ phiếu nhập kho
  async getAllReceipts(req: Request, res: Response): Promise<void> {
    try {
      const receipts = await receiptService.getAllReceipts();
      res.status(200).json({ success: true, data: receipts });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phiếu nhập kho:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
  }

  // Lấy chi tiết 1 phiếu nhập kho
  async getReceiptById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID phiếu nhập kho không hợp lệ' });
        return;
      }

      const receipt = await receiptService.getReceiptById(id);
      if (!receipt) {
        res.status(404).json({ success: false, message: 'Không tìm thấy phiếu nhập kho' });
        return;
      }

      res.status(200).json({ success: true, data: receipt });
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết phiếu nhập kho:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
  }

  // Tạo mới phiếu nhập kho
  async createReceipt(req: Request, res: Response): Promise<void> {
    try {
      const parsedData = ReceiptVoucherPayloadSchema.parse(req.body);
      const result = await receiptService.createReceipt(parsedData);
      res.status(201).json({
        success: true,
        message: 'Tạo phiếu nhập kho thành công',
        data: result
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: error.issues
        });
        return;
      }

      console.error('Lỗi khi tạo phiếu nhập kho:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
  }
}
