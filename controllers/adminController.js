import { User, Ticket, Order, Notification } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Get counts
  const totalUsers = await User.countDocuments();
  const totalSellers = await User.countDocuments({ role: 'seller' });
  const totalTickets = await Ticket.countDocuments();
  const pendingTickets = await Ticket.countDocuments({ verificationStatus: 'pending' });
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ status: 'pending' });
  const disputedOrders = await Order.countDocuments({ status: 'disputed' });

  // Calculate revenue
  const completedOrders = await Order.find({ status: 'completed' });
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.platformFee, 0);
  const totalSales = completedOrders.reduce((sum, order) => sum + order.amount, 0);

  // Recent activity
  const recentUsers = await User.find()
    .select('name email role createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentOrders = await Order.find()
    .populate('ticket', 'title')
    .populate('buyer', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  const pendingVerifications = await Ticket.find({ verificationStatus: 'pending' })
    .populate('seller', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalSellers,
        totalTickets,
        pendingTickets,
        totalOrders,
        pendingOrders,
        disputedOrders,
        totalRevenue,
        totalSales,
      },
      recentActivity: {
        users: recentUsers,
        orders: recentOrders,
        pendingVerifications,
      },
    },
  });
});

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      users,
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
 * @desc    Get user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin)
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get user's tickets
  const tickets = await Ticket.find({ seller: user._id })
    .select('title status verificationStatus resalePrice createdAt');

  // Get user's orders
  const orders = await Order.find({
    $or: [{ buyer: user._id }, { seller: user._id }],
  })
    .populate('ticket', 'title')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      user,
      tickets,
      orders,
    },
  });
});

/**
 * @desc    Update user
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin)
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { role, isVerified } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (role) user.role = role;
  if (isVerified !== undefined) user.isVerified = isVerified;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: { user },
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent deleting self
  if (user._id.toString() === req.user._id.toString()) {
    throw new AppError('Cannot delete your own account', 400);
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

/**
 * @desc    Get all tickets (Admin)
 * @route   GET /api/admin/tickets
 * @access  Private (Admin)
 */
export const getAllTickets = asyncHandler(async (req, res) => {
  const { status, verificationStatus, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (verificationStatus) filter.verificationStatus = verificationStatus;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const tickets = await Ticket.find(filter)
    .populate('seller', 'name email')
    .populate('buyer', 'name email')
    .sort({ createdAt: -1 })
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
 * @desc    Verify ticket (Approve/Reject)
 * @route   PUT /api/admin/tickets/:id/verify
 * @access  Private (Admin)
 */
export const verifyTicket = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  if (!['approved', 'rejected', 'under_review'].includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  ticket.verificationStatus = status;
  ticket.verifiedBy = req.user._id;
  ticket.verificationNotes = notes || '';

  if (status === 'rejected') {
    ticket.isFlagged = true;
    ticket.flagReason = notes || 'Rejected by admin';
  }

  await ticket.save();

  // Notify seller
  await Notification.create({
    recipient: ticket.seller,
    type: status === 'approved' ? 'ticket_verified' : 'ticket_rejected',
    title: status === 'approved' ? 'Ticket Approved' : 'Ticket Rejected',
    message: `Your ticket "${ticket.title}" has been ${status}.${notes ? ` Note: ${notes}` : ''}`,
    relatedTicket: ticket._id,
  });

  res.status(200).json({
    success: true,
    message: `Ticket ${status} successfully`,
    data: { ticket },
  });
});

/**
 * @desc    Flag ticket as suspicious
 * @route   PUT /api/admin/tickets/:id/flag
 * @access  Private (Admin)
 */
export const flagTicket = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  ticket.isFlagged = true;
  ticket.flagReason = reason || 'Flagged by admin';
  await ticket.save();

  res.status(200).json({
    success: true,
    message: 'Ticket flagged successfully',
    data: { ticket },
  });
});

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/admin/orders
 * @access  Private (Admin)
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, dispute, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (dispute === 'true') filter['dispute.isDisputed'] = true;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const orders = await Order.find(filter)
    .populate('ticket', 'title images')
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      orders,
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
 * @desc    Resolve dispute
 * @route   PUT /api/admin/orders/:id/resolve-dispute
 * @access  Private (Admin)
 */
export const resolveDispute = asyncHandler(async (req, res) => {
  const { resolution, notes } = req.body;

  if (!['buyer_favor', 'seller_favor', 'split', 'refunded'].includes(resolution)) {
    throw new AppError('Invalid resolution', 400);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (!order.dispute.isDisputed) {
    throw new AppError('No active dispute for this order', 400);
  }

  await order.resolveDispute(resolution, req.user._id);

  // Notify parties
  await Notification.create({
    recipient: order.buyer,
    type: 'dispute_resolved',
    title: 'Dispute Resolved',
    message: `The dispute for order #${order.orderNumber} has been resolved in ${resolution.replace('_', ' ')}.${notes ? ` Note: ${notes}` : ''}`,
    relatedOrder: order._id,
  });

  await Notification.create({
    recipient: order.seller,
    type: 'dispute_resolved',
    title: 'Dispute Resolved',
    message: `The dispute for order #${order.orderNumber} has been resolved in ${resolution.replace('_', ' ')}.${notes ? ` Note: ${notes}` : ''}`,
    relatedOrder: order._id,
  });

  res.status(200).json({
    success: true,
    message: 'Dispute resolved successfully',
    data: { order },
  });
});

/**
 * @desc    Process refund
 * @route   POST /api/admin/orders/:id/refund
 * @access  Private (Admin)
 */
export const processRefund = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.status === 'refunded') {
    throw new AppError('Order already refunded', 400);
  }

  // In a real implementation, you would process the refund through Razorpay here
  // const refund = await razorpay.payments.refund(order.payment.razorpayPaymentId, {
  //   amount: (amount || order.amount) * 100,
  // });

  order.status = 'refunded';
  order.refundAmount = amount || order.amount;
  order.refundedAt = new Date();
  order.escrowStatus = 'refunded';
  order.adminNotes = reason || 'Refunded by admin';
  await order.save();

  // Release ticket back to available
  const ticket = await Ticket.findById(order.ticket);
  if (ticket) {
    ticket.status = 'available';
    ticket.buyer = null;
    ticket.soldAt = null;
    await ticket.save();
  }

  // Notify buyer
  await Notification.create({
    recipient: order.buyer,
    type: 'payment_refunded',
    title: 'Refund Processed',
    message: `A refund of ${order.refundAmount} has been processed for order #${order.orderNumber}`,
    relatedOrder: order._id,
  });

  res.status(200).json({
    success: true,
    message: 'Refund processed successfully',
    data: { order },
  });
});

export default {
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
};
