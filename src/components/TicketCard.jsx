import { Link } from 'react-router-dom';
import { Calendar, MapPin, Tag, User } from 'lucide-react';
import { formatDate, formatCurrency, calculateDiscount, getTicketTypeLabel } from '../utils/helpers';

const TicketCard = ({ ticket }) => {
  const discount = calculateDiscount(ticket.originalPrice, ticket.resalePrice);

  return (
    <Link to={`/tickets/${ticket._id}`} className="ticket-card block group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {ticket.images && ticket.images.length > 0 ? (
          <img
            src={ticket.images[0].url}
            alt={ticket.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <Tag className="h-12 w-12 text-slate-600" />
          </div>
        )}
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-indigo-500 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20">
            {discount}% OFF
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-3 right-3 bg-slate-800 border border-slate-600 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300">
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
              <Calendar className="h-4 w-4 mr-2 text-indigo-400/60" />
              {formatDate(ticket.eventDate)}
            </div>
          )}
          {(ticket.venue || ticket.fromLocation) && (
            <div className="flex items-center text-sm text-slate-400">
              <MapPin className="h-4 w-4 mr-2 text-indigo-400/60" />
              {ticket.venue || `${ticket.fromLocation} → ${ticket.toLocation}`}
            </div>
          )}
        </div>

        {/* Seller Info */}
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 bg-indigo-500/10 rounded-full flex items-center justify-center mr-2 border border-indigo-500/30">
            <User className="h-3 w-3 text-indigo-400" />
          </div>
          <span className="text-sm text-slate-400">{ticket.sellerName}</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
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
            <span className={`text-xs px-2 py-1 rounded-full capitalize ${
              ticket.status === 'active' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
              ticket.status === 'sold' ? 'bg-slate-800 text-slate-500 border border-slate-700' :
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
