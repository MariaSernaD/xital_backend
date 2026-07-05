import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from '../middlewares/isAdminMiddleware.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import {
  searchProducts,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.get('/products/search', searchProducts);
router.get('/products', getProducts );
router.get('/products/:id', validationMiddleware, getProductById);
router.post('/products/', authMiddleware, isAdmin, validationMiddleware, createProduct );
router.put('/products/:id', authMiddleware, isAdmin, validationMiddleware, updateProduct);
router.delete('/products/:id', authMiddleware, isAdmin, validationMiddleware, deleteProduct);

export default router;
