import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketsAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const EditTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'event',
    category: 'entertainment',
    originalPrice: '',
    resalePrice: '',
    eventDate: '',
    eventTime: '',
    venue: '',
    quantity: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await ticketsAPI.getById(id);
        const ticket = response.data.data.ticket;
        setFormData({
          title: ticket.title || '',
          description: ticket.description || '',
          type: ticket.type || 'event',
          category: ticket.category || 'entertainment',
          originalPrice: ticket.originalPrice || '',
          resalePrice: ticket.resalePrice || '',
          eventDate: ticket.eventDate ? new Date(ticket.eventDate).toISOString().split('T')[0] : '',
          eventTime: ticket.eventTime || '',
          venue: ticket.venue || '',
          quantity: ticket.quantity || 1,
        });
      } catch (error) {
        toast.error('Failed to load ticket data');
        navigate('/dashboard/tickets');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTicket();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await ticketsAPI.update(id, formData);
      toast.success('Ticket updated successfully');
      navigate('/dashboard/tickets');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update ticket');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-400" />
        </button>
        <h1 className="text-2xl font-bold text-slate-100 font-display">Edit Ticket Listing</h1>
      </div>

      <div className="p-8 rounded-2xl border border-slate-700 bg-slate-800/30 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ticket Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:border-indigo-500 outline-none transition-all"
                placeholder="e.g. Coldplay VIP Pass"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Event Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="concert">Concert</option>
                <option value="sports">Sports</option>
                <option value="movie">Movie</option>
                <option value="flight">Flight</option>
                <option value="bus">Bus</option>
                <option value="train">Train</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:border-indigo-500 outline-none transition-all"
                placeholder="Tell buyers about the seat location, perks, etc."
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Resale Price (INR)</label>
              <input
                type="number"
                name="resalePrice"
                value={formData.resalePrice}
                onChange={handleChange}
                required
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:border-indigo-500 outline-none transition-all font-display font-bold text-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Event Date</label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                required
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2 text-amber-500 text-xs font-medium">
              <AlertCircle className="h-4 w-4" />
              <span>Editing will trigger a re-verification check.</span>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="sell-cta flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : <><Save className="h-5 w-5" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTicket;
