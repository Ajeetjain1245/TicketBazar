import mongoose from 'mongoose';

/**
 * Notification Schema
 * Represents system notifications for users
 */
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'order_placed',
        'order_confirmed',
        'order_completed',
        'order_cancelled',
        'payment_received',
        'payment_refunded',
        'ticket_sold',
        'ticket_verified',
        'ticket_rejected',
        'new_message',
        'dispute_opened',
        'dispute_resolved',
        'escrow_released',
        'system',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // Related entities
    relatedTicket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Link for navigation
    actionUrl: {
      type: String,
      default: '',
    },
    // Read status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    // For in-app notifications
    isInApp: {
      type: Boolean,
      default: true,
    },
    // For push/email notifications
    sentViaPush: {
      type: Boolean,
      default: false,
    },
    sentViaEmail: {
      type: Boolean,
      default: false,
    },
    // Priority
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    // Expiry
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

/**
 * Mark as read
 */
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
};

/**
 * Static method to create notification
 */
notificationSchema.statics.createNotification = async function (notificationData) {
  const notification = new this(notificationData);
  await notification.save();
  return notification;
};

/**
 * Get unread count for user
 */
notificationSchema.statics.getUnreadCount = async function (userId) {
  return await this.countDocuments({ recipient: userId, isRead: false });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
