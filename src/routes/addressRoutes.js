import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getUserAddresses,
  getUserAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController.js";

const router = express.Router();

router.get("/address", authMiddleware, getUserAddresses);
router.get("/address/:addressId", authMiddleware, getUserAddressById);
router.post("/address", authMiddleware, createAddress);
router.put("/address/:addressId", authMiddleware, updateAddress);
router.delete("/address/:addressId", authMiddleware, deleteAddress);

export default router;
