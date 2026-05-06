import mongoose from 'mongoose';

/**
 * Conversation Schema
 * Represents a chat conversation between two users about a specific ticket
 */
const conversationSchema = new mongoose.Schema(
  {
    // Participants
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    // Related ticket (optional - for ticket-specific conversations)
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      default: null,
    },
    ticketInfo: {
      title: String,
      image: String,
      price: Number,
    },
    // Last message summary for quick preview in lists
    lastMessage: {
      content: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      sentAt: {
        type: Date,
        default: Date.now,
      },
    },
    // Conversation metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Unread counts per participant
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    // Typing indicators
    typingUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        startedAt: Date,
      },
    ],
    // Conversation type
    type: {
      type: String,
      enum: ['direct', 'ticket_inquiry', 'support'],
      default: 'direct',
    },
    // For support conversations
    supportTicketId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
conversationSchema.index({ participants: 1 });
conversationSchema.index({ ticket: 1 });
conversationSchema.index({ 'lastMessage.sentAt': -1 });
conversationSchema.index({ updatedAt: -1 });

/**
 * Mark messages as read for a user
 */
conversationSchema.methods.markAsRead = async function (userId) {
  this.unreadCount.set(userId.toString(), 0);
  await this.save();
  return true;
};

/**
 * Get unread count for a specific user
 */
conversationSchema.methods.getUnreadCount = function (userId) {
  return this.unreadCount.get(userId.toString()) || 0;
};

/**
 * Set typing status for a user
 */
conversationSchema.methods.setTyping = async function (userId, isTyping) {
  if (isTyping) {
    this.typingUsers = this.typingUsers.filter(
      (t) => t.user.toString() !== userId.toString()
    );
    this.typingUsers.push({
      user: userId,
      startedAt: new Date(),
    });
  } else {
    this.typingUsers = this.typingUsers.filter(
      (t) => t.user.toString() !== userId.toString()
    );
  }
  await this.save();
};

/**
 * Static method to find or create conversation between two users
 */
conversationSchema.statics.findOrCreate = async function (
  participantIds,
  ticketId = null,
  ticketInfo = null
) {
  // Sort participant IDs to ensure consistent lookup
  const sortedParticipants = [...participantIds].sort();

  let query = {
    participants: { $all: sortedParticipants, $size: sortedParticipants.length },
  };

  if (ticketId) {
    query.ticket = ticketId;
  }

  let conversation = await this.findOne(query);

  if (!conversation) {
    conversation = new this({
      participants: sortedParticipants,
      ticket: ticketId,
      ticketInfo: ticketInfo,
      type: ticketId ? 'ticket_inquiry' : 'direct',
    });
    // Initialize unread counts
    sortedParticipants.forEach(id => {
      conversation.unreadCount.set(id.toString(), 0);
    });
    await conversation.save();
  }

  return conversation;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
