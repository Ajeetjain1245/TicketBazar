import { Order, Ticket, User, Notification } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { emitToUser } from '../socket/index.js';
import Razorpay from 'razorpay';
import { sendOrderConfirmationEmail } from '../utils/sendEmail.js';

// Initialize Razorpay (only if credentials are available)
let razorpay = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && 
      process.env.RAZORPAY_KEY_ID !== 'rzp_test_key' && 
      !process.env.RAZORPAY_KEY_ID.includes('your_')) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (error) {
  console.warn('Razorpay initialization failed:', error.message);
}

/**
 * @desc    Create a new order (initiate purchase)
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { ticketId, quantity: reqQty } = req.body;
  const quantity = parseInt(reqQty) || 1;

  // Get ticket details
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  // Check if ticket is available
  if (ticket.status !== 'available') {
    throw new AppError('Ticket is not available for purchase', 400);
  }

  // Check if ticket is verified
  if (ticket.verificationStatus !== 'approved') {
    throw new AppError('Ticket is pending verification', 400);
  }

  // Prevent buying own ticket
  if (ticket.seller.toString() === req.user._id.toString()) {
    throw new AppError('You cannot buy your own ticket', 400);
  }

  // Check if ticket is expired
  if (ticket.isExpired()) {
    throw new AppError('Ticket has expired', 400);
  }

  // Validate quantity
  if (quantity < 1) {
    throw new AppError('Quantity must be at least 1', 400);
  }
  if (quantity > ticket.quantity) {
    throw new AppError(`Only ${ticket.quantity} ticket(s) available`, 400);
  }

  // Calculate amounts based on quantity
  const subtotal = ticket.resalePrice * quantity;
  const platformFee = Math.round(subtotal * 0.05); // 5% platform fee
  const sellerAmount = subtotal - platformFee;

  // Generate order number
  const orderNumber = await Order.generateOrderNumber();

  let razorpayOrderId = null;

  // Create Razorpay order if available
  if (razorpay) {
    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(subtotal * 100), // Amount in paise strictly integer
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          ticketId: ticket._id.toString(),
          buyerId: req.user._id.toString(),
          sellerId: ticket.seller.toString(),
          quantity: quantity.toString(),
        },
      });
      razorpayOrderId = razorpayOrder.id;
    } catch (error) {
      console.error('Razorpay order creation failed:', error.statusCode, error.error || error.message);
    }
  }

  // Create order in database
  const order = await Order.create({
    orderNumber,
    buyer: req.user._id,
    seller: ticket.seller,
    ticket: ticket._id,
    quantity,
    amount: subtotal,
    platformFee,
    sellerAmount,
    payment: {
      razorpayOrderId: razorpayOrderId || `mock_order_${Date.now()}`,
      status: 'pending',
    },
    escrowStatus: 'pending',
    status: 'pending',
  });

  // Decrement ticket quantity
  ticket.quantity -= quantity;
  if (ticket.quantity <= 0) {
    ticket.status = 'reserved';
    ticket.quantity = 0;
  }
  await ticket.save();

  // Notify seller
  await Notification.create({
    recipient: ticket.seller,
    type: 'order_placed',
    title: 'New Order Received',
    message: `Someone wants to buy ${quantity}× "${ticket.title}". Order #${orderNumber}`,
    relatedOrder: order._id,
    relatedTicket: ticket._id,
    actionUrl: `/dashboard/orders/${order._id}`,
  });

  // Real-time notification for the seller
  emitToUser(ticket.seller.toString(), 'notification', {
    type: 'order_placed',
    title: 'New Order Received',
    message: `Someone wants to buy ${quantity}× "${ticket.title}".`,
    relatedOrder: order._id,
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: {
      order: {
        id: order._id,
        _id: order._id,
        orderNumber: order.orderNumber,
        amount: order.amount,
        quantity: order.quantity,
      },
      razorpay: razorpay && razorpayOrderId ? {
        orderId: razorpayOrderId,
        amount: order.amount * 100,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID,
      } : null,
    },
  });
});

/**
 * @desc    Verify payment and confirm order
 * @route   POST /api/orders/verify-payment
 * @access  Private
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = req.body;

  // Find order first
  const order = await Order.findOne({
    'payment.razorpayOrderId': razorpayOrderId,
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Verify signature only if Razorpay is configured
  if (razorpay && razorpayPaymentId && razorpaySignature) {
    const crypto = await import('crypto');
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw new AppError('Invalid payment signature', 400);
    }
  }

  // Update order status
  await order.confirmPayment({
    razorpayPaymentId: razorpayPaymentId || `mock_payment_${Date.now()}`,
    razorpaySignature: razorpaySignature || 'mock_signature',
  });

  // Update ticket status
  const ticket = await Ticket.findById(order.ticket);
  await ticket.markAsSold(order.buyer, order.amount);

  // Update user stats
  await User.findByIdAndUpdate(order.buyer, {
    $inc: { totalPurchases: 1 },
  });
  await User.findByIdAndUpdate(order.seller, {
    $inc: { totalSales: 1 },
  });

  // Notify both parties
  await Notification.create({
    recipient: order.buyer,
    type: 'payment_received',
    title: 'Payment Successful',
    message: `Your payment for order #${order.orderNumber} was successful.`,
    relatedOrder: order._id,
    actionUrl: `/dashboard/orders/${order._id}`,
  });

  await Notification.create({
    recipient: order.seller,
    type: 'payment_received',
    title: 'Payment Received',
    message: `Payment received for order #${order.orderNumber}. Please transfer the ticket.`,
    relatedOrder: order._id,
    actionUrl: `/dashboard/orders/${order._id}`,
  });

  // Real-time notifications
  emitToUser(order.buyer.toString(), 'notification', {
    type: 'payment_received',
    title: 'Payment Successful',
    message: `Your payment for order #${order.orderNumber} was successful.`,
    relatedOrder: order._id,
  });

  emitToUser(order.seller.toString(), 'notification', {
    type: 'payment_received',
    title: 'Payment Received',
    message: `Payment received for order #${order.orderNumber}.`,
    relatedOrder: order._id,
  });

  // Send Order Confirmation Email
  try {
    await sendOrderConfirmationEmail(req.user.email, {
      orderNumber: order.orderNumber,
      amount: order.amount,
      quantity: order.quantity,
      ticketTitle: ticket.title,
      _id: order._id,
    });
  } catch (error) {
    console.warn('Order confirmation email failed to send:', error.message);
  }

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    data: { order },
  });
});

/**
 * @desc    Get user's orders (as buyer)
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = { buyer: req.user._id };
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .populate('ticket', 'title images type eventDate eventTime venue resalePrice originalPrice sellerName quantity')
    .populate('seller', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { orders },
  });
});

/**
 * @desc    Get seller's orders
 * @route   GET /api/orders/seller-orders
 * @access  Private (Seller)
 */
