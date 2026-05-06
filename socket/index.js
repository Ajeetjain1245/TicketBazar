import jwt from 'jsonwebtoken';
import { User, Conversation, Message } from '../models/index.js';
import { maskSensitiveInfo } from '../utils/privacyFilter.js';

/**
 * Socket.io connection handler
 * Manages real-time connections, authentication, and events
 */
export const initializeSocket = (io) => {
  // Store connected users (userId -> Set of socketIds mapping)
  // This allows multiple tabs/devices per user
  const connectedUsers = new Map();

  // Middleware for Authentication
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('SOCKET_AUTH_NO_TOKEN'));
      }

      // Handle Bearer prefix if present
      const strippedToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

      try {
        // Verify token
        const decoded = jwt.verify(strippedToken, process.env.JWT_SECRET);
        console.log(`[Socket] Auth Success: User ${decoded.id} connected`);
        
        // Get user from database
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          console.error(`[Socket] Auth Failed: User ${decoded.id} not found in DB`);
          return next(new Error('SOCKET_USER_NOT_FOUND'));
        }

        // Attach user to socket
        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (err) {
        console.error(`[Socket] JWT Verification Failed: ${err.message}`);
        return next(new Error('SOCKET_AUTH_INVALID_TOKEN'));
      }
    } catch (err) {
      console.error('Socket Auth Middleware Error:', err.message);
      next(new Error('SOCKET_AUTH_INTERNAL_ERROR'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${socket.user.name} (${socket.id})`);

    // Add to connected users map
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId).add(socket.id);

    // Join user's personal room for direct events/notifications
    socket.join(`user:${userId}`);

    // Broadcast online status
    socket.broadcast.emit('user_online', { userId });

    /**
     * Join conversation room
     */
    socket.on('join_conversation', async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.some(p => p.toString() === userId)) {
          return socket.emit('error', { message: 'Conversation not found or access denied' });
        }

        // Join the specific room
        const roomName = `conversation:${conversationId}`;
        socket.join(roomName);
        socket.currentConversation = conversationId;

        console.log(`Socket ${socket.id} joined room: ${roomName}`);
        
        // Mark as read in DB via controller logic (or directly here if preferred)
        await conversation.markAsRead(userId);
        
        // Notify others that user is reading
        socket.to(roomName).emit('messages_read', {
          conversationId,
          readBy: userId,
        });

      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join chat room' });
      }
    });

    /**
     * Leave conversation room
     */
    socket.on('leave_conversation', (conversationId) => {
      const roomName = `conversation:${conversationId}`;
      socket.leave(roomName);
      socket.currentConversation = null;
    });

    /**
     * Typing indicators
     */
    socket.on('typing', (data) => {
      if (!socket.currentConversation) return;
      socket.to(`conversation:${socket.currentConversation}`).emit('user_typing', {
        userId,
        name: socket.user.name,
        isTyping: data.isTyping,
      });
    });

    /**
     * Send Message (Alternative to REST API for high-speed chat)
     */
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, messageType = 'text' } = data;
        
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.some(p => p.toString() === userId)) {
          return socket.emit('error', { message: 'Conversation not found' });
        }

        const filteredContent = maskSensitiveInfo(content);

        // CREATE MESSAGE
        const message = await Message.create({
          conversationId,
          sender: userId,
          senderName: socket.user.name,
          content: filteredContent,
          messageType
        });

        // UPDATE CONVERSATION
        conversation.lastMessage = {
          content: filteredContent,
          sender: userId,
          sentAt: new Date()
        };

        // Increment unread for all other participants
        conversation.participants.forEach(pId => {
          if (pId.toString() !== userId) {
            const count = conversation.unreadCount.get(pId.toString()) || 0;
            conversation.unreadCount.set(pId.toString(), count + 1);
          }
        });
        await conversation.save();

        // BROADCAST
        const roomName = `conversation:${conversationId}`;
        io.to(roomName).emit('new_message', {
          conversationId,
          message
        });

        // NOTIFY OFFLINE/OUT-OF-ROOM USERS
        conversation.participants.forEach(pId => {
          const pIdStr = pId.toString();
          if (pIdStr !== userId) {
            // Check if user is in this specific room in ANY tab
            // For simplicity, we can emit to their personal room
            io.to(`user:${pIdStr}`).emit('notification', {
              type: 'new_message',
              title: `New message from ${socket.user.name}`,
              message: filteredContent,
              conversationId
            });
          }
        });

      } catch (error) {
        console.error('Socket send_message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Handle Disconnection
     */
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      if (connectedUsers.has(userId)) {
        connectedUsers.get(userId).delete(socket.id);
        if (connectedUsers.get(userId).size === 0) {
          connectedUsers.delete(userId);
          // Only broadcast offline if ALL tabs closed
          socket.broadcast.emit('user_offline', { userId });
        }
      }
    });
  });

  // Global reference for helper functions
  global.connectedUsers = connectedUsers;
  global.io = io;

  return io;
};

export const emitToUser = (userId, event, data) => {
  if (global.io) {
    global.io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToAll = (event, data) => {
  if (global.io) {
    global.io.emit(event, data);
  }
};

export default {
  initializeSocket,
  emitToUser,
  emitToAll,
};
