import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: localStorage.getItem('token') || null,
      isAuthenticated: !!localStorage.getItem('token'), // Derived initial state
      isLoading: false,
      isInitialized: false, // Track if first auth check done
      error: null,

      // Actions
      signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.signup(userData);
          set({ isLoading: false });
          // Note: Signup no longer sets user/token/isAuthenticated
          // It now just returns success for the "Email Sent" UI
          return { success: true, message: response.data.message };
        } catch (error) {
          const message = error.response?.data?.message || 'Signup failed';
          const status = error.response?.status;
          set({ isLoading: false, error: message });
          // toast.error(message); // Let the component handle local error display if needed
          return { success: false, error: message, status };
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const { user, token } = response.data.data;
          
          localStorage.setItem('token', token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.success('Welcome back!');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          const status = error.response?.status;
          set({ isLoading: false, error: message });
          toast.error(message);
          return { success: false, error: message, status };
        }
      },

      googleLogin: async (credential) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.googleLogin({ credential });
          const { user, token } = response.data.data;
          
          localStorage.setItem('token', token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.success('Welcome via Google!');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Google login failed';
          set({ isLoading: false, error: message });
          toast.error(message);
          return { success: false, error: message };
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        toast.success('Logged out successfully');
      },

      fetchUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isInitialized: true });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await authAPI.getMe();
          const { user } = response.data.data;
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
        } catch (error) {
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          });
          // Show toast if session expired (only once if not on login)
          if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            toast.error('Session expired. Please login again.');
          }
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.updateProfile(data);
          const { user } = response.data.data;
          set({
            user,
            isLoading: false,
          });
          toast.success('Profile updated successfully');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Update failed';
          set({ isLoading: false });
          toast.error(message);
          return { success: false, error: message };
        }
      },

      updatePassword: async (data) => {
        set({ isLoading: true });
        try {
          await authAPI.updatePassword(data);
          set({ isLoading: false });
          toast.success('Password updated successfully');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Password update failed';
          set({ isLoading: false });
          toast.error(message);
          return { success: false, error: message };
        }
      },

      becomeSeller: async () => {
        set({ isLoading: true });
        try {
          const response = await authAPI.becomeSeller();
          const { user } = response.data.data;
          set({
            user,
            isLoading: false,
          });
          toast.success('You are now a seller!');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to become seller';
          set({ isLoading: false });
          toast.error(message);
          return { success: false, error: message };
        }
      },

      resendVerification: async (email) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.resendVerification({ email });
          set({ isLoading: false });
          toast.success(response.data.message || 'Verification email resent!');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to resend email';
          set({ isLoading: false });
          toast.error(message);
          return { success: false, error: message };
        }
      },

      verifyEmail: async (token) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.verifyEmail(token);
          set({ isLoading: false });
          toast.success(response.data.message || 'Email verified successfully!');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Verification failed';
          set({ isLoading: false });
          // error interceptor handles toast
          return { success: false, error: message };
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token
        // isAuthenticated is NOT persisted now, it's checked on load
      }),
    }
  )
);

export default useAuthStore;
