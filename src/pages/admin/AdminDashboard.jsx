import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { 
  Users, 
  Ticket, 
  ShoppingBag, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getDashboard();
        setStats(response.data.data.stats);
        setRecentActivity(response.data.data.recentActivity);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-32 bg-slate-900/50 rounded-3xl"></div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-900/50 rounded-2xl"></div>)}
    </div>
  </div>;

  const statCards = [
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString()}`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Pending Verifications', value: stats?.pendingTickets, icon: AlertCircle, color: 'text-indigo-400', bg: 'bg-indigo-400/10', href: '/admin/tickets?verificationStatus=pending' },
    { label: 'Total Orders', value: stats?.totalOrders, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 font-display">System Overview</h1>
        <p className="text-slate-400">Welcome back, Administrator. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="group p-6 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-indigo-500/30 transition-all backdrop-blur-xl">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              {card.href && (
                <Link to={card.href} className="text-slate-500 hover:text-indigo-400 transition-colors">
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              )}
            </div>
            <div className="text-2xl font-bold text-slate-100 mb-1">{card.value}</div>
            <div className="text-sm text-slate-500 font-medium">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Verifications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Pending Verifications
            </h2>
            <Link to="/admin/tickets?verificationStatus=pending" className="text-sm text-indigo-500 hover:text-indigo-400 font-semibold">
              View All
            </Link>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">
            {recentActivity?.pendingVerifications?.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {recentActivity.pendingVerifications.map((ticket) => (
                  <div key={ticket._id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-indigo-500 font-bold border border-slate-700">
                        {ticket.title[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200">{ticket.title}</div>
                        <div className="text-xs text-slate-500">by {ticket.seller?.name} • {new Date(ticket.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <Link 
                      to="/admin/tickets" 
                      className="px-4 py-2 bg-indigo-500 text-slate-950 text-sm font-bold rounded-xl hover:bg-indigo-400 transition-colors"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>All clear! No pending verifications.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats / Recent Users */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            New Users
          </h2>
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
            <div className="space-y-6">
              {recentActivity?.users?.map((user) => (
                <div key={user._id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 text-sm font-bold border border-slate-700 uppercase">
                    {user.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-200 truncate">{user.name}</div>
                    <div className="text-xs text-slate-500 truncate capitalize">{user.role}</div>
                  </div>
                  <div className="text-[10px] text-slate-600 font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            <Link to="/admin/users" className="mt-6 block w-full py-3 text-center text-sm font-semibold text-slate-400 border border-slate-800 rounded-2xl hover:bg-slate-800 hover:text-slate-200 transition-all">
              Manage All Users
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
