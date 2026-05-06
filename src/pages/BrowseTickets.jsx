import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RefreshCcw } from 'lucide-react';
import { ticketsAPI } from '../utils/api';
import TicketCard from '../components/TicketCard';
import useSocketStore from '../context/socketStore';

const BrowseTickets = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
  });

  const { socket } = useSocketStore();

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  useEffect(() => {
    if (socket) {
      const handleNewListing = () => {
        // Automatically refresh data when a new ticket is approved
        fetchTickets();
      };
      socket.on('new_listing', handleNewListing);
      return () => socket.off('new_listing', handleNewListing);
    }
  }, [socket]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const { sortBy, ...restFilters } = filters;
      
      // Map frontend sort options to backend parameters
      let apiSortBy = 'createdAt';
      let apiSortOrder = 'desc';

      if (sortBy === 'price_low') {
        apiSortBy = 'resalePrice';
        apiSortOrder = 'asc';
      } else if (sortBy === 'price_high') {
        apiSortBy = 'resalePrice';
        apiSortOrder = 'desc';
      } else if (sortBy === 'event_date') {
        apiSortBy = 'eventDate';
        apiSortOrder = 'asc';
      }

      const params = {
        ...Object.fromEntries(
          Object.entries(restFilters).filter(([_, v]) => v !== '')
        ),
        sortBy: apiSortBy,
        sortOrder: apiSortOrder
      };

      const response = await ticketsAPI.getAll(params);
      setTickets(response.data.data.tickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const ticketTypes = [
    { value: '', label: 'All Types' },
    { value: 'bus', label: 'Bus' },
    { value: 'flight', label: 'Flight' },
    { value: 'event', label: 'Event' },
    { value: 'movie', label: 'Movie' },
    { value: 'concert', label: 'Concert' },
    { value: 'sports', label: 'Sports' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-100 font-display uppercase tracking-tight">Browse Tickets</h1>
          <p className="text-slate-400 mt-3 text-lg">Find the best deals on verified premium tickets</p>
        </div>

        {/* Filters Panel */}
        <div className="space-y-6 mb-12">
          {/* Main Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by event, artist, or venue..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-3xl px-14 py-5 text-slate-100 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600 font-medium"
              />
            </div>
            
            {/* Sort & Price Controls */}
            <div className="flex gap-4">
              <div className="relative min-w-[160px]">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-5 text-slate-100 focus:outline-none focus:border-indigo-500/50 transition-colors appearance-none font-medium text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="event_date">Event Date</option>
                </select>
                <Filter className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              </div>
              
              <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-4">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-20 bg-transparent py-2 text-slate-200 focus:outline-none text-sm font-medium"
                />
                <span className="text-slate-700">|</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-20 bg-transparent py-2 text-slate-200 focus:outline-none text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {ticketTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleFilterChange('type', type.value)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  filters.type === type.value
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-500/50'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card h-80 animate-pulse">
                <div className="h-48 bg-slate-800" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-700 rounded w-3/4" />
                  <div className="h-4 bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : tickets.length > 0 ? (
          <>
            <p className="text-slate-400 mb-4">{tickets.length} tickets found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tickets.map((ticket) => (
                <TicketCard key={ticket._id} ticket={ticket} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <SlidersHorizontal className="h-16 w-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-100 mb-2">No tickets found</h3>
            <p className="text-slate-400">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseTickets;
