import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {getReviews, getReviewByUser, createReview, updateReview, deleteReview} from '../controllers/reviewController.js';

const router = express.Router();

router.get('/reviews', authMiddleware, getReviews );
router.get('/reviews/:id', authMiddleware, getReviewByUser);
router.post('/reviews', authMiddleware, createReview);
router.put('/reviews/:id', authMiddleware, updateReview);
router.delete('/reviews/:id', authMiddleware, deleteReview);

export default router;