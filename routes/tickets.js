import express from 'express';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getMyTickets,
  verifyTicket,
  getTicketTypes,
  createTicketValidation,
} from '../controllers/ticketController.js';
import { authenticate, authorizeSeller, authorizeAdmin } from '../middleware/auth.js';
import { uploadTicketImages } from '../middleware/upload.js';

const router = express.Router();

/**
 * @route   GET /api/tickets/types
 * @desc    Get ticket types and categories
 * @access  Public
 */
router.get('/types', getTicketTypes);

/**
 * @route   GET /api/tickets/my-tickets
 * @desc    Get seller's tickets
 * @access  Private (Seller)
 */
router.get('/my-tickets', authenticate, authorizeSeller, getMyTickets);

/**
 * @route   GET /api/tickets
 * @desc    Get all tickets with filters
 * @access  Public
 */
router.get('/', getTickets);

/**
 * @route   POST /api/tickets
 * @desc    Create a new ticket listing
 * @access  Private (Seller)
 */
router.post(
  '/',
  authenticate,
  authorizeSeller,
  uploadTicketImages.array('images', 5),
  createTicketValidation,
  createTicket
);

/**
 * @route   GET /api/tickets/:id
 * @desc    Get single ticket by ID
 * @access  Public
 */
router.get('/:id', getTicketById);

/**
 * @route   PUT /api/tickets/:id
 * @desc    Update ticket
 * @access  Private (Owner/Admin)
 */
router.put(
  '/:id',
  authenticate,
  uploadTicketImages.array('images', 5),
  updateTicket
);

/**
 * @route   DELETE /api/tickets/:id
 * @desc    Delete ticket
 * @access  Private (Owner/Admin)
 */
router.delete('/:id', authenticate, deleteTicket);

/**
 * @route   PUT /api/tickets/:id/verify
 * @desc    Verify ticket (Admin only)
 * @access  Private (Admin)
 */
router.put('/:id/verify', authenticate, authorizeAdmin, verifyTicket);

export default router;
