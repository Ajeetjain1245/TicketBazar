import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, CheckCircle, Clock, XCircle, AlertCircle, CreditCard, Ticket } from 'lucide-react';
import { ordersAPI } from '../../utils/api';
import { formatDate, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-indigo-400" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-indigo-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-slate-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-rose-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      confirmed: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30',
      pending: 'bg-slate-800 text-slate-400 border-slate-700',
      cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };
    return styles[status] || 'bg-slate-800 text-slate-500 border-slate-700';
  };

  // Count orders by status
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const confirmedCount = orders.filter(o => o.status === 'confirmed').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">My Orders</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with counts */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-100">My Orders</h1>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {pendingCount} Pending
            </span>
          )}
          {confirmedCount > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {confirmedCount} Confirmed
            </span>
          )}
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            {orders.length} Total
          </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card p-8 text-center">
          <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No orders yet</h3>
          <p className="text-slate-500 mb-4">Start browsing tickets and make your first purchase!</p>
          <Link to="/tickets" className="btn-primary inline-flex">
            Browse Tickets
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-6 hover:border-indigo-500/30 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-slate-500">#{order.orderNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    {order.payment?.status === 'pending' && order.status === 'pending' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                        Payment Due
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-100 mb-1">
                    {order.quantity && order.quantity > 1 ? `${order.quantity}× ` : ''}
                    {order.ticket?.title || 'Ticket'}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Ordered {formatDate(order.createdAt)}
                    </span>
                    <span>Seller: {order.seller?.name || order.ticket?.sellerName || 'Unknown'}</span>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-100 font-display">
                      {formatCurrency(order.amount)}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-widest mt-1">
                      {order.payment?.status === 'completed' ? (
                        <span className="text-emerald-500">Payment Verified</span>
                      ) : (
                        <span className="text-indigo-400">Payment Required</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    
                    {/* Pay Now button for pending payments */}
                    {order.payment?.status === 'pending' && order.status === 'pending' ? (
                      <Link 
                        to={`/checkout/${order._id}`}
                        className="sell-cta text-sm !px-4 !py-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        Pay Now
                      </Link>
                    ) : (
                      <Link 
                        to={`/dashboard/orders/${order._id}`}
                        className="btn-secondary text-sm"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Escrow Info */}
              {order.escrowStatus && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">Escrow:</span>
                    <span className={`font-medium ${
                      order.escrowStatus === 'released' ? 'text-emerald-400' :
                      order.escrowStatus === 'held' ? 'text-indigo-400' :
                      'text-amber-400'
                    }`}>
                      {order.escrowStatus.charAt(0).toUpperCase() + order.escrowStatus.slice(1)}
                    </span>
                    {order.escrowStatus === 'held' && (
                      <span className="text-slate-500 text-xs">
                        (Payment secured until ticket transfer)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
