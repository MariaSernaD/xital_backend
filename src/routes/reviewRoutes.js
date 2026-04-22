import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {getReviews, getReviewsByProduct, createReview, updateReview, deleteReview} from '../controllers/reviewController.js';

const router = express.Router();

router.get('/reviews', authMiddleware, getReviews );
router.get('/reviews/product/:productId', authMiddleware, getReviewsByProduct);
router.post('/reviews', authMiddleware, createReview);
router.put('/reviews/:id', authMiddleware, updateReview);
router.delete('/reviews/:id', authMiddleware, deleteReview);

export default router;