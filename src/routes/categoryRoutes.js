import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getProductCategories,
  getProductCategoryById,
  createCategory,
  updatedCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get('/category', getProductCategories);
router.get('/category/:id', getProductCategoryById);
router.post('/category', authMiddleware, createCategory);
router.put('/category/:id', authMiddleware, updatedCategory);
router.delete('/category/:id', authMiddleware, deleteCategory);


export default router;
