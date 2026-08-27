import { Router } from 'express';
import { ReceiptController } from '../controllers/receipt.controller.js';

const router = Router();
const receiptController = new ReceiptController();

router.get('/', (req, res) => receiptController.getAllReceipts(req, res));
router.post('/', (req, res) => receiptController.createReceipt(req, res));
router.get('/:id', (req, res) => receiptController.getReceiptById(req, res));

export default router;
