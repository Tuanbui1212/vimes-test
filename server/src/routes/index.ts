import { Router } from 'express';
import supplierRoutes from './supplier.routes.js';
import departmentRoutes from './department.routes.js';
import warehouseRoutes from './warehouse.routes.js';
import productRoutes from './product.routes.js';
import receiptRoutes from './receipt.routes.js';

const router = Router();

router.use("/suppliers", supplierRoutes);
router.use("/departments", departmentRoutes);
router.use("/warehouses", warehouseRoutes);
router.use("/products", productRoutes);
router.use("/receipts", receiptRoutes);

export default router;
