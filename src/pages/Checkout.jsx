import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Shield, CheckCircle, Ticket, Calendar, MapPin, Receipt, Star } from 'lucide-react';
import { ordersAPI } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getById(orderId);
      setOrder(response.data.data.order);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Order not found');
      navigate('/tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load');
        setIsProcessing(false);
        return;
      }

      if (!order.payment?.razorpayOrderId || order.payment.razorpayOrderId.startsWith('mock_')) {
        toast.error('Warning: Server returned a mock order ID. Payment might fail.');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount * 100, // Amount in paise
        currency: "INR",
        name: "Ticket Bazar",
        description: `Ticket Purchase: ${order.ticket?.title || 'Event'}`,
        order_id: order.payment.razorpayOrderId, 
        handler: async function (response) {
          try {
            await ordersAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('Payment successful!');
            navigate('/dashboard/orders');
          } catch (err) {
            console.error('Payment verification failed:', err);
            toast.error(err.response?.data?.message || 'Payment verification failed.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: order.buyer?.name || "Customer",
          email: order.buyer?.email || "customer@example.com",
          contact: order.buyer?.phone || "9999999999"
        },
        theme: {
          color: "#6366f1"
        }
      };
      
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        toast.error('Payment failed: ' + response.error.description);
        setIsProcessing(false);
      });
      rzp1.open();
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.error(error.message || 'Payment initiation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent py-8">
        <div className="container-custom">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-transparent py-8">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold text-slate-100">Order not found</h2>
          <Link to="/tickets" className="btn-primary mt-4 inline-flex">
            Browse Tickets
          </Link>
        </div>
      </div>
    );
  }

  const qty = order.quantity || 1;
  const unitPrice = order.ticket?.resalePrice || (order.amount / qty);
  const subtotal = unitPrice * qty;
  const totalPayable = order.amount;

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="container-custom max-w-5xl">
        {/* Back Link */}
        <Link to={`/tickets/${order.ticket?._id}`} className="inline-flex items-center text-slate-400 hover:text-indigo-400 mb-6 transition-colors font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Ticket
        </Link>

        <h1 className="text-4xl font-bold text-slate-100 mb-10 font-display">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Order Summary */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-slate-100 mb-8 flex items-center gap-3 font-display">
                <Receipt className="h-6 w-6 text-indigo-500" />
                Order Summary
              </h2>
              
              {/* Ticket Info */}
              <div className="flex items-start gap-6 mb-8">
                <div className="w-28 h-28 bg-slate-800 rounded-2xl flex-shrink-0 border border-slate-700 overflow-hidden shadow-2xl">
                  {order.ticket?.images?.[0] ? (
                    <img 
                      src={order.ticket.images[0].url} 
                      alt={order.ticket.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-slate-800">🎫</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-100 truncate mb-1">{order.ticket?.title}</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Transaction #{order.orderNumber?.slice(-8)}</p>
                  <div className="space-y-2">
                    {order.ticket?.eventDate && (
                      <p className="text-sm text-slate-400 flex items-center gap-2 font-medium">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        {formatDate(order.ticket.eventDate)}
                      </p>
                    )}
                    {order.ticket?.venue && (
                      <p className="text-sm text-slate-400 flex items-center gap-2 font-medium">
                        <MapPin className="h-4 w-4 text-indigo-500" />
                        {order.ticket.venue}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-slate-800 pt-8 space-y-5">
                <div className="flex justify-between text-slate-400 font-medium">
                  <span className="flex items-center gap-2 italic">
                    <Ticket className="h-4 w-4 text-slate-600" />
                    Unit Price
                  </span>
                  <span className="text-slate-200">{formatCurrency(unitPrice)}</span>
                </div>

                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Ticket Quantity</span>
                  <span className="text-slate-100 font-bold">{qty}×</span>
                </div>

                <div className="flex justify-between text-slate-400 font-bold pt-4 border-t border-slate-800/50">
                  <span>Subtotal</span>
                  <span className="text-slate-200">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Platform Service Fee (5%)</span>
                  <span className="text-slate-300">{formatCurrency(order.platformFee)}</span>
                </div>

                <div className="flex justify-between text-3xl font-bold text-slate-100 border-t border-slate-800 pt-8 mt-4">
                  <span className="font-display">Total Payable</span>
                  <span className="text-indigo-400 font-display">{formatCurrency(totalPayable)}</span>
                </div>
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Shield className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className="font-bold text-slate-100 uppercase text-sm tracking-[0.2em]">Escrow Protection</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Funds are held securely by Ticket Bazar and only released to the seller after you confirm ticket receipt. 
                100% money-back guarantee for invalid tickets.
              </p>
            </div>
          </div>

          {/* Payment Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-slate-100 mb-8 font-display">Payment Method</h2>
              
              {/* Demo Payment Option */}
              <div className="border-2 border-indigo-500 bg-indigo-500/10 rounded-2xl p-6 mb-8 relative group cursor-pointer transition-all hover:bg-indigo-500/15">
                <CheckCircle className="absolute top-4 right-4 h-6 w-6 text-indigo-500" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-500 rounded-xl text-slate-950 shadow-lg shadow-indigo-500/20">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 block text-lg">Instant Pay</span>
                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest bg-indigo-400/10 px-2 py-0.5 rounded-md">Verified Gateway</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Fastest way to secure your tickets using CC/DC or UPI.
                </p>
              </div>

              {/* Final Amount */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-8 shadow-inner flex flex-col items-center justify-center text-center">
                  <span className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-2">Final Amount</span>
                  <span className="text-4xl font-bold text-indigo-400 font-display">{formatCurrency(totalPayable)}</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing || order.payment?.status === 'completed'}
                className="w-full py-5 bg-indigo-400 text-slate-950 rounded-2xl flex items-center justify-center text-xl font-bold hover:bg-indigo-300 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 active:scale-95"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 mr-3 text-slate-950" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Authorizing...
                  </span>
                ) : order.payment?.status === 'completed' ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    Payment Confirmed
                  </span>
                ) : (
                  <span>Checkout Now</span>
                )}
              </button>

              <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col items-center gap-6">
                 <p className="text-[10px] text-slate-500 font-bold text-center leading-relaxed uppercase tracking-tighter">
                  By completing this purchase, you agree to our <span className="text-indigo-500">Terms of Service</span> and <span className="text-indigo-500">Buyer Protection Policy</span>.
                </p>
                <div className="flex items-center gap-4 opacity-20 grayscale">
                    <div className="h-5 w-8 bg-slate-600 rounded"></div>
                    <div className="h-5 w-8 bg-slate-600 rounded"></div>
                    <div className="h-5 w-8 bg-slate-600 rounded"></div>
                    <div className="h-5 w-8 bg-slate-600 rounded"></div>
                </div>
              </div>
            </div>

            {/* Seller Quick Info */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-indigo-500 border border-slate-700">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Seller Reputation</h3>
                <p className="font-bold text-slate-200">{order.ticket?.sellerName || order.seller?.name}</p>
              </div>
              <div className="ml-auto py-1 px-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-black uppercase">
                Verified
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
