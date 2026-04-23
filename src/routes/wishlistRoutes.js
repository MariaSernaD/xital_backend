import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getWishlists,
  getUserWishlist,
  createWishlist,
  addProductToWishlist,
  removeProductFromWishlist,
  deleteWishlist} from '../controllers/wishlistController.js';

  const router = express.Router();

  router.get('/wishlist', authMiddleware, getWishlists);
  router.get('/wishlist/:id', authMiddleware, getUserWishlist);
  router.post('/wishlist', authMiddleware, createWishlist);
  router.put('/wishlist/product', authMiddleware, addProductToWishlist);
  router.delete('/wishlist/:id/product', authMiddleware, removeProductFromWishlist);
  router.delete('/wishlist/:id', authMiddleware, deleteWishlist);

  export default router;