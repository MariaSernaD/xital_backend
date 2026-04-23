import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from '../middlewares/isAdminMiddleware.js';
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
router.post('/category', authMiddleware, isAdmin, createCategory);
router.put('/category/:id', authMiddleware, isAdmin, updatedCategory);
router.delete('/category/:id', authMiddleware, isAdmin, deleteCategory);


export default router;
