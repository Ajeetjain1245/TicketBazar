import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllTickets,
  verifyTicket,
  flagTicket,
  getAllOrders,
  resolveDispute,
  processRefund,
} from '../controllers/adminController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, authorizeAdmin);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard stats
 * @access  Private (Admin)
 */
router.get('/dashboard', getDashboardStats);

/**
 * User Management Routes
 */

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get('/users', getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin)
 */
router.get('/users/:id', getUserById);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.put('/users/:id', updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete('/users/:id', deleteUser);

/**
 * Ticket Management Routes
 */

/**
 * @route   GET /api/admin/tickets
 * @desc    Get all tickets
 * @access  Private (Admin)
 */
router.get('/tickets', getAllTickets);

/**
 * @route   PUT /api/admin/tickets/:id/verify
 * @desc    Verify ticket
 * @access  Private (Admin)
 */
router.put('/tickets/:id/verify', verifyTicket);

/**
 * @route   PUT /api/admin/tickets/:id/flag
 * @desc    Flag ticket
 * @access  Private (Admin)
 */
router.put('/tickets/:id/flag', flagTicket);

/**
 * Order Management Routes
 */

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders
 * @access  Private (Admin)
 */
router.get('/orders', getAllOrders);

/**
 * @route   PUT /api/admin/orders/:id/resolve-dispute
 * @desc    Resolve dispute
 * @access  Private (Admin)
 */
router.put('/orders/:id/resolve-dispute', resolveDispute);

/**
 * @route   POST /api/admin/orders/:id/refund
 * @desc    Process refund
 * @access  Private (Admin)
 */
router.post('/orders/:id/refund', processRefund);

export default router;
