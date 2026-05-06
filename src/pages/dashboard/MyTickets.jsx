import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket as TicketIcon, Calendar, Eye, Edit2, Trash2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ticketsAPI } from '../../utils/api';
import { formatDate, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await ticketsAPI.getMyTickets();
      setTickets(response.data.data.tickets || []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load your tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await ticketsAPI.delete(id);
      toast.success('Ticket deleted successfully');
      fetchTickets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete ticket');
    }
  };

  const getStatusBadge = (status, verificationStatus) => {
    if (status === 'sold') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (verificationStatus === 'pending') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (verificationStatus === 'rejected') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100 font-display">My Tickets</h1>
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
        <h1 className="text-2xl font-bold text-slate-100 font-display">My Tickets</h1>
        <Link to="/dashboard/tickets/create" className="sell-cta text-sm">
          List New Ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-700 bg-slate-800/30 backdrop-blur-xl text-center">
          <TicketIcon className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2 font-display">No tickets listed yet</h3>
          <p className="text-slate-500 mb-6">Start selling your extra tickets to other fans!</p>
          <Link to="/dashboard/tickets/create" className="btn-primary inline-flex">
            Create First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="p-6 rounded-2xl border border-slate-700 bg-slate-800/30 backdrop-blur-xl hover:border-indigo-500/30 transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Ticket Details */}
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-slate-700">
                    <img 
                      src={ticket.images?.[0]?.url || 'https://via.placeholder.com/150'} 
                      alt={ticket.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(ticket.status, ticket.verificationStatus)}`}>
                        {ticket.status === 'sold' ? 'Sold' : ticket.verificationStatus}
                      </span>
                      <span className="text-xs text-slate-500 uppercase tracking-widest">{ticket.type}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 mb-1 group-hover:text-indigo-400 transition-colors">
                      {ticket.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(ticket.eventDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {ticket.views} views
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-100 font-display">
                      {formatCurrency(ticket.resalePrice)}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                      {ticket.quantity} Ticket{ticket.quantity > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/tickets/${ticket._id}`}
                      className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-indigo-500 hover:text-slate-950 transition-all"
                      title="View Public Page"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link 
                      to={`/dashboard/tickets/edit/${ticket._id}`}
                      className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-indigo-500 hover:text-slate-950 transition-all"
                      title="Edit Ticket"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(ticket._id)}
                      className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-rose-500 hover:text-white transition-all"
                      title="Delete Ticket"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Rejected Note */}
              {ticket.verificationStatus === 'rejected' && ticket.verificationNotes && (
                <div className="mt-4 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 flex gap-2 items-start">
                  <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">Rejection Reason</p>
                    <p className="text-sm text-slate-400 mt-0.5">{ticket.verificationNotes}</p>
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

export default MyTickets;
