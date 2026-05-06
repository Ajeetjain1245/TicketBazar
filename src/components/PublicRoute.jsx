import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import LoadingScreen from './LoadingScreen';

const PublicRoute = () => {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
