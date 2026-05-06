import { Outlet, Navigate } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../context/authStore';

const AuthLayout = () => {
  const { isAuthenticated } = useAuthStore();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="container-custom py-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-lg">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-100">Ticket<span className="text-indigo-400">Bazar</span></span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6">
        <div className="container-custom text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Ticket Bazar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
