import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Ticket, MessageSquare, Heart } from 'lucide-react';
import useAuthStore from '../../context/authStore';
import { ordersAPI, ticketsAPI, chatAPI } from '../../utils/api';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    orders: 0,
    messages: 0,
    tickets: 0,
    sales: 0
  });

  const [loading, setLoading] = useState(true);
  const isSeller = user?.role === 'seller' || user?.role === 'admin';

  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [ordersRes, ticketsRes, chatRes] = await Promise.all([
          ordersAPI.getMyOrders(),
          isSeller ? ticketsAPI.getMyTickets() : Promise.resolve({ data: { data: { tickets: [] } } }),
          chatAPI.getUnreadCount()
        ]);

        if (isMounted) {
          setStats({
            orders: ordersRes.data.data.orders?.length || 0,
            messages: chatRes.data.data.unreadCount || 0,
            tickets: ticketsRes.data.data.tickets?.length || 0,
            sales: isSeller ? ordersRes.data.data.orders?.filter(o => o.status === 'completed').length : 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    return () => { isMounted = false; };
  }, [user?._id, isSeller]);

  const statCards = [
    { name: 'My Orders', value: stats.orders.toString(), icon: ShoppingBag, href: '/dashboard/orders', color: 'bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20' },
    { name: 'Messages', value: stats.messages.toString(), icon: MessageSquare, href: '/dashboard/messages', color: 'bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20' },
    ...(isSeller ? [
      { name: 'My Tickets', value: stats.tickets.toString(), icon: Ticket, href: '/dashboard/tickets', color: 'bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20' },
      { name: 'Sales', value: stats.sales.toString(), icon: Heart, href: '/dashboard/sales', color: 'bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20' },
    ] : []),
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2 font-display text-slate-100">Dashboard</h1>
      <p className="mb-8 text-slate-400">Welcome back, {user?.name}!</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="p-6 rounded-2xl border border-slate-700 hover:border-indigo-500/20 transition-all bg-slate-800/30 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{stat.name}</p>
                <p className="text-2xl font-bold mt-1 font-display text-slate-100">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center transition-all duration-300`}>
                <stat.icon className="h-6 w-6 text-slate-950" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="p-6 rounded-2xl border border-slate-700 bg-slate-800/30 backdrop-blur-xl">
        <h2 className="text-lg font-semibold mb-4 font-display text-slate-100">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/tickets" className="font-bold text-sm sm:text-base px-6 py-3 rounded-full hover:scale-105 transition-transform shadow-lg font-display bg-indigo-500 text-slate-950">
            Browse Tickets
          </Link>
          {isSeller && (
            <Link to="/dashboard/tickets/create" className="font-bold text-sm sm:text-base px-6 py-3 rounded-full hover:scale-105 transition-transform shadow-lg font-display bg-indigo-500 text-slate-950">
              List Ticket
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
