import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Calendar, CheckCircle, Clock, XCircle, AlertCircle, User, MessageSquare } from 'lucide-react';
import { ordersAPI } from '../../utils/api';
import { formatDate, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getSellerOrders();
      setOrders(response.data.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch seller orders:', error);
      toast.error('Failed to load sales data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTransfer = async (orderId, transferStatus) => {
    try {
      await ordersAPI.updateTransfer(orderId, { transferStatus });
      toast.success(`Transfer status updated to ${transferStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update transfer status');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      confirmed: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };
    return styles[status] || 'bg-slate-800 text-slate-500 border-slate-700';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100 font-display">Sales & Orders</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-2xl border border-slate-700" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100 font-display">Sales & Orders</h1>
        <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 uppercase tracking-widest">
          {orders.length} Total Sales
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-700 bg-slate-800/30 backdrop-blur-xl text-center">
          <ShoppingBag className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2 font-display">No sales yet</h3>
          <p className="text-slate-500">When someone buys your tickets, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <div key={order._id} className="p-6 rounded-2xl border border-slate-700 bg-slate-800/30 backdrop-blur-xl hover:border-indigo-500/30 transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Order Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-slate-500">#{order.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-100 mb-2 font-display">
                    {order.ticket?.title || 'Unknown Ticket'}
                  </h3>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <User className="h-4 w-4 text-indigo-400" />
                      <span>Buyer: <span className="text-slate-200">{order.buyer?.name || 'Guest'}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MessageSquare className="h-4 w-4 text-indigo-400" />
                      <Link to={`/dashboard/messages?conversation=${order.buyer?._id}`} className="text-indigo-400 hover:underline">
                        Chat with Buyer
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Pricing & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-700">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-100 font-display">
                      {formatCurrency(order.sellerAmount)}
                    </p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                      Your Earnings (After 5% Fee)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'confirmed' && order.transferStatus === 'pending' ? (
                      <button 
                        onClick={() => handleUpdateTransfer(order._id, 'completed')}
                        className="sell-cta text-xs !px-4 !py-2"
                      >
                        Confirm Transfer
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/30 border border-slate-700 text-xs text-slate-400">
                        {order.transferStatus === 'completed' ? (
                          <><CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Transfer Done</>
                        ) : (
                          <><Clock className="h-3.5 w-3.5" /> {order.transferStatus}</>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
