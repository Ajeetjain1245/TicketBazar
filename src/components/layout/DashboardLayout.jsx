import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  ShoppingBag,
  MessageSquare,
  User,
  Menu,
  X,
  LogOut,
  PlusCircle,
  Store,
  ChevronRight,
} from 'lucide-react';
import useAuthStore from '../../context/authStore';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isSeller = user?.role === 'seller' || user?.role === 'admin';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  const sellerNavigation = [
    { name: 'My Tickets', href: '/dashboard/tickets', icon: Ticket },
    { name: 'List Ticket', href: '/dashboard/tickets/create', icon: PlusCircle },
    { name: 'Sales', href: '/dashboard/sales', icon: Store },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-700">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-400 p-2 rounded-lg">
              <Ticket className="h-5 w-5 text-slate-950" />
            </div>
            <span className="text-lg font-bold font-display text-slate-100">TICKET<span className="text-indigo-500">BAZAR</span></span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">
            General
          </p>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-indigo-500/10 text-indigo-500' 
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}

          {isSeller && (
            <>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider mt-6 mb-2 text-slate-400">
                Seller
              </p>
              {sellerNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-indigo-500/10 text-indigo-500'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider mt-6 mb-2 text-slate-400">
                Administration
              </p>
              {[
                { name: 'Admin Hub', href: '/admin', icon: LayoutDashboard },
                { name: 'Tickets', href: '/admin/tickets', icon: Ticket },
                { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
                { name: 'Users', href: '/admin/users', icon: User },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-indigo-500/10 text-indigo-500'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/30">
              <User className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100">{user?.name}</p>
              <p className="text-xs capitalize text-slate-400">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors text-rose-500 bg-rose-500/10 hover:bg-rose-500/20"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/95" onClick={() => setIsSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 border-r border-slate-700 shadow-xl bg-slate-950">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-400 p-2 rounded-lg">
                  <Ticket className="h-5 w-5 text-slate-950" />
                </div>
                <span className="text-lg font-bold font-display text-slate-100">TICKET<span className="text-indigo-500">BAZAR</span></span>
              </Link>
              <button onClick={() => setIsSidebarOpen(false)}>
                <X className="h-6 w-6 text-slate-300" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive(item.href)
                      ? 'bg-indigo-500/10 text-indigo-500'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              {isSeller && sellerNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive(item.href)
                      ? 'bg-indigo-500/10 text-indigo-500'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden border-b border-slate-700 px-4 py-3 flex items-center justify-between bg-slate-950">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-slate-300" />
          </button>
          <span className="text-lg font-bold font-display text-slate-100">Dashboard</span>
          <div className="w-6" />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
