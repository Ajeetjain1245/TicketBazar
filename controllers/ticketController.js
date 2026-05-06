import { Ticket, User, Notification } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { emitToAll, emitToUser } from '../socket/index.js';
import cloudinary from '../config/cloudinary.js';
import { body, validationResult } from 'express-validator';

/**
 * Validation rules for creating a ticket
 */
export const createTicketValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('type').isIn(['train', 'bus', 'event', 'movie', 'flight', 'concert', 'sports', 'other']).withMessage('Invalid ticket type'),
  body('category').isIn(['travel', 'entertainment', 'sports', 'other']).withMessage('Invalid category'),
  body('originalPrice').isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('resalePrice').isFloat({ min: 0 }).withMessage('Resale price must be a positive number'),
  body('eventDate').isISO8601().withMessage('Valid event date is required').custom(value => {
    const eventDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) {
      throw new Error('Event date must be in the future');
    }
    return true;
  }),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

/**
 * @desc    Create a new ticket listing
 * @route   POST /api/tickets
 * @access  Private (Seller/Admin)
 */
export const createTicket = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const {
    title,
    description,
    type,
    category,
    originalPrice,
    resalePrice,
    eventDate,
    eventTime,
    venue,
    fromLocation,
    toLocation,
    seatNumber,
    seatClass,
    quantity,
    terms,
    transferable,
    refundable,
  } = req.body;

  // Validate images
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one ticket proof image is required',
    });
  }

  // Upload images to Cloudinary (with error guarding)
  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'ticket-bazar/tickets',
              resource_type: 'image',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });

        images.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        // Continue without this image if upload fails
      }
    }
  }

  // Create ticket
  const ticket = await Ticket.create({
    title,
    description,
    type,
    category,
    originalPrice: parseFloat(originalPrice) || 0,
    resalePrice: parseFloat(resalePrice) || 0,
    eventDate: new Date(eventDate),
    eventTime: eventTime || '',
    venue: venue || '',
    fromLocation: fromLocation || '',
    toLocation: toLocation || '',
    seatNumber: seatNumber || '',
    seatClass: seatClass || '',
    quantity: parseInt(quantity) || 1,
    terms: terms || '',
    transferable: transferable !== 'false',
    refundable: refundable === 'true',
    images,
    seller: req.user._id,
    sellerName: req.user.name,
    verificationStatus: 'pending',
  });

  // Create notification for admin (with error guarding)
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await Notification.create({
        recipient: admin._id,
        type: 'system',
        title: 'New Ticket Listing',
        message: `A new ticket "${title}" has been listed for verification.`,
        relatedTicket: ticket._id,
      });
    }
  } catch (notifError) {
    console.error('Failed to create admin notification:', notifError);
  }

  res.status(201).json({
    success: true,
    message: 'Ticket created successfully and is pending verification',
    data: { ticket },
  });
});

/**
 * @desc    Get all tickets with filters
 * @route   GET /api/tickets
 * @access  Public
 */
export const getTickets = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    type,
    category,
    minPrice,
    maxPrice,
    location,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status = 'available',
  } = req.query;

  // Build filter object
  const filter = {
    status,
    verificationStatus: 'approved',
  };

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.resalePrice = {};
    if (minPrice) filter.resalePrice.$gte = parseFloat(minPrice);
    if (maxPrice) filter.resalePrice.$lte = parseFloat(maxPrice);
  }
  if (location) {
    filter.$or = [
      { venue: { $regex: location, $options: 'i' } },
      { fromLocation: { $regex: location, $options: 'i' } },
      { toLocation: { $regex: location, $options: 'i' } },
    ];
  }
  if (search) {
    filter.$text = { $search: search };
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const tickets = await Ticket.find(filter)
    .populate('seller', 'name rating avatar')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Ticket.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/**
 * @desc    Get single ticket by ID
 * @route   GET /api/tickets/:id
 * @access  Public
 */
export const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('seller', 'name rating avatar totalSales createdAt');

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  // Increment views
  await ticket.incrementViews();

  res.status(200).json({
    success: true,
    data: { ticket },
  });
});

/**
 * @desc    Update ticket
 * @route   PUT /api/tickets/:id
 * @access  Private (Owner/Admin)
 */
