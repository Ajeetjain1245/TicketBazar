import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight, Mail } from 'lucide-react';
import useAuthStore from '../context/authStore';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuthStore();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleVerify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      const result = await verifyEmail(token);
      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Email verified successfully!');
      } else {
        setStatus('error');
        setMessage(result.error || 'Verification failed. The link may be expired or invalid.');
      }
    };

    handleVerify();
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      
      <div className="relative container mx-auto px-4 flex justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl text-center">
            
            {status === 'verifying' && (
              <div className="space-y-6 py-8">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-indigo-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">Verifying Email</h1>
                  <p className="text-slate-400">Please wait while we confirm your email address...</p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-6 py-4">
                <div className="flex justify-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center"
                  >
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                  </motion.div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
                  <p className="text-slate-400">{message}</p>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-indigo-500/25"
                >
                  Go to Login
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-6 py-4">
                <div className="flex justify-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center"
                  >
                    <XCircle className="w-12 h-12 text-red-500" />
                  </motion.div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
                  <p className="text-slate-400 line-clamp-3">{message}</p>
                </div>
                <div className="space-y-3">
                  <Link
                    to="/signup"
                    className="block w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Try Signing Up Again
                  </Link>
                  <Link
                    to="/login"
                    className="block text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmail;
