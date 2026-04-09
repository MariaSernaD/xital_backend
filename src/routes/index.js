import express from 'express';
import productRoutes from '../routes/productRoutes.js';
import categoryRoutes from '../routes/categoryRoutes.js';
import wishlistRoutes from '../routes/wishlistRoutes.js';

const router = express.Router();

router.use(productRoutes);
router.use(categoryRoutes);
router.use(wishlistRoutes);

export default router;