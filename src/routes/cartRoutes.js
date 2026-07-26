import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdminMiddleware from "../middlewares/isAdminMiddleware.js"
import {getCarts, getUserCart,addProductToCart , updateProductFromCart, deleteProductFromCart, clearCart} from "../controllers/cartController.js";

const router = express.Router();

router.get('/cart', authMiddleware, isAdminMiddleware, getCarts);
router.get('/cart/user/', authMiddleware, getUserCart);
router.post('/cart/product', authMiddleware, addProductToCart);
router.put('/cart/product', authMiddleware, updateProductFromCart);
router.delete('/cart/product/:productId', authMiddleware, deleteProductFromCart);
router.delete('/cart/clear', authMiddleware, clearCart);



export default router;