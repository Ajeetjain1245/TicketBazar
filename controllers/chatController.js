import mongoose from 'mongoose';
import { Conversation, Message, User, Ticket } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import cloudinary from '../config/cloudinary.js';

import { maskSensitiveInfo } from '../utils/privacyFilter.js';

/**
 * @desc    Get or create conversation
 * @route   POST /api/chat/conversations
 * @access  Private
 */
export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { participantId, ticketId, ticketInfo } = req.body;

  const participant = await User.findById(participantId);
  if (!participant) {
    throw new AppError('Participant not found', 404);
  }

  if (participantId === req.user._id.toString()) {
    throw new AppError('Cannot start conversation with yourself', 400);
  }

  const participantIds = [req.user._id.toString(), participantId];

  const conversation = await Conversation.findOrCreate(
    participantIds,
    ticketId || null,
    ticketInfo || null
  );

  res.status(200).json({
    success: true,
    data: { conversation },
  });
});

/**
 * @desc    Get user's conversations
 * @route   GET /api/chat/conversations
 * @access  Private
 */
export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
    isActive: true,
  })
    .populate('participants', 'name avatar')
    .populate('ticket', 'title images resalePrice')
    .sort({ 'lastMessage.sentAt': -1 });

  const conversationsWithUnread = conversations.map((conv) => ({
    ...conv.toObject(),
    unreadCount: conv.getUnreadCount(req.user._id),
  }));

  res.status(200).json({
    success: true,
    data: { conversations: conversationsWithUnread },
  });
});

/**
 * @desc    Get messages for a conversation
 * @route   GET /api/chat/conversations/:id/messages
 * @access  Private
 */
export const getMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * limit;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid conversation ID', 400);
  }

  console.log(`[ChatController] Fetching messages for: ${req.params.id} (User: ${req.user._id})`);
  
  const conversation = await Conversation.findById(req.params.id);
  
  if (!conversation) {
    console.error(`[ChatController] Conversation NOT FOUND in DB: ${req.params.id}`);
    throw new AppError('Conversation not found', 404);
  }

  const userId = req.user._id.toString();
  const isParticipant = conversation.participants.some(p => p.toString() === userId);
  
  if (!isParticipant) {
    console.error(`[ChatController] Access Denied: User ${userId} not in participants of ${req.params.id}`);
    throw new AppError('Access denied', 403);
  }

  const messages = await Message.find({ conversationId: req.params.id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Reverse to get chronological order for the client
  res.status(200).json({
    success: true,
    data: { messages: messages.reverse() },
  });
});

/**
 * @desc    Send message
 * @route   POST /api/chat/conversations/:id/messages
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { content, messageType = 'text', replyTo } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid conversation ID', 400);
  }

  const conversation = await Conversation.findById(req.params.id);
  
  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  const isParticipant = conversation.participants.some(p => p.toString() === req.user._id.toString());
  if (!isParticipant) {
    throw new AppError('Access denied', 403);
  }

  if (conversation.isBlocked) {
    throw new AppError('Conversation is blocked', 403);
  }

  let fileUrl = null;
  let fileName = null;

  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'ticket-bazar/chat', resource_type: 'auto' },
        (error, result) => { if (error) reject(error); else resolve(result); }
      );
      uploadStream.end(req.file.buffer);
    });
    fileUrl = result.secure_url;
    fileName = req.file.originalname;
  }

  // Apply Privacy Masking
  const filteredContent = maskSensitiveInfo(content);

  // Create Message
  const message = await Message.create({
    conversationId: conversation._id,
    sender: req.user._id,
    senderName: req.user.name,
    content: filteredContent || '',
    messageType: req.file ? 'file' : messageType,
    fileUrl,
    fileName,
    replyTo: replyTo || null,
  });

  // Update Conversation Metadata
  conversation.lastMessage = {
    content: filteredContent,
    sender: req.user._id,
    sentAt: new Date(),
  };

  // Increment unread counts for all OTHERS
  conversation.participants.forEach(pId => {
    const pIdStr = pId.toString();
    if (pIdStr !== req.user._id.toString()) {
      const count = conversation.unreadCount.get(pIdStr) || 0;
      conversation.unreadCount.set(pIdStr, count + 1);
    }
  });

  await conversation.save();

  res.status(201).json({
    success: true,
    data: { message },
  });
});

/**
 * @desc    Mark conversation as read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const conversation = await Conversation.findById(req.params.id);
  
  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  const isParticipant = conversation.participants.some(p => p.toString() === userId);
  if (!isParticipant) {
    throw new AppError('Access denied: You are not a participant in this conversation', 403);
  }

  await conversation.markAsRead(req.user._id);
  
  // Also update individual Message records to isRead: true
  await Message.updateMany(
    { conversationId: conversation._id, sender: { $ne: req.user._id }, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  res.status(200).json({
    success: true,
    message: 'Conversation marked as read',
  });
});

/**
 * @desc    Get unread message count
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
    isActive: true,
  });

  const totalUnread = conversations.reduce((sum, conv) => {
    return sum + (conv.getUnreadCount(req.user._id) || 0);
  }, 0);

  res.status(200).json({
    success: true,
    data: { unreadCount: totalUnread },
  });
});

/**
 * @desc    Archive conversation
 */
export const archiveConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const conversation = await Conversation.findById(req.params.id);
  
  if (!conversation || !conversation.participants.some(p => p.toString() === userId)) {
    throw new AppError('Conversation not found or access denied', 403);
  }
  await conversation.archive();
  res.status(200).json({ success: true, message: 'Conversation archived' });
});

/**
 * @desc    Block conversation
 */
export const blockConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const conversation = await Conversation.findById(req.params.id);
  
  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  const isParticipant = conversation.participants.some(p => p.toString() === userId);
  if (!isParticipant) {
    throw new AppError('Access denied', 403);
  }

  await conversation.block(userId);
  res.status(200).json({ success: true, message: 'Conversation blocked' });
});

/**
 * @desc    Unblock conversation
 */
export const unblockConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const conversation = await Conversation.findById(req.params.id);
  
  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  const isParticipant = conversation.participants.some(p => p.toString() === userId);
  if (!isParticipant) {
    throw new AppError('Access denied', 403);
  }

  await conversation.unblock();
  res.status(200).json({ success: true, message: 'Conversation unblocked' });
});

export default {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  archiveConversation,
  blockConversation,
  unblockConversation,
};
