import express from 'express';
import authRoutes from '../routes/authRoutes.js';
import productRoutes from '../routes/productRoutes.js';
import categoryRoutes from '../routes/categoryRoutes.js';
import wishlistRoutes from '../routes/wishlistRoutes.js';
import userRoutes from '../routes/userRoutes.js';
import addressRoutes from '../routes/addressRoutes.js';
import paymentMethodRoutes from '../routes/paymentMethodRoutes.js';
import orderRoutes from '../routes/orderRoutes.js';

const router = express.Router();
router.use("/auth", authRoutes);
router.use(productRoutes);
router.use(categoryRoutes);
router.use(paymentMethodRoutes);
router.use(wishlistRoutes);
router.use(userRoutes);
router.use(addressRoutes);
router.use(orderRoutes);


export default router;