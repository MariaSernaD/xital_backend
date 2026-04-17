import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "../controllers/paymentMethodController.js";

const router = express.Router();
router.get('/payment-method', authMiddleware,  getPaymentMethods);
router.get('/payment-method/:id', authMiddleware, getPaymentMethodById);
router.post('/payment-method', authMiddleware, createPaymentMethod);
router.put('/payment-method',authMiddleware , updatePaymentMethod);
router.delete('/payment-method', authMiddleware, deletePaymentMethod);

export default router;