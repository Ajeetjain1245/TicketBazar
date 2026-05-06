import authRoutes from './auth.js';
import ticketRoutes from './tickets.js';
import orderRoutes from './orders.js';
import chatRoutes from './chat.js';
import adminRoutes from './admin.js';
import notificationRoutes from './notifications.js';
import reviewRoutes from './reviews.js';

/**
 * Export all route modules
 * Used in server.js to register routes
 */
export {
  authRoutes,
  ticketRoutes,
  orderRoutes,
  chatRoutes,
  adminRoutes,
  notificationRoutes,
  reviewRoutes,
};

export default {
  authRoutes,
  ticketRoutes,
  orderRoutes,
  chatRoutes,
  adminRoutes,
  notificationRoutes,
  reviewRoutes,
};
