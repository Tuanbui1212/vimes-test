import { Router } from 'express';
import { WarehouseController } from '../controllers/warehouse.controller.js';

const router = Router();
const warehouseController = new WarehouseController();

router.get('/', (req, res) => warehouseController.getAllWarehouses(req, res));
router.get('/:id', (req, res) => warehouseController.getWarehouseById(req, res));

export default router;
