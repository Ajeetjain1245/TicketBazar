import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './context/authStore';
import useSocketStore from './context/socketStore';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// Pages
import HomeNew from './pages/HomeNew';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TicketDetails from './pages/TicketDetails';
import BrowseTickets from './pages/BrowseTickets';
import Checkout from './pages/Checkout';
import VerifyEmail from './pages/VerifyEmail';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import MyOrders from './pages/dashboard/MyOrders';
import OrderDetails from './pages/dashboard/OrderDetails';
import MyTickets from './pages/dashboard/MyTickets';
import CreateTicket from './pages/dashboard/CreateTicket';
import EditTicket from './pages/dashboard/EditTicket';
import Profile from './pages/dashboard/Profile';
import Messages from './pages/dashboard/Messages';
import SellerOrders from './pages/dashboard/SellerOrders';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTickets from './pages/admin/AdminTickets';
import AdminOrders from './pages/admin/AdminOrders';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import AdminRoute from './components/AdminRoute';
import SellerRoute from './components/SellerRoute';
import LoadingScreen from './components/LoadingScreen';
import CustomCursor from './components/CustomCursor';
import InteractiveBackground from './components/InteractiveBackground';

function App() {
  const { isAuthenticated, fetchUser, isInitialized } = useAuthStore();
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    // Fetch user on app load
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    // Wait for auth initialization before connecting socket
    if (!isInitialized) return;

    // Connect socket when authenticated
    if (isAuthenticated) {
      console.log('[App] Auth initialized & authenticated. Connecting socket...');
      connect();
    } else {
      console.log('[App] Not authenticated. Ensuring socket is disconnected.');
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isInitialized, isAuthenticated, connect, disconnect]);

  return (
    <>
      <InteractiveBackground />
      <CustomCursor />
      <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomeNew />} />
        <Route path="/tickets" element={<BrowseTickets />} />
        <Route path="/tickets/:id" element={<TicketDetails />} />
      </Route>

      {/* Auth Routes - Only for guests */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/checkout/:orderId" element={<Checkout />} />
      </Route>

      {/* Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/orders" element={<MyOrders />} />
          <Route path="/dashboard/orders/:id" element={<OrderDetails />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/messages" element={<Messages />} />
          <Route path="/dashboard/messages/:conversationId" element={<Messages />} />
          
          {/* Seller Routes */}
          <Route element={<SellerRoute />}>
            <Route path="/dashboard/tickets" element={<MyTickets />} />
            <Route path="/dashboard/tickets/create" element={<CreateTicket />} />
            <Route path="/dashboard/tickets/edit/:id" element={<EditTicket />} />
            <Route path="/dashboard/sales" element={<SellerOrders />} />
          </Route>
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/tickets" element={<AdminTickets />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Route>
      </Route>

      {/* 404 Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
