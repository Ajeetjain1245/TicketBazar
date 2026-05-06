import Review from '../models/Review.js';
import { Order } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * @desc    Create a new review
 * @route   POST /api/reviews
 * @access  Private (Buyer)
 */
export const createReview = asyncHandler(async (req, res) => {
  const { ticketId, sellerId, rating, comment } = req.body;
  const buyerId = req.user._id;

  // Verify that the user actually bought the ticket from the seller
  const order = await Order.findOne({
    ticket: ticketId,
    buyer: buyerId,
    seller: sellerId,
    status: 'completed'
  });

  if (!order) {
    throw new AppError('You can only review sellers after a successful purchase', 403);
  }

  // Check if review already exists
  const existingReview = await Review.findOne({ ticketId, buyerId });
  if (existingReview) {
    throw new AppError('You have already reviewed this ticket purchase', 400);
  }

  const review = await Review.create({
    sellerId,
    buyerId,
    ticketId,
    rating,
    comment
  });

  res.status(201).json({
    success: true,
    data: review
  });
});

/**
 * @desc    Get all reviews for a specific seller
 * @route   GET /api/reviews/seller/:sellerId
 * @access  Public
 */
export const getSellerReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ sellerId: req.params.sellerId })
    .populate('buyerId', 'name avatar')
    .populate('ticketId', 'title')
    .sort('-createdAt');

  // Calculate average rating
  const stats = await Review.aggregate([
    { $match: { sellerId: req.params.sellerId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
    stats: stats.length > 0 ? stats[0] : { avgRating: 0, numReviews: 0 }
  });
});

export default {
  createReview,
  getSellerReviews,
};
