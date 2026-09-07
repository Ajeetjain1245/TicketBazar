import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Calendar, CheckCircle, Clock, XCircle, AlertCircle, User, MessageSquare, Send, X, FileText, Truck, Smartphone } from 'lucide-react';
import { ordersAPI } from '../../utils/api';
import { formatDate, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Transfer Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [transferMethod, setTransferMethod] = useState('e_ticket');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

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

  const handleOpenTransferModal = (order) => {
    setSelectedOrder(order);
    setTransferMethod(order.ticket?.deliveryMethod || order.deliveryMethod || 'e_ticket');
    setTrackingNumber('');
    setNotes('');
  };

  const handleSubmitTransfer = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsSubmittingTransfer(true);
    try {
      await ordersAPI.updateTransfer(selectedOrder._id, {
        transferStatus: 'completed',
        transferMethod,
        trackingNumber,
        notes,
      });
      toast.success('Transfer submitted! Buyer notified to verify and release escrow.');
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update transfer status');
    } finally {
      setIsSubmittingTransfer(false);
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
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-display">Sales & Orders</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage ticket fulfillment and monitor escrow releases</p>
        </div>
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
                      <span>Buyer: <span className="text-slate-200">{order.buyer?.name || 'Customer'}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MessageSquare className="h-4 w-4 text-indigo-400" />
                      <Link to={`/dashboard/messages?conversation=${order.buyer?._id}`} className="text-indigo-400 hover:underline">
                        Chat with Buyer
                      </Link>
                    </div>
                  </div>

                  {/* Transfer Details if already provided */}
                  {order.transferDetails?.transferMethod && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300">
                      <span className="font-semibold text-indigo-400 uppercase tracking-wider">Method: {order.transferDetails.transferMethod}</span>
                      {order.transferDetails.trackingNumber && (
                        <span className="ml-3 font-mono text-slate-400">Ref/Tracking: {order.transferDetails.trackingNumber}</span>
                      )}
                      {order.transferDetails.notes && (
                        <p className="mt-1 text-slate-400">Notes: {order.transferDetails.notes}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Pricing & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-700">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-100 font-display">
                      {formatCurrency(order.sellerAmount)}
                    </p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                      Your Payout (Escrow: {order.escrowStatus || 'Held'})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'confirmed' && order.transferStatus !== 'completed' ? (
                      <button 
                        onClick={() => handleOpenTransferModal(order)}
                        className="sell-cta text-xs !px-4 !py-2 flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send / Transfer Ticket
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/30 border border-slate-700 text-xs text-slate-400">
                        {order.status === 'completed' ? (
                          <><CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Funds Released</>
                        ) : order.transferStatus === 'completed' ? (
                          <><Clock className="h-3.5 w-3.5 text-amber-400" /> Awaiting Buyer Verification</>
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

      {/* Transfer Fulfillment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-100 font-display mb-1">
              Fulfill Ticket Transfer
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Order #{selectedOrder.orderNumber} • {selectedOrder.ticket?.title}
            </p>

            <form onSubmit={handleSubmitTransfer} className="space-y-4">
              {/* Delivery Method Selection */}
              <div>
                <label className="label text-slate-300">Delivery Method</label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {[
                    { id: 'e_ticket', label: 'E-Ticket / PDF', icon: FileText },
                    { id: 'app_transfer', label: 'In-App Transfer', icon: Smartphone },
                    { id: 'physical', label: 'Courier / Post', icon: Truck },
                    { id: 'meetup', label: 'In-Person Handover', icon: User },
                  ].map((m) => {
                    const Icon = m.icon;
                    const active = transferMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setTransferMethod(m.id)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          active
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0 text-indigo-400" />
                        <span className="text-xs font-semibold">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tracking / Confirmation Number */}
              <div>
                <label className="label text-slate-300">
                  {transferMethod === 'physical'
                    ? 'Courier Tracking Number (BlueDart / DTDC / SpeedPost)'
                    : transferMethod === 'app_transfer'
                    ? 'App Transfer Confirmation Code / Reference ID'
                    : 'Ticket Barcode / Reference Number (Optional)'}
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder={
                    transferMethod === 'physical'
                      ? 'e.g. BD123456789IN'
                      : transferMethod === 'app_transfer'
                      ? 'e.g. BMS-TX-98483'
                      : 'e.g. TKT-PASS-4902'
                  }
                  className="input"
                />
              </div>

              {/* Instructions / Notes for the Buyer */}
              <div>
                <label className="label text-slate-300">Instructions / Notes for Buyer</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 'Transferred via BookMyShow to your registered email. Please accept in your app.' or 'Courier booked, estimated delivery tomorrow.'"
                  className="input min-h-[90px] resize-none"
                  rows={3}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTransfer}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  {isSubmittingTransfer ? 'Submitting...' : 'Confirm Ticket Transferred'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
