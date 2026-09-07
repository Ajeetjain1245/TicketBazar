import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Ticket, Loader2 } from 'lucide-react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setIsSubmitted(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      // Backend returns appropriate message or error
      const message = error.response?.data?.message || 'Failed to send reset link';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl mb-6 shadow-lg shadow-indigo-500/5">
          <Ticket className="h-10 w-10 text-indigo-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100 font-display">Reset Password</h1>
        <p className="text-slate-400 mt-2 font-medium">
          {isSubmitted
            ? 'Check your inbox for reset instructions'
            : 'Enter your email to receive a password recovery link'}
        </p>
      </div>

      <div className="card p-8">
        {isSubmitted ? (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Check Your Email</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                We sent a password reset link to <span className="text-indigo-400 font-medium">{email}</span>. Click the link in the email to set a new password.
              </p>
            </div>
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
              >
                Didn't receive email? Try another address
              </button>
              <div>
                <Link
                  to="/login"
                  className="btn-secondary w-full inline-flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Login
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="label text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-11"
                  placeholder="Enter your registered email"
                  disabled={isLoading}
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
