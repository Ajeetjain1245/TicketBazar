import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Ticket, User, LogOut, MessageSquare, Bell } from 'lucide-react';
import useAuthStore from '../../context/authStore';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Browse Tickets', href: '/tickets' },
  ];

  return (
    <nav className="nav-glass animate-slide-down-nav">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-indigo-500 p-2.5 rounded-2xl group-hover:shadow-lg group-hover:shadow-indigo-500/40 transition-all transform group-hover:scale-105 duration-500">
              <Ticket className="h-6 w-6 text-slate-950" />
            </div>
            <span className="text-2xl font-display font-black text-slate-100 uppercase tracking-tighter">
              Ticket<span className="text-indigo-500">Bazar</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-slate-400 hover:text-slate-100 font-medium transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard/messages"
                  className="p-2 text-slate-400 hover:text-slate-100 transition-colors relative"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-slate-400 hover:text-slate-100 transition-colors"
                >
                  <div className="w-9 h-9 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/30">
                    <User className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-400 hover:text-slate-100 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary px-6"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-100"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-slate-400 hover:text-slate-100 font-medium px-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-slate-400 hover:text-slate-100 font-medium px-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="text-left text-rose-400 font-medium px-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-slate-400 hover:text-slate-100 font-medium px-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary mx-2 text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
