import express from 'express';
import authRoutes from '../routes/authRoutes.js';
import productRoutes from '../routes/productRoutes.js';
import categoryRoutes from '../routes/categoryRoutes.js';
import wishlistRoutes from '../routes/wishlistRoutes.js';
import userRoutes from '../routes/userRoutes.js';
import addressRoutes from '../routes/addressRoutes.js';

const router = express.Router();
router.use("/auth", authRoutes);
router.use(productRoutes);
router.use(categoryRoutes);
router.use(wishlistRoutes);
router.use(userRoutes);
router.use(addressRoutes);


export default router;