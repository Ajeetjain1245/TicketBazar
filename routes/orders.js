import express from 'express';
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getSellerOrders,
  getOrderById,
  updateTransferStatus,
  cancelOrder,
  openDispute,
  getAllOrders,
} from '../controllers/orderController.js';
import { authenticate, authorizeSeller, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/orders
 * @desc    Get all orders (Admin)
 * @access  Private (Admin)
 */
router.get('/', authenticate, authorizeAdmin, getAllOrders);

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', authenticate, createOrder);

/**
 * @route   POST /api/orders/verify-payment
 * @desc    Verify payment and confirm order
 * @access  Private
 */
router.post('/verify-payment', authenticate, verifyPayment);

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get user's orders (as buyer)
 * @access  Private
 */
router.get('/my-orders', authenticate, getMyOrders);

/**
 * @route   GET /api/orders/seller-orders
 * @desc    Get seller's orders
 * @access  Private (Seller)
 */
router.get('/seller-orders', authenticate, authorizeSeller, getSellerOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order by ID
 * @access  Private
 */
router.get('/:id', authenticate, getOrderById);

/**
 * @route   PUT /api/orders/:id/transfer
 * @desc    Update transfer status
 * @access  Private (Seller)
 */
router.put('/:id/transfer', authenticate, authorizeSeller, updateTransferStatus);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.put('/:id/cancel', authenticate, cancelOrder);

/**
 * @route   POST /api/orders/:id/dispute
 * @desc    Open dispute
 * @access  Private (Buyer)
 */
router.post('/:id/dispute', authenticate, openDispute);

export default router;
