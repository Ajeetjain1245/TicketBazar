import express from 'express';
import { createReview, getSellerReviews } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createReview);
router.get('/seller/:sellerId', getSellerReviews);

export default router;
