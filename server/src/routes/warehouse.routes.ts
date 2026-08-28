import { Router } from 'express';
import { WarehouseController } from '../controllers/warehouse.controller.js';

const router = Router();
const warehouseController = new WarehouseController();

router.get('/', (req, res) => warehouseController.getAllWarehouses(req, res));
router.get('/:id', (req, res) => warehouseController.getWarehouseById(req, res));
router.get('/code/:code', (req, res) => warehouseController.getWarehouseByCode(req, res));
router.post('/', (req, res) => warehouseController.createWarehouse(req, res));
router.put('/:id', (req, res) => warehouseController.updateWarehouse(req, res));
router.delete('/:id', (req, res) => warehouseController.deleteWarehouse(req, res));

export default router;
