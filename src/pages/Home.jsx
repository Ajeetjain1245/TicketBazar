import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Search, Shield, MessageCircle, ArrowRight, Star, Calendar, MapPin, Music, Film, Plane, Bus } from 'lucide-react';
import { ticketsAPI } from '../utils/api';
import TicketCard from '../components/TicketCard';

const Home = () => {
  const [featuredTickets, setFeaturedTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedTickets();
  }, []);

  const fetchFeaturedTickets = async () => {
    try {
      const response = await ticketsAPI.getAll({ limit: 6 });
      setFeaturedTickets(response.data.data.tickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Escrow payment system ensures your money is safe until you receive your tickets.',
    },
    {
      icon: MessageCircle,
      title: 'Real-time Chat',
      description: 'Chat directly with sellers to ask questions and negotiate before buying.',
    },
    {
      icon: Star,
      title: 'Verified Sellers',
      description: 'All tickets are verified by our team to prevent fraud and scams.',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Tickets Sold' },
    { value: '5K+', label: 'Happy Users' },
    { value: '99%', label: 'Success Rate' },
    { value: '24/7', label: 'Support' },
  ];

  // Floating ticket cards data
  const floatingTickets = [
    {
      id: 1,
      icon: Music,
      gradient: 'from-indigo-600 to-indigo-800',
      bandColor: 'bg-indigo-500',
      title: 'Premium Concert',
      date: 'Dec 15, 2025',
      location: 'VIP Area',
      price: '₹4,500',
      rotate: '-6deg',
      top: '30px',
      left: '40px',
      animation: 'animate-ticket-float-1',
    },
    {
      id: 2,
      icon: Film,
      gradient: 'from-slate-800 to-slate-900',
      bandColor: 'bg-indigo-500',
      title: 'IMAX Premiere',
      date: 'Dec 20, 2025',
      location: 'Luxury Row',
      price: '₹899',
      rotate: '-2deg',
      top: '15px',
      left: '20px',
      animation: 'animate-ticket-float-2',
    },
    {
      id: 3,
      icon: Plane,
      gradient: 'from-indigo-500 to-indigo-700',
      bandColor: 'bg-slate-950',
      title: 'Golden Class',
      date: 'Jan 05, 2026',
      location: 'Exclusive',
      price: '₹24,500',
      rotate: '1deg',
      top: '0',
      left: '0',
      animation: 'animate-ticket-float-3',
    },
  ];

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Gradient Orbs - Refined to Golden theme */}
        <div className="orb orb-gold w-[600px] h-[600px] -top-[200px] -right-[100px] opacity-40" />
        <div className="orb orb-gold w-[500px] h-[500px] -bottom-[100px] -left-[150px] animate-float-delayed opacity-20" />
        <div className="orb orb-gold w-[300px] h-[300px] top-[40%] right-[20%] animate-float-delayed-2 opacity-30" />

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="max-w-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-sm font-medium text-indigo-400 mb-8 animate-fade-up">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse-dot" />
                Live Events & Experiences
              </div>

              {/* Heading */}
              <h1 className="text-5xl lg:text-7xl font-display font-extrabold leading-none mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                Buy & Sell <br />
                <em className="not-italic text-indigo-400 relative inline-block">
                  Tickets
                  <span className="absolute bottom-1 left-0 right-0 h-1 bg-indigo-500 rounded-sm origin-left animate-line-grow" />
                </em>
              </h1>

              {/* Description */}
              <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-md animate-fade-up" style={{ animationDelay: '0.2s' }}>
                The trusted marketplace for tickets. Find great deals on bus, flight, event, and movie tickets from verified sellers.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <Link to="/tickets" className="btn-primary text-base px-8 py-4">
                  <Search className="h-5 w-5 mr-2" />
                  Browse Tickets
                </Link>
                <Link to="/signup" className="btn-outline text-base px-8 py-4">
                  Start Selling
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </div>

            {/* Hero Visual - Floating Tickets */}
            <div className="hidden lg:block relative h-[500px] animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="relative w-[320px] h-[440px] mx-auto">
                {floatingTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`absolute w-[280px] ticket-glass p-6 ${ticket.animation}`}
                    style={{
                      top: ticket.top,
                      left: ticket.left,
                      transform: `rotate(${ticket.rotate})`,
                    }}
                  >
                    {/* Ticket Image */}
                    <div className={`w-full h-[120px] rounded-xl bg-gradient-to-br ${ticket.gradient} mb-4 flex items-center justify-center relative overflow-hidden`}>
                      <ticket.icon className="h-10 w-10 text-white/80" />
                      <div className={`absolute top-0 right-0 bottom-0 w-1 ${ticket.bandColor}`} />
                    </div>

                    {/* Ticket Content */}
                    <div className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-1">
                      Event Ticket
                    </div>
                    <div className="font-display font-bold text-lg mb-3 text-slate-100">
                      {ticket.title}
                    </div>

                    {/* Meta */}
                    <div className="flex gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {ticket.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {ticket.location}
                      </span>
                    </div>

                    {/* Perforation */}
                    <div className="perforation" />

                    {/* Price & QR */}
                    <div className="flex justify-between items-center mt-3">
                      <div>
                        <div className="text-xs text-slate-400">Price</div>
                        <div className="font-display font-bold text-xl text-indigo-400">{ticket.price}</div>
                      </div>
                      <div className="w-10 h-10 bg-white/10 rounded-md grid grid-cols-5 gap-0.5 p-1">
                        {[...Array(25)].map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-sm ${Math.random() > 0.4 ? 'bg-white/60' : 'bg-transparent'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-slate-900/30 backdrop-blur-sm border-y border-slate-800/50">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-display font-bold text-indigo-400">{stat.value}</div>
                <div className="text-slate-400 mt-1 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tickets */}
      <section className="section relative">
        <div className="container-custom relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-slate-100">Featured Tickets</h2>
              <p className="text-slate-400 mt-2">Great deals handpicked for you</p>
            </div>
            <Link to="/tickets" className="btn-outline hidden sm:flex">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card h-80 animate-pulse">
                  <div className="h-48 bg-slate-800" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-700 rounded w-3/4" />
                    <div className="h-4 bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredTickets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTickets.map((ticket) => (
                <TicketCard key={ticket._id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Ticket className="h-16 w-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">No tickets available at the moment</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/tickets" className="btn-outline">
              View All Tickets
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-slate-900/30 backdrop-blur-sm border-y border-slate-800/50 relative">
        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-slate-100 mb-4">Why Choose Ticket Bazar?</h2>
            <p className="text-slate-400">
              We provide a secure and trusted platform for buying and selling tickets with features designed to protect both buyers and sellers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-8 text-center group">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-500/20 transition-colors">
                  <feature.icon className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-100 mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-indigo-500/5" />
        
        <div className="container-custom text-center relative z-10">
          <h2 className="text-3xl lg:text-5xl font-display font-bold text-slate-100 mb-4">Ready to Get Started?</h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust Ticket Bazar for their ticket needs. Sign up today and start buying or selling tickets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary text-lg px-8 py-4">
              Create Account
            </Link>
            <Link to="/tickets" className="btn-outline text-lg px-8 py-4">
              Browse Tickets
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
