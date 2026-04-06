import express from "express";
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
router.post('/category', createCategory);
router.put('/category/:id', updatedCategory);
router.delete('/category/:id', deleteCategory);


export default router;
