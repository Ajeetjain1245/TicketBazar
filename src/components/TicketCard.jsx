import { Link } from 'react-router-dom';
import { Calendar, MapPin, Tag, User, ShieldCheck } from 'lucide-react';
import { formatDate, formatCurrency, calculateDiscount, getTicketTypeLabel } from '../utils/helpers';

const TicketCard = ({ ticket }) => {
  const discount = calculateDiscount(ticket.originalPrice, ticket.resalePrice);
  const isSold = ticket.status === 'sold';
  const isReserved = ticket.status === 'reserved';

  return (
    <Link
      to={`/tickets/${ticket._id}`}
      className={`ticket-card block group relative overflow-hidden ${
        isSold ? 'opacity-75 hover:opacity-90' : ''
      }`}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-slate-900">
        {ticket.images && ticket.images.length > 0 ? (
          <img
            src={ticket.images[0].url}
            alt={ticket.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              isSold ? 'grayscale-[40%]' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full bg-slate-800/80 flex items-center justify-center">
            <Tag className="h-12 w-12 text-slate-600" />
          </div>
        )}

        {/* Sold Out / Reserved Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3.5 py-1.5 rounded-lg bg-rose-500/90 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-rose-950/50">
              Sold Out
            </span>
          </div>
        )}
        {isReserved && !isSold && (
          <div className="absolute inset-0 bg-amber-950/30 backdrop-blur-[1px] flex items-start justify-start p-3">
            <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-bold text-xs tracking-wide uppercase shadow-md">
              Reserved
            </span>
          </div>
        )}
        
        {/* Discount Badge */}
        {!isSold && !isReserved && discount > 0 && (
          <div className="absolute top-3 left-3 bg-indigo-500 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20">
            {discount}% OFF
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-3 right-3 bg-slate-900/80 border border-slate-700/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-medium text-slate-200">
          {getTicketTypeLabel(ticket.type)}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-bold text-slate-100 mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">
          {ticket.title}
        </h3>
        
        {/* Event Details */}
        <div className="space-y-2 mb-4">
          {ticket.eventDate && (
            <div className="flex items-center text-sm text-slate-400">
              <Calendar className="h-4 w-4 mr-2 text-indigo-400/70 shrink-0" />
              <span className="truncate">{formatDate(ticket.eventDate)}</span>
            </div>
          )}
          {(ticket.venue || ticket.fromLocation) && (
            <div className="flex items-center text-sm text-slate-400">
              <MapPin className="h-4 w-4 mr-2 text-indigo-400/70 shrink-0" />
              <span className="truncate">{ticket.venue || `${ticket.fromLocation} → ${ticket.toLocation}`}</span>
            </div>
          )}
        </div>

        {/* Seller Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center min-w-0">
            <div className="w-6 h-6 bg-indigo-500/10 rounded-full flex items-center justify-center mr-2 border border-indigo-500/30 shrink-0">
              <User className="h-3 w-3 text-indigo-400" />
            </div>
            <span className="text-sm text-slate-400 truncate">{ticket.sellerName || ticket.seller?.name || 'Verified Member'}</span>
          </div>

          {ticket.verified && (
            <span className="inline-flex items-center text-xs text-indigo-400 font-medium bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Verified
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/60">
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-display font-bold text-indigo-400">
              {formatCurrency(ticket.resalePrice)}
            </span>
            {ticket.originalPrice > ticket.resalePrice && (
              <span className="text-sm text-slate-500 line-through">
                {formatCurrency(ticket.originalPrice)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {ticket.quantity > 1 && (
              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                {ticket.quantity} left
              </span>
            )}
            <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-medium ${
              ticket.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              ticket.status === 'sold' ? 'bg-slate-800 text-slate-500 border border-slate-700' :
              ticket.status === 'reserved' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-slate-800 text-slate-400 border border-slate-600'
            }`}>
              {ticket.status}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TicketCard;