export const getSellerOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = { seller: req.user._id };
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .populate('ticket', 'title images type eventDate')
    .populate('buyer', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { orders },
  });
});

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('ticket')
    .populate('buyer', 'name email phone')
    .populate('seller', 'name email phone');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check authorization
  if (
    order.buyer._id.toString() !== req.user._id.toString() &&
    order.seller._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw new AppError('Not authorized to view this order', 403);
  }

  res.status(200).json({
    success: true,
    data: { order },
  });
});

/**
 * @desc    Update transfer status
 * @route   PUT /api/orders/:id/transfer
 * @access  Private (Seller)
 */
export const updateTransferStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Only seller can update transfer
  if (order.seller.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  order.transferStatus = status;
  if (notes) order.transferDetails.notes = notes;

  if (status === 'completed') {
    order.transferDetails.transferredAt = new Date();
    order.transferDetails.transferMethod = req.body.transferMethod || 'digital';

    // Complete the order
    await order.completeOrder();

    // Notify buyer
    await Notification.create({
      recipient: order.buyer,
      type: 'order_completed',
      title: 'Ticket Transferred',
      message: `Your ticket for order #${order.orderNumber} has been transferred.`,
      relatedOrder: order._id,
    });
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Transfer status updated',
    data: { order },
  });
});

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check authorization
  if (
    order.buyer.toString() !== req.user._id.toString() &&
    order.seller.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw new AppError('Not authorized', 403);
  }

  // Can only cancel pending or confirmed orders
  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new AppError('Cannot cancel this order', 400);
  }

  await order.cancelOrder(reason);

  // Restore ticket quantity
  const ticket = await Ticket.findById(order.ticket);
  ticket.quantity += (order.quantity || 1);
  ticket.status = 'available';
  ticket.buyer = null;
  ticket.soldAt = null;
  await ticket.save();

  // Notify other party
  const notifyUserId =
    order.buyer.toString() === req.user._id.toString()
      ? order.seller
      : order.buyer;

  await Notification.create({
    recipient: notifyUserId,
    type: 'order_cancelled',
    title: 'Order Cancelled',
    message: `Order #${order.orderNumber} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
    relatedOrder: order._id,
  });

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order },
  });
});

/**
 * @desc    Open dispute
 * @route   POST /api/orders/:id/dispute
 * @access  Private
 */
export const openDispute = asyncHandler(async (req, res) => {
  const { reason, description } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Only buyer can open dispute
  if (order.buyer.toString() !== req.user._id.toString()) {
    throw new AppError('Only buyer can open a dispute', 403);
  }

  if (order.status !== 'confirmed') {
    throw new AppError('Can only dispute confirmed orders', 400);
  }

  await order.initiateDispute({ reason, description });

  // Notify admin (in a real app, notify all admins)
  const admin = await User.findOne({ role: 'admin' });
  if (admin) {
    await Notification.create({
      recipient: admin._id,
      type: 'dispute_opened',
      title: 'New Dispute',
      message: `A dispute has been opened for order #${order.orderNumber}`,
      relatedOrder: order._id,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Dispute opened successfully',
    data: { order },
  });
});

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders
 * @access  Private (Admin)
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const orders = await Order.find(filter)
    .populate('ticket', 'title')
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

export default {
  createOrder,
  verifyPayment,
  getMyOrders,
  getSellerOrders,
  getOrderById,
  updateTransferStatus,
  cancelOrder,
  openDispute,
  getAllOrders,
};
