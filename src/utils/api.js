import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    // Handle specific error codes
    if (error.response?.status === 401) {
      // Token expired or invalid - don't redirect hard, let the store/route guard handle it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
        // Only show toast if we aren't already trying to login/signup
        // The store's fetchUser will also catch this and update the state
        toast.error('Session expired. Please login again.');
      }
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (data) => api.post('/auth/google', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  updatePassword: (data) => api.put('/auth/password', data),
  becomeSeller: () => api.post('/auth/become-seller'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
  verifyEmail: (token) => api.post(`/auth/verify-email/${token}`),
  resendVerification: (data) => api.post('/auth/resend-verification', data),
};

// Tickets API
export const ticketsAPI = {
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'images') {
        data.images.forEach((image) => formData.append('images', image));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/tickets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'images' && data[key]) {
        data[key].forEach((image) => formData.append('images', image));
      } else if (data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/tickets/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/tickets/${id}`),
  getMyTickets: () => api.get('/tickets/my-tickets'),
  getTypes: () => api.get('/tickets/types'),
  verify: (id, data) => api.put(`/tickets/${id}/verify`, data),
};

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  verifyPayment: (data) => api.post('/orders/verify-payment', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getSellerOrders: () => api.get('/orders/seller-orders'),
  updateTransfer: (id, data) => api.put(`/orders/${id}/transfer`, data),
  cancel: (id, data) => api.put(`/orders/${id}/cancel`, data),
  openDispute: (id, data) => api.post(`/orders/${id}/dispute`, data),
};

// Chat API
export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (id, page = 1) => api.get(`/chat/conversations/${id}/messages`, { params: { page } }),
  createConversation: (data) => api.post('/chat/conversations', data),
  sendMessage: (id, data) => {
    const formData = new FormData();
    if (data.content) formData.append('content', data.content);
    if (data.attachment) formData.append('attachment', data.attachment);
    if (data.replyTo) formData.append('replyTo', data.replyTo);
    return api.post(`/chat/conversations/${id}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  markAsRead: (id) => api.put(`/chat/conversations/${id}/read`),
  getUnreadCount: () => api.get('/chat/unread-count'),
  archive: (id) => api.put(`/chat/conversations/${id}/archive`),
  block: (id) => api.put(`/chat/conversations/${id}/block`),
  unblock: (id) => api.put(`/chat/conversations/${id}/unblock`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getTickets: (params) => api.get('/admin/tickets', { params }),
  verifyTicket: (id, data) => api.put(`/admin/tickets/${id}/verify`, data),
  flagTicket: (id, data) => api.put(`/admin/tickets/${id}/flag`, data),
  getOrders: (params) => api.get('/admin/orders', { params }),
  resolveDispute: (id, data) => api.put(`/admin/orders/${id}/resolve-dispute`, data),
  processRefund: (id, data) => api.post(`/admin/orders/${id}/refund`, data),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Reviews API
export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  getSellerReviews: (sellerId) => api.get(`/reviews/seller/${sellerId}`),
};

export default api;
