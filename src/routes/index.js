import express from 'express';
import productRoutes from '../routes/productRoutes.js';
import categoryRoutes from '../routes/categoryRoutes.js';

const router = express.Router();

router.use(productRoutes);
router.use(categoryRoutes);

export default router;