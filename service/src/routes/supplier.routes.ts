import { Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller.js';

const router = Router();
const supplierController = new SupplierController();

router.get('/', (req, res) => supplierController.getAllSuppliers(req, res));
router.get('/:id', (req, res) => supplierController.getSupplierById(req, res));

export default router;