export const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  // Check ownership
  if (ticket.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to update this ticket', 403);
  }

  // Cannot update if already sold
  if (ticket.status === 'sold') {
    throw new AppError('Cannot update a sold ticket', 400);
  }

  const updates = { ...req.body };

  // Handle new images if uploaded
  if (req.files && req.files.length > 0) {
    // Delete old images from Cloudinary
    for (const img of ticket.images) {
      await cloudinary.uploader.destroy(img.publicId);
    }

    // Upload new images
    const images = [];
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'ticket-bazar/tickets' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });

      images.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }
    updates.images = images;
  }

  // Reset verification if price or key details changed
  if (updates.resalePrice && updates.resalePrice !== ticket.resalePrice) {
    updates.verificationStatus = 'pending';
  }

  const updatedTicket = await Ticket.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Ticket updated successfully',
    data: { ticket: updatedTicket },
  });
});

/**
 * @desc    Delete ticket
 * @route   DELETE /api/tickets/:id
 * @access  Private (Owner/Admin)
 */
export const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  // Check ownership
  if (ticket.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to delete this ticket', 403);
  }

  // Cannot delete if already sold
  if (ticket.status === 'sold') {
    throw new AppError('Cannot delete a sold ticket', 400);
  }

  // Delete images from Cloudinary
  for (const img of ticket.images) {
    await cloudinary.uploader.destroy(img.publicId);
  }

  await ticket.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Ticket deleted successfully',
  });
});

/**
 * @desc    Get seller's tickets
 * @route   GET /api/tickets/my-tickets
 * @access  Private (Seller)
 */
export const getMyTickets = asyncHandler(async (req, res) => {
  const { status, verificationStatus } = req.query;

  const filter = { seller: req.user._id };
  if (status) filter.status = status;
  if (verificationStatus) filter.verificationStatus = verificationStatus;

  const tickets = await Ticket.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { tickets },
  });
});

/**
 * @desc    Verify ticket (Admin only)
 * @route   PUT /api/tickets/:id/verify
 * @access  Private (Admin)
 */
export const verifyTicket = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Status must be approved or rejected', 400);
  }

  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  ticket.verificationStatus = status;
  ticket.verifiedBy = req.user._id;
  ticket.verificationNotes = notes || '';

  if (status === 'approved') {
    ticket.isFlagged = false;
    ticket.flagReason = '';
  }

  await ticket.save();

  // Notify seller
  await Notification.create({
    recipient: ticket.seller,
    type: status === 'approved' ? 'ticket_verified' : 'ticket_rejected',
    title: status === 'approved' ? 'Ticket Verified' : 'Ticket Rejected',
    message: `Your ticket "${ticket.title}" has been ${status}.${notes ? ` Note: ${notes}` : ''}`,
    relatedTicket: ticket._id,
  });

  // Real-time broadcast for approved listings
  if (status === 'approved') {
    emitToAll('new_listing', {
      id: ticket._id,
      title: ticket.title,
      type: ticket.type,
      resalePrice: ticket.resalePrice,
      venue: ticket.venue,
      image: ticket.images?.[0]
    });
  }

  // Real-time notification for the seller
  emitToUser(ticket.seller.toString(), 'notification', {
    type: status === 'approved' ? 'ticket_verified' : 'ticket_rejected',
    title: status === 'approved' ? 'Ticket Verified' : 'Ticket Rejected',
    message: `Your ticket "${ticket.title}" has been ${status}.`,
    relatedTicket: ticket._id,
  });

  res.status(200).json({
    success: true,
    message: `Ticket ${status} successfully`,
    data: { ticket },
  });
});

/**
 * @desc    Get ticket types and categories
 * @route   GET /api/tickets/types
 * @access  Public
 */
export const getTicketTypes = asyncHandler(async (req, res) => {
  const types = [
    { value: 'train', label: 'Train', category: 'travel' },
    { value: 'bus', label: 'Bus', category: 'travel' },
    { value: 'flight', label: 'Flight', category: 'travel' },
    { value: 'event', label: 'Event', category: 'entertainment' },
    { value: 'movie', label: 'Movie', category: 'entertainment' },
    { value: 'concert', label: 'Concert', category: 'entertainment' },
    { value: 'sports', label: 'Sports', category: 'sports' },
    { value: 'other', label: 'Other', category: 'other' },
  ];

  res.status(200).json({
    success: true,
    data: { types },
  });
});

export default {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getMyTickets,
  verifyTicket,
  getTicketTypes,
  createTicketValidation,
};
