import type { Request, Response } from 'express';
import { ReceiptService } from '../services/receipt.service.js';
import { ReceiptVoucherPayloadSchema } from '../models/receipt.js';
import { z } from 'zod';

const receiptService = new ReceiptService();

export class ReceiptController {
  // Get all receipt vouchers
  async getAllReceipts(req: Request, res: Response): Promise<void> {
    try {
      const receipts = await receiptService.getAllReceipts();
      res.status(200).json({ success: true, data: receipts });
    } catch (error: any) {
      console.error('Error fetching receipts:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Không thể tải danh sách phiếu nhập kho'
      });
    }
  }

  // Get receipt voucher by ID
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
    } catch (error: any) {
      console.error('Error fetching receipt voucher:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Không thể tải chi tiết phiếu nhập kho'
      });
    }
  }

  // Create new receipt voucher
  async createReceipt(req: Request, res: Response): Promise<void> {
    try {
      const parsedData = ReceiptVoucherPayloadSchema.parse(req.body);
      const result = await receiptService.createReceipt(parsedData);
      res.status(201).json({
        success: true,
        message: `Lập phiếu nhập kho ${result.voucherCode} thành công`,
        data: result
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ: ' + error.issues.map(i => i.message).join(', '),
          errors: error.issues
        });
        return;
      }

      // Check PostgreSQL unique constraint violation (code 23505)
      if (error.code === '23505') {
        res.status(409).json({
          success: false,
          message: 'Số phiếu nhập kho đã tồn tại trên hệ thống. Vui lòng kiểm tra lại mã phiếu!'
        });
        return;
      }

      console.error('Error creating receipt voucher:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Không thể lập phiếu nhập kho'
      });
    }
  }
}
