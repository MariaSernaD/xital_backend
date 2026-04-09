import express from 'express';
import { getWishlists,
  getUserWishlist,
  createWishlist,
  addProductToWishlist,
  removeProductFromWishlist,
  deleteWishlist} from '../controllers/wishlistController.js';

  const router = express.Router();

  router.get('/wishlist', getWishlists);
  router.get('/wishlist/:id', getUserWishlist);
  router.post('wishlist', createWishlist);
  router.put('/wishlist/:id', addProductToWishlist);
  router.put('/wishlist/:id', removeProductFromWishlist);
  router.delete('wishlist/:id', deleteWishlist);

  export default router;