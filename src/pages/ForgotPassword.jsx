import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast('Password reset temporarily unavailable.', { icon: 'ℹ️' });
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
};

export default ForgotPassword;
