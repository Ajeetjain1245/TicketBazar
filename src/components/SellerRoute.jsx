import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import LoadingScreen from './LoadingScreen';

const SellerRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'seller' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default SellerRoute;
