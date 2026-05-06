import mongoose from 'mongoose';

/**
 * Ticket Schema
 * Represents a ticket listing in the marketplace
 * Can be for train, bus, events, movies, etc.
 */
const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a ticket title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Please specify ticket type'],
      enum: ['bus', 'event', 'movie', 'flight', 'concert', 'sports', 'other'],
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: ['travel', 'entertainment', 'sports', 'other'],
    },
    // Pricing
    originalPrice: {
      type: Number,
      required: [true, 'Please provide original price'],
      min: [0, 'Price cannot be negative'],
    },
    resalePrice: {
      type: Number,
      required: [true, 'Please provide resale price'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP'],
    },
    // Event/Travel Details
    eventName: {
      type: String,
      default: '',
    },
    eventDate: {
      type: Date,
      required: [true, 'Please provide event/travel date'],
    },
    eventTime: {
      type: String,
      default: '',
    },
    venue: {
      type: String,
      default: '',
    },
    fromLocation: {
      type: String,
      default: '',
    },
    toLocation: {
      type: String,
      default: '',
    },
    // Seat/Class Information
    seatNumber: {
      type: String,
      default: '',
    },
    seatClass: {
      type: String,
      default: '',
      enum: ['', 'economy', 'business', 'first', 'general', 'vip', 'premium'],
    },
    // Images and Documents
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],
    ticketProof: {
      url: String,
      publicId: String,
      documentType: {
        type: String,
        enum: ['image', 'pdf'],
      },
    },
    // Seller Information
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerName: {
      type: String,
      required: true,
    },
    // Status and Verification
    status: {
      type: String,
      enum: ['available', 'sold', 'reserved', 'expired', 'cancelled'],
      default: 'available',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'under_review'],
      default: 'pending',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    // Fraud Detection
    fraudScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      default: '',
    },
    // Additional Details
    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    terms: {
      type: String,
      default: '',
    },
    transferable: {
      type: Boolean,
      default: true,
    },
    refundable: {
      type: Boolean,
      default: false,
    },
    // Buyer Information (when sold)
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    soldAt: {
      type: Date,
    },
    soldPrice: {
      type: Number,
    },
    // Views and Engagement
    views: {
      type: Number,
      default: 0,
    },
    wishlistCount: {
      type: Number,
      default: 0,
    },
    // Expiry
    listingExpiresAt: {
      type: Date,
      default: function () {
        // Default expiry: 30 days from creation or event date, whichever is earlier
        const thirtyDays = new Date();
        thirtyDays.setDate(thirtyDays.getDate() + 30);
        return this.eventDate < thirtyDays ? this.eventDate : thirtyDays;
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Index for search functionality
 * Enables efficient text search on title, description, and venue
 */
ticketSchema.index({ title: 'text', description: 'text', venue: 'text', fromLocation: 'text', toLocation: 'text' });

/**
 * Index for filtering
 * Common filter combinations for better query performance
 */
ticketSchema.index({ type: 1, status: 1, verificationStatus: 1 });
ticketSchema.index({ seller: 1, status: 1 });
ticketSchema.index({ eventDate: 1 });
ticketSchema.index({ resalePrice: 1 });

/**
 * Mark ticket as sold
 * Updates status and records sale information
 */
ticketSchema.methods.markAsSold = async function (buyerId, soldPrice) {
  this.status = 'sold';
  this.buyer = buyerId;
  this.soldAt = new Date();
  this.soldPrice = soldPrice;
  await this.save();
};

/**
 * Increment view count
 * Tracks ticket popularity
 */
ticketSchema.methods.incrementViews = async function () {
  this.views += 1;
  await this.save();
};

/**
 * Check if ticket is expired
 * Returns true if event date has passed or listing has expired
 */
ticketSchema.methods.isExpired = function () {
  const now = new Date();
  return this.eventDate < now || this.listingExpiresAt < now;
};

/**
 * Calculate discount percentage
 * Shows savings compared to original price
 */
ticketSchema.methods.getDiscountPercentage = function () {
  if (this.originalPrice === 0) return 0;
  const discount = ((this.originalPrice - this.resalePrice) / this.originalPrice) * 100;
  return Math.round(discount);
};

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
