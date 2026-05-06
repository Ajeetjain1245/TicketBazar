import mongoose from 'mongoose';

/**
 * Order Schema
 * Represents a purchase transaction between buyer and seller
 * Implements escrow payment system
 */
const orderSchema = new mongoose.Schema(
  {
    // Order identification
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    // Parties involved
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Ticket information
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    // Quantity of tickets purchased
    quantity: {
      type: Number,
      default: 1,
      min: [1, 'Quantity must be at least 1'],
    },
    // Pricing
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    sellerAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    // Payment information
    payment: {
      razorpayOrderId: {
        type: String,
        required: true,
      },
      razorpayPaymentId: {
        type: String,
        default: null,
      },
      razorpaySignature: {
        type: String,
        default: null,
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
      paidAt: {
        type: Date,
      },
    },
    // Escrow system
    escrowStatus: {
      type: String,
      enum: ['pending', 'held', 'released', 'refunded', 'disputed'],
      default: 'pending',
    },
    escrowReleasedAt: {
      type: Date,
    },
    // Order status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'disputed', 'refunded'],
      default: 'pending',
    },
    // Ticket transfer status
    transferStatus: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending',
    },
    transferDetails: {
      transferredAt: Date,
      transferMethod: String,
      transferProof: String,
      notes: String,
    },
    // Delivery information
    deliveryMethod: {
      type: String,
      enum: ['digital', 'physical', 'meetup'],
      default: 'digital',
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    // Timestamps for order lifecycle
    confirmedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    // Cancellation/Refund
    cancellationReason: {
      type: String,
      default: '',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundedAt: {
      type: Date,
    },
    // Dispute handling
    dispute: {
      isDisputed: {
        type: Boolean,
        default: false,
      },
      disputedAt: {
        type: Date,
      },
      reason: {
        type: String,
        default: '',
      },
      description: {
        type: String,
        default: '',
      },
      evidence: [
        {
          url: String,
          description: String,
        },
      ],
      resolvedAt: {
        type: Date,
      },
      resolution: {
        type: String,
        enum: ['', 'buyer_favor', 'seller_favor', 'split', 'refunded'],
        default: '',
      },
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    // Ratings and Reviews
    buyerReview: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      createdAt: Date,
    },
    sellerReview: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      createdAt: Date,
    },
    // Notes
    buyerNotes: {
      type: String,
      default: '',
    },
    sellerNotes: {
      type: String,
      default: '',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Index for efficient querying
 */
orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ seller: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'payment.razorpayOrderId': 1 });

/**
 * Generate unique order number
 * Format: TB-YYYYMMDD-XXXXX
 */
orderSchema.statics.generateOrderNumber = async function () {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const count = await this.countDocuments({
    createdAt: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
    },
  });
  const random = Math.floor(10000 + Math.random() * 90000);
  return `TB-${dateStr}-${random}`;
};

/**
 * Confirm payment and hold in escrow
 */
orderSchema.methods.confirmPayment = async function (paymentDetails) {
  this.payment.razorpayPaymentId = paymentDetails.razorpayPaymentId;
  this.payment.razorpaySignature = paymentDetails.razorpaySignature;
  this.payment.status = 'completed';
  this.payment.paidAt = new Date();
  this.escrowStatus = 'held';
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  await this.save();
};

/**
 * Complete order and release escrow
 */
orderSchema.methods.completeOrder = async function () {
  this.status = 'completed';
  this.escrowStatus = 'released';
  this.transferStatus = 'completed';
  this.completedAt = new Date();
  this.escrowReleasedAt = new Date();
  await this.save();
};

/**
 * Cancel order
 */
orderSchema.methods.cancelOrder = async function (reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  await this.save();
};

/**
 * Initiate dispute
 */
orderSchema.methods.initiateDispute = async function (disputeDetails) {
  this.dispute.isDisputed = true;
  this.dispute.disputedAt = new Date();
  this.dispute.reason = disputeDetails.reason;
  this.dispute.description = disputeDetails.description;
  this.status = 'disputed';
  this.escrowStatus = 'disputed';
  await this.save();
};

/**
 * Resolve dispute
 */
orderSchema.methods.resolveDispute = async function (resolution, adminId) {
  this.dispute.resolvedAt = new Date();
  this.dispute.resolution = resolution;
  this.dispute.resolvedBy = adminId;

  if (resolution === 'refunded' || resolution === 'buyer_favor') {
    this.status = 'refunded';
    this.escrowStatus = 'refunded';
    this.refundAmount = this.amount;
    this.refundedAt = new Date();
  } else {
    this.escrowStatus = 'released';
  }

  await this.save();
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
