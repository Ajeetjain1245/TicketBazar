import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, User, Tag, ArrowLeft, MessageCircle, ShoppingCart, Lock, Minus, Plus, Ticket, Star, X, Phone } from 'lucide-react';
import { ticketsAPI, ordersAPI, reviewsAPI, chatAPI } from '../utils/api';
import { formatDate, formatCurrency, calculateDiscount, getTicketTypeLabel } from '../utils/helpers';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [sellerReviews, setSellerReviews] = useState([]);
  const [sellerStats, setSellerStats] = useState(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await ticketsAPI.getById(id);
      setTicket(response.data.data.ticket);
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSellerReviews = async (sellerId) => {
    setIsLoadingReviews(true);
    try {
      const response = await reviewsAPI.getSellerReviews(sellerId);
      setSellerReviews(response.data.data);
      setSellerStats(response.data.stats);
    } catch(err) {
      console.error(err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const openSellerModal = () => {
    setIsSellerModalOpen(true);
    if (ticket?.seller?._id) {
       fetchSellerReviews(ticket.seller._id);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to buy tickets');
      navigate('/login');
      return;
    }

    if (ticket.seller?._id === user._id) {
      toast.error('You cannot buy your own ticket');
      return;
    }

    if (ticket.status !== 'available') {
      toast.error('This ticket is no longer available');
      return;
    }

    if (quantity > ticket.quantity) {
      toast.error(`Only ${ticket.quantity} ticket(s) available`);
      return;
    }

    setIsBuying(true);
    try {
      const response = await ordersAPI.create({
        ticketId: ticket._id,
        quantity,
      });
      
      const { order } = response.data.data;
      
      toast.success('Order created! Redirecting to payment...');
      navigate(`/checkout/${order._id || order.id}`);
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setIsBuying(false);
    }
  };

  const handleChatWithSeller = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to chat with seller');
      navigate('/login');
      return;
    }

    if (ticket.seller?._id === user._id) {
      toast.error('You cannot chat with yourself');
      return;
    }

    setIsStartingChat(true);
    try {
      const response = await chatAPI.createConversation({
        participantId: ticket.seller?._id,
        ticketId: ticket._id,
        ticketInfo: {
          title: ticket.title,
          price: ticket.resalePrice,
          image: ticket.images?.[0]?.url
        }
      });
      
      const { conversation } = response.data.data;
      navigate(`/dashboard/messages/${conversation._id}`);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to start chat session');
    } finally {
      setIsStartingChat(false);
    }
  };

  const incrementQty = () => {
    if (ticket && quantity < ticket.quantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="card h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold text-gray-900">Ticket not found</h2>
          <Link to="/tickets" className="btn-primary mt-4 inline-flex">
            Browse Tickets
          </Link>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount(ticket.originalPrice, ticket.resalePrice);
  const totalPrice = ticket.resalePrice * quantity;

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="container-custom">
        {/* Back Link */}
        <Link to="/tickets" className="inline-flex items-center text-slate-400 hover:text-indigo-400 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tickets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">
              {ticket.images && ticket.images.length > 0 ? (
                <img
                  src={ticket.images[0].url}
                  alt={ticket.title}
                  className="w-full h-[500px] object-cover"
                />
              ) : (
                <div className="w-full h-[500px] bg-slate-900 flex items-center justify-center">
                  <Tag className="h-24 w-24 text-slate-700" />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl mt-6 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-slate-100 mb-4 font-display">Description</h2>
              <p className="text-slate-400 text-lg leading-relaxed whitespace-pre-line">{ticket.description}</p>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
              <div className="flex items-baseline space-x-3 mb-2">
                <span className="text-4xl font-bold text-indigo-400 font-display">
                  {formatCurrency(ticket.resalePrice)}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-lg text-slate-500 line-through">
                      {formatCurrency(ticket.originalPrice)}
                    </span>
                    <span className="bg-indigo-500 text-slate-950 px-2 py-0.5 rounded-lg text-xs font-bold">{discount}% OFF</span>
                  </>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-6 font-medium">per ticket · Including all taxes</p>

              {/* Available tickets count */}
              <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                <Ticket className="h-5 w-5 text-indigo-500" />
                <span className="text-sm font-semibold text-slate-300">
                  {ticket.quantity > 0 ? (
                    <>{ticket.quantity} ticket{ticket.quantity !== 1 ? 's' : ''} available</>
                  ) : (
                    <span className="text-rose-400">Sold Out</span>
                  )}
                </span>
              </div>

              {/* Quantity Selector */}
              {ticket.quantity > 0 && ticket.status === 'available' && (
                <div className="mb-8">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">Purchase Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={decrementQty}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center bg-slate-800 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-all shadow-lg"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-2xl font-bold text-slate-100 w-8 text-center">{quantity}</span>
                    <button
                      onClick={incrementQty}
                      disabled={quantity >= ticket.quantity}
                      className="w-10 h-10 flex items-center justify-center bg-indigo-500 text-slate-950 border border-indigo-400 rounded-xl hover:bg-indigo-400 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/10"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-slate-500 ml-2 font-medium">
                      of {ticket.quantity}
                    </span>
                  </div>
                  {quantity > 1 && (
                    <p className="text-sm text-indigo-400 mt-4 font-bold flex items-center gap-2">
                       <span className="text-slate-500 font-normal">Subtotal:</span> {formatCurrency(totalPrice)}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {isAuthenticated && user ? (
                  ticket.seller?._id === user._id ? (
                    <button 
                      className="w-full py-4 bg-slate-800 text-slate-500 border border-slate-700 rounded-2xl flex items-center justify-center font-bold cursor-not-allowed"
                      disabled
                    >
                      <Lock className="h-5 w-5 mr-2" />
                      Your Listing
                    </button>
                  ) : (
                    <button 
                      className="w-full py-4 bg-indigo-500 text-slate-950 rounded-2xl flex items-center justify-center font-bold hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                      onClick={handleBuyNow}
                      disabled={isBuying || ticket.status !== 'available' || ticket.quantity < 1}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2 text-slate-950" />
                      {isBuying ? 'Processing...' : quantity > 1 ? `Buy ${quantity} Tickets — ${formatCurrency(totalPrice)}` : 'Secure Ticket Now'}
                    </button>
                  )
                ) : (
                  <Link to="/login" className="w-full py-4 bg-indigo-500 text-slate-950 rounded-2xl flex items-center justify-center font-bold hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20">
                    <Lock className="h-5 w-5 mr-2" />
                    Login to Buy
                  </Link>
                )}
                <button 
                  className="w-full py-4 bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl flex items-center justify-center font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                  onClick={handleChatWithSeller}
                  disabled={isStartingChat}
                >
                  <MessageCircle className="h-5 w-5 mr-2 text-indigo-400" />
                  {isStartingChat ? 'Opening Chat...' : 'Chat with Seller'}
                </button>
              </div>
            </div>

            {/* Ticket Info */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-slate-100 mb-6 font-display">Ticket Information</h3>
              <div className="space-y-4">
                <div className="flex items-center text-slate-400 text-base">
                  <Tag className="h-5 w-5 mr-4 text-indigo-500" />
                  {getTicketTypeLabel(ticket.type)}
                </div>
                {ticket.eventDate && (
                  <div className="flex items-center text-slate-400 text-base">
                    <Calendar className="h-5 w-5 mr-4 text-indigo-500" />
                    {formatDate(ticket.eventDate)}
                  </div>
                )}
                {(ticket.venue || ticket.fromLocation) && (
                  <div className="flex items-center text-slate-400 text-base">
                    <MapPin className="h-5 w-5 mr-4 text-indigo-500" />
                    {ticket.venue || `${ticket.fromLocation} → ${ticket.toLocation}`}
                  </div>
                )}
              </div>
            </div>

            {/* Seller Info */}
            <div 
              className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl cursor-pointer hover:border-indigo-500/50 transition-colors"
              onClick={openSellerModal}
            >
              <h3 className="text-lg font-bold text-slate-100 mb-6 font-display flex items-center justify-between">
                Seller Information
                <span className="text-xs text-indigo-400 font-normal">View Details &rarr;</span>
              </h3>
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/5">
                  <User className="h-7 w-7 text-indigo-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-100">{ticket.sellerName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex text-indigo-500"><Star className="w-3.5 h-3.5 fill-current" /></div>
                    <p className="text-sm text-slate-500 font-medium">{ticket.seller?.totalSales || 0} successful sales</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Details Modal */}
      {isSellerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
              <h2 className="text-xl font-bold text-white font-display">Seller Profile</h2>
              <button onClick={() => setIsSellerModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-100">{ticket.sellerName}</p>
                  <p className="text-sm text-slate-400">Member since {formatDate(ticket.seller?.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 text-center">
                  <p className="text-3xl font-bold text-white font-display">{ticket.seller?.totalSales || 0}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">Total Sales</p>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 text-center">
                  <p className="text-3xl font-bold text-indigo-400 font-display flex items-center justify-center">
                    {sellerStats?.avgRating ? sellerStats.avgRating.toFixed(1) : 'N/A'}
                    <Star className="w-5 h-5 ml-1 fill-current" />
                  </p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">{sellerStats?.numReviews || 0} Reviews</p>
                </div>
              </div>

              {/* Seller Contact — respects privacy */}
              {ticket.seller?.phone && ticket.seller?.phoneVisibility === 'public' && (
                <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/30 mb-8 flex items-center gap-3">
                  <Phone className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Contact</p>
                    <p className="text-sm text-slate-200 font-medium">{ticket.seller.phone}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Recent Reviews</h3>
                {isLoadingReviews ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-slate-800 rounded-xl"></div>
                    <div className="h-20 bg-slate-800 rounded-xl"></div>
                  </div>
                ) : sellerReviews.length > 0 ? (
                  <div className="space-y-4">
                    {sellerReviews.map(review => (
                      <div key={review._id} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-200">{review.buyerId?.name || 'User'}</span>
                          <div className="flex gap-1 text-amber-400">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="text-sm text-slate-400">{review.comment}</p>}
                        <p className="text-xs text-slate-500 mt-2">{formatDate(review.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-6">No reviews available for this seller yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;
