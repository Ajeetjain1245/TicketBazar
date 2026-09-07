import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Clock, 
  Package, 
  Ticket, 
  Star,
  Truck,
  Send,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { ordersAPI, reviewsAPI } from '../../utils/api';
import { formatDate, formatCurrency } from '../../utils/helpers';
import EscrowStepper from '../../components/EscrowStepper';
import toast from 'react-hot-toast';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Dispute Modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('not_received');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  // Review state
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getById(id);
      setOrder(response.data.data.order);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Order not found');
      navigate('/dashboard/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!window.confirm('Are you sure you have received and verified the ticket? This will release the escrow payment directly to the seller.')) {
      return;
    }

    setIsConfirming(true);
    try {
      await ordersAPI.confirmReceipt(order._id);
      toast.success('Ticket received confirmed! Escrow funds released to seller.');
      await fetchOrder();
    } catch (error) {
      console.error('Receipt confirmation error:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm receipt');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleOpenDispute = async (e) => {
    e.preventDefault();
    if (!disputeDescription.trim()) {
      return toast.error('Please describe the issue you encountered.');
    }

    setIsSubmittingDispute(true);
    try {
      await ordersAPI.openDispute(order._id, {
        reason: disputeReason,
        description: disputeDescription.trim()
      });
      toast.success('Dispute submitted. Admin has been notified to investigate.');
      setShowDisputeModal(false);
      await fetchOrder();
    } catch (error) {
      console.error('Dispute error:', error);
      toast.error(error.response?.data?.message || 'Failed to open dispute');
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error('Please select a rating');
    
    setIsReviewSubmitting(true);
    try {
      await reviewsAPI.create({
        ticketId: order.ticket._id,
        sellerId: order.seller._id,
        rating,
        comment: reviewComment
      });
      toast.success('Review submitted successfully!');
      setHasReviewed(true);
    } catch (error) {
      if (error.response?.data?.message === 'You have already reviewed this ticket purchase') {
        setHasReviewed(true);
        toast.error('You already reviewed this purchase.');
      } else {
        toast.error('Failed to submit review');
      }
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      confirmed: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      disputed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };
    return styles[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const getDeliveryMethodLabel = (method) => {
    const methods = {
      e_ticket: { label: 'E-Ticket (PDF / Screenshot / Email)', icon: Send, color: 'text-indigo-400' },
      app_transfer: { label: 'In-App Account Transfer (BookMyShow / Zomato)', icon: ExternalLink, color: 'text-purple-400' },
      physical: { label: 'Physical Ticket (Courier / Speed Post)', icon: Truck, color: 'text-amber-400' },
      meetup: { label: 'In-Person Handover / Meetup', icon: User, color: 'text-emerald-400' }
    };
    return methods[method] || { label: 'Standard Delivery', icon: Package, color: 'text-slate-400' };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="card h-96" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-300">Order not found</h3>
        <Link to="/dashboard/orders" className="btn-primary mt-4 inline-flex">
          Back to Orders
        </Link>
      </div>
    );
  }

  const qty = order.quantity || 1;
  const unitPrice = order.ticket?.resalePrice || (order.amount / qty);
  const isPendingPayment = order.payment?.status === 'pending' && order.status === 'pending';
  const deliveryInfo = getDeliveryMethodLabel(order.deliveryMethod || order.ticket?.deliveryMethod);
  const DeliveryIcon = deliveryInfo.icon;
  const isDisputed = order.status === 'disputed' || order.escrowStatus === 'disputed';

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/dashboard/orders" className="inline-flex items-center text-slate-400 hover:text-indigo-400">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Orders
      </Link>

      {/* Escrow Visual Stepper */}
      <EscrowStepper
        orderStatus={order.status}
        escrowStatus={order.escrowStatus || order.escrow?.status || (order.status === 'completed' ? 'released' : order.status === 'confirmed' ? 'held' : isDisputed ? 'disputed' : 'pending')}
      />

      {/* Dispute Alert Banner */}
      {isDisputed && (
        <div className="card p-6 border-rose-500/40 bg-rose-500/10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-rose-400">Order Under Dispute Investigation</h3>
              <p className="text-sm text-slate-300 mt-1">
                A dispute has been initiated for this order. Escrow payout is currently frozen while our support team reviews evidence from both buyer and seller.
              </p>
              {order.dispute?.reason && (
                <div className="mt-3 p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Reported Reason:</span> {order.dispute.reason.replace('_', ' ').toUpperCase()}
                  {order.dispute.description && <p className="mt-1 text-slate-300">{order.dispute.description}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Order #{order.orderNumber}</h1>
          <p className="text-slate-400 mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadge(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          {isPendingPayment && (
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
              Payment Due
            </span>
          )}
        </div>
      </div>

      {/* Payment Due Banner */}
      {isPendingPayment && (
        <div className="card p-6 border-amber-500/30 bg-amber-500/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-1">Complete Your Payment</h3>
              <p className="text-sm text-slate-400">
                Your order is reserved. Complete payment to secure your {qty > 1 ? `${qty} tickets` : 'ticket'}.
              </p>
            </div>
            <Link 
              to={`/checkout/${order._id}`}
              className="sell-cta !text-base"
            >
              <CreditCard className="h-5 w-5" />
              Pay {formatCurrency(order.amount)}
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Details & Delivery Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Ticket Details</h2>
            
            <div className="flex gap-4 mb-4">
              <div className="w-24 h-24 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                {order.ticket?.images?.[0] ? (
                  <img 
                    src={order.ticket.images[0].url} 
                    alt={order.ticket.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-3xl">🎫</span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-lg">{order.ticket?.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{order.ticket?.type}</p>
                {qty > 1 && (
                  <p className="text-amber-400 text-sm font-medium flex items-center gap-1 mt-1">
                    <Ticket className="h-4 w-4" />
                    {qty} tickets
                  </p>
                )}
                {order.ticket?.eventDate && (
                  <p className="text-slate-400 text-sm flex items-center gap-1 mt-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(order.ticket.eventDate)}
                  </p>
                )}
                {order.ticket?.venue && (
                  <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {order.ticket.venue}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <h4 className="font-medium text-slate-100 mb-2">Seller Information</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-slate-200">{order.seller?.name || 'Unknown'}</p>
                  <p className="text-slate-500 text-sm">{order.seller?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Transfer Status Card */}
          <div className="card p-6 border-indigo-500/20">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <DeliveryIcon className={`h-5 w-5 ${deliveryInfo.color}`} />
              Delivery & Ticket Transfer
            </h2>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 gap-2">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Fulfillment Method</span>
                  <span className="text-sm font-medium text-slate-200 flex items-center gap-2 mt-0.5">
                    <DeliveryIcon className="h-4 w-4 text-indigo-400" />
                    {deliveryInfo.label}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Transfer Status</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${
                    order.transferStatus === 'completed' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {order.transferStatus === 'completed' ? '✓ Sent by Seller' : '⏳ Awaiting Seller Transfer'}
                  </span>
                </div>
              </div>

              {/* Courier or Transfer Details provided by Seller */}
              {order.trackingNumber && (
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700 text-sm">
                  <span className="text-slate-400 block text-xs">Tracking Number / Ticket Reference Code:</span>
                  <p className="text-indigo-300 font-mono font-medium mt-0.5 select-all">{order.trackingNumber}</p>
                </div>
              )}

              {order.transferDetails && (
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700 text-sm">
                  <span className="text-slate-400 block text-xs">Seller Transfer Note / Instructions:</span>
                  <p className="text-slate-200 mt-0.5 whitespace-pre-wrap">{order.transferDetails}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Order Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-slate-200">Order Placed</p>
                  <p className="text-slate-500 text-sm">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              {order.payment?.status === 'completed' && (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-slate-200">Payment Completed & Secured in Escrow</p>
                    <p className="text-slate-500 text-sm">{formatDate(order.payment.paidAt)}</p>
                  </div>
                </div>
              )}
              {order.transferStatus === 'completed' && (
                <div className="flex items-center gap-3">
                  <DeliveryIcon className="h-5 w-5 text-indigo-400" />
                  <div>
                    <p className="text-slate-200">Seller Sent Ticket Details</p>
                    <p className="text-slate-500 text-sm">Transferred via {order.deliveryMethod || 'Ticket Bazar'}</p>
                  </div>
                </div>
              )}
              {order.status === 'completed' && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-slate-200">Ticket Verified & Escrow Released</p>
                    <p className="text-slate-500 text-sm">{formatDate(order.completedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary & Actions */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Payment Breakdown</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-slate-300">
                <span>Unit Price</span>
                <span>{formatCurrency(unitPrice)}</span>
              </div>
              {qty > 1 && (
                <div className="flex justify-between text-slate-300">
                  <span>Quantity</span>
                  <span>{qty}× tickets</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span>{formatCurrency(unitPrice * qty)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Platform Fee (5%)</span>
                <span>{formatCurrency(order.platformFee)}</span>
              </div>
              <div className="border-t border-slate-700 pt-3 flex justify-between text-lg font-semibold text-slate-100">
                <span>{order.payment?.status === 'completed' ? 'Total Paid' : 'Total Payable'}</span>
                <span className={order.payment?.status === 'completed' ? '' : 'text-amber-400'}>
                  {formatCurrency(order.amount)}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-slate-400" />
                <span className="text-slate-300">Payment Status</span>
              </div>
              <p className={`font-medium ${order.payment?.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {order.payment?.status === 'completed' ? '✓ Paid' : '⏳ Pending'}
              </p>
            </div>

            {/* Pay Now button in summary */}
            {isPendingPayment && (
              <Link 
                to={`/checkout/${order._id}`}
                className="sell-cta w-full mt-4 justify-center"
              >
                <CreditCard className="h-5 w-5" />
                Complete Payment
              </Link>
            )}
          </div>

          {/* Escrow Info */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-indigo-400" />
              <h3 className="font-semibold text-slate-100">Escrow Protection</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Your money is locked safely in the Ticket Bazar Escrow Vault until you verify your ticket.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Escrow Status</span>
              <span className={`font-medium ${
                order.escrowStatus === 'released' ? 'text-emerald-400' :
                order.escrowStatus === 'held' ? 'text-indigo-400' :
                order.escrowStatus === 'disputed' ? 'text-rose-400' :
                'text-amber-400'
              }`}>
                {order.escrowStatus?.charAt(0).toUpperCase() + order.escrowStatus?.slice(1)}
              </span>
            </div>
          </div>

          {/* Buyer Action Card */}
          {order.status === 'confirmed' && (
            <div className="card p-6 border-indigo-500/40 bg-indigo-500/5 space-y-4">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                Buyer Verification
              </h3>
              
              {order.transferStatus === 'completed' ? (
                <>
                  <p className="text-sm text-slate-300">
                    The seller indicated that the ticket has been transferred. Once you check and confirm your ticket is valid, click below to release funds to the seller.
                  </p>
                  <button 
                    className="btn-primary w-full shadow-lg shadow-indigo-500/20"
                    disabled={isConfirming}
                    onClick={handleConfirmReceipt}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {isConfirming ? 'Releasing Funds...' : 'Confirm Ticket Received & Release Escrow'}
                  </button>
                </>
              ) : (
                <div className="p-3 bg-slate-800/60 rounded-lg text-sm text-slate-400 border border-slate-700/50">
                  <Clock className="h-4 w-4 text-amber-400 inline mr-1.5" />
                  Awaiting the seller to transfer the ticket. Once delivered, you can verify and release payment.
                </div>
              )}

              {/* Dispute Button */}
              <div className="pt-2 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(true)}
                  className="w-full py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Have an issue? Open a Dispute
                </button>
              </div>
            </div>
          )}

          {/* Leave a Review Section */}
          {order.status === 'completed' && !hasReviewed && (
            <div className="card p-6 border-indigo-500/30">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-amber-400" />
                <h3 className="font-semibold text-slate-100">Rate the Seller</h3>
              </div>
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="focus:outline-none"
                        onClick={() => setRating(star)}
                      >
                        <Star className={`h-6 w-6 ${rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Comment (Optional)</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="input w-full bg-slate-800 border-slate-700 text-slate-100"
                    placeholder="How was your experience?"
                    rows="3"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isReviewSubmitting}
                  className="btn-primary w-full"
                >
                  {isReviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {order.status === 'completed' && hasReviewed && (
            <div className="card p-6 bg-emerald-500/10 border-emerald-500/20 text-center">
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <h3 className="font-medium text-emerald-400">Review Submitted</h3>
              <p className="text-sm text-slate-400 mt-1">Thank you for your feedback!</p>
            </div>
          )}
        </div>
      </div>

      {/* Open Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="card max-w-md w-full p-6 space-y-4 border-rose-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Open Escrow Dispute</h3>
                <p className="text-xs text-slate-400">Our support team will mediate this transaction</p>
              </div>
            </div>

            <form onSubmit={handleOpenDispute} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Reason for Dispute</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="input w-full bg-slate-800 border-slate-700 text-slate-100 text-sm"
                >
                  <option value="not_received">Ticket Not Received / Not Transferred</option>
                  <option value="invalid_ticket">Invalid / Fake / Already Used Ticket</option>
                  <option value="wrong_ticket">Wrong Event / Seat Details Mismatch</option>
                  <option value="seller_unresponsive">Seller Unresponsive</option>
                  <option value="other">Other Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Detailed Description</label>
                <textarea
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  rows={4}
                  required
                  placeholder="Explain what went wrong in detail so our moderators can investigate..."
                  className="input w-full bg-slate-800 border-slate-700 text-slate-100 text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispute}
                  className="btn-primary flex-1 !bg-rose-600 hover:!bg-rose-500 border-rose-500 text-white"
                >
                  {isSubmittingDispute ? 'Submitting...' : 'Submit Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
