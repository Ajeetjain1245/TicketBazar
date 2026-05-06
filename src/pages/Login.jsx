import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Ticket } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, googleLogin, resendVerification, isLoading } = useAuthStore();
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    if (result.success) {
      navigate(from, { replace: true });
    } else if (result.status === 401 && result.error?.toLowerCase().includes('verify')) {
      setResendEmail(formData.email);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    const result = await resendVerification(resendEmail);
    if (result.success) {
      setResendEmail('');
    }
    setIsResending(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl mb-6 shadow-lg shadow-indigo-500/5">
          <Ticket className="h-10 w-10 text-indigo-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100 font-display">Welcome Back</h1>
        <p className="text-slate-400 mt-2 font-medium">Access your premium ticket marketplace</p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="label text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input pl-10 bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="label text-slate-300 mb-0">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input pl-10 pr-10 bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? (
              <span className="spinner" />
            ) : (
              'Sign In'
            )}
          </button>

          {/* Google Auth Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
            </div>
          </div>

          {/* Google Login Component */}
          <div className="flex justify-center mt-6">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                const result = await googleLogin(credentialResponse.credential);
                if (result.success) navigate(from, { replace: true });
              }}
              onError={() => {
                toast.error('Google Sign-In failed. Please ensure your browser permits popups and the origin is authorized.');
              }}
              theme="filled_black"
              shape="pill"
            />
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Demo Credentials */}
      <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-xl">
        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Demo Access:</p>
        <div className="space-y-2">
          <p className="text-sm text-slate-300 flex justify-between">
            <span className="text-slate-500">Admin:</span>
            <span className="font-mono">admin@ticketbazar.com <span className="text-slate-600">/</span> admin123</span>
          </p>
          <p className="text-sm text-slate-300 flex justify-between">
            <span className="text-slate-500">Buyer:</span>
            <span className="font-mono">buyer@ticketbazar.com <span className="text-slate-600">/</span> Buy@Ticket2024</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
