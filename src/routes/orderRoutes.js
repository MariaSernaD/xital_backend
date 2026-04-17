import express from "express";
import authMiddleware from '../middlewares/authMiddleware.js';
import {getOrders, getOrderById, createOrder, updateOrder} from '../controllers/orderController.js';

const router = express.Router();

router.get('/orders', authMiddleware,  getOrders);
router.get('/orders/:id', authMiddleware, getOrderById);
router.post('/orders', authMiddleware, createOrder);
router.put('/orders/:id', authMiddleware, updateOrder);

export default router;