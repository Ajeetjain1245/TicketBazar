import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Clock, 
  Search,
  Filter,
  MoreVertical,
  Check,
  X,
  Eye
} from 'lucide-react';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getTickets({ 
        verificationStatus: filter === 'all' ? undefined : filter,
        search: searchTerm 
      });
      setTickets(response.data.data.tickets);
      
      // Update local stats if we weren't filtering
      if (filter === 'all' && !searchTerm) {
        const counts = {
          total: response.data.data.tickets.length,
          pending: response.data.data.tickets.filter(t => t.verificationStatus === 'pending').length,
          approved: response.data.data.tickets.filter(t => t.verificationStatus === 'approved').length,
          rejected: response.data.data.tickets.filter(t => t.verificationStatus === 'rejected').length,
        };
        setStats(counts);
      }
    } catch (err) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status, notes = '') => {
    try {
      await adminAPI.verifyTicket(id, { status, notes });
      toast.success(`Ticket ${status} successfully`);
      fetchTickets();
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'pending': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Manage Tickets</h1>
          <p className="text-slate-400">Review and verify ticket listings from sellers.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
              className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors w-64"
            />
          </div>
          <button 
            onClick={fetchTickets}
            className="p-2 bg-indigo-500 text-slate-950 rounded-xl hover:bg-indigo-400 transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/50 border border-slate-800 rounded-2xl w-fit">
        {['pending', 'approved', 'rejected', 'all'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              filter === tab 
                ? 'bg-indigo-500 text-slate-950 shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/30">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticket Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Seller</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Event Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Pricing</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-8 h-20 bg-slate-900/20"></td>
                  </tr>
                ))
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Clock className="w-12 h-12 opacity-20" />
                      <p>No tickets found in this category.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket._id} className="group hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                          {ticket.images?.[0]?.url ? (
                            <img src={ticket.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold">
                              {ticket.type?.[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{ticket.title}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="capitalize">{ticket.type}</span>
                            <span>•</span>
                            <span>{ticket.category}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300 font-medium">{ticket.seller?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{ticket.seller?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {new Date(ticket.eventDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">{ticket.venue}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-indigo-400 font-bold">₹{ticket.resalePrice}</div>
                      <div className="text-[10px] text-slate-500 line-through opacity-50">₹{ticket.originalPrice}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {ticket.verificationStatus === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerify(ticket._id, 'approved')}
                            className="p-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl hover:bg-green-500 hover:text-slate-950 transition-all group/btn"
                            title="Approve"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleVerify(ticket._id, 'rejected', 'Does not meet guidelines')}
                            className="p-2 bg-red-500/10 text-red-100 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-slate-950 transition-all"
                            title="Reject"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusColor(ticket.verificationStatus)}`}>
                          {ticket.verificationStatus}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTickets;
