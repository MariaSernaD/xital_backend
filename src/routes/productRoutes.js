import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.get('/products', getProducts );
router.get('/products/:id', getProductById);
router.post('/products/', authMiddleware, createProduct );
router.put('/products/:id', authMiddleware, updateProduct);
router.delete('/products/:id', authMiddleware, deleteProduct);

export default router;
