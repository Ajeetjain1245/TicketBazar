import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket, Search, Shield, MessageCircle, ArrowRight, Star, 
  Calendar, MapPin, Music, Film, Plane, Bus, Zap, Lock, 
  Smartphone, RefreshCcw, Globe, CheckCircle
} from 'lucide-react';
import { ticketsAPI } from '../utils/api';
import TicketCard from '../components/TicketCard';
import useSocketStore from '../context/socketStore';

const Home = () => {
  const [featuredTickets, setFeaturedTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocketStore();
  const heroRef = useRef(null);
  
  // Canvas refs
  const canvasRef = useRef(null);
  
  useEffect(() => {
    fetchFeaturedTickets();
    setupCanvas();
    
    // Scroll listener for progress bar and parallax
    const handleScroll = () => {
      // Update progress bar
      const progressBar = document.getElementById('progress-bar');
      if (progressBar) {
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (window.scrollY / maxScroll) * 100;
        progressBar.style.width = `${scrollPercent}%`;
      }
      
      // Parallax effect for hero
      const heroSticky = document.getElementById('hero-sticky');
      if (heroSticky) {
        const scrolled = window.scrollY;
        if (scrolled < 800) {
          heroSticky.style.transform = `translateY(${scrolled * 0.3}px)`;
          heroSticky.style.opacity = 1 - (scrolled / 800);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewListing = () => {
        fetchFeaturedTickets();
      };
      socket.on('new_listing', handleNewListing);
      return () => socket.off('new_listing', handleNewListing);
    }
  }, [socket]);
  
  useEffect(() => {
    // Hero entrance animations
    const timeouts = [
      setTimeout(() => {
        document.getElementById('hero-eyebrow')?.classList.add('in');
      }, 300),
      setTimeout(() => {
        document.getElementById('hl1')?.classList.add('in');
      }, 600),
      setTimeout(() => {
        document.getElementById('hl2')?.classList.add('in');
      }, 760),
      setTimeout(() => {
        document.getElementById('hl3')?.classList.add('in');
      }, 920),
      setTimeout(() => {
        document.getElementById('hero-sub')?.classList.add('in');
      }, 1100),
      setTimeout(() => {
        document.getElementById('hero-actions')?.classList.add('in');
      }, 1300),
    ];
    
    return () => timeouts.forEach(clearTimeout);
  }, []);
  
  // Stats animation observer
  useEffect(() => {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        
        const statElements = document.querySelectorAll('.stat-item');
        statElements.forEach((el, idx) => {
          setTimeout(() => {
            el.classList.add('in');
            // Animate numbers
            const numEl = el.querySelector('.stat-num');
            if (numEl) {
              const targetText = numEl.textContent;
              const targetNum = parseInt(targetText.replace(/\D/g, ''));
              const suffix = targetText.replace(/[0-9]/g, '');
              
              let current = 0;
              const increment = targetNum / 60;
              const timer = setInterval(() => {
                current += increment;
                if (current >= targetNum) {
                  current = targetNum;
                  clearInterval(timer);
                }
                numEl.innerHTML = Math.round(current) + (suffix.includes('%') ? '%' : '+');
              }, 20);
            }
          }, idx * 120);
        });
        
        statsObserver.disconnect();
      },
      { threshold: 0.4 }
    );
    
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) statsObserver.observe(statsSection);
    
    return () => statsObserver.disconnect();
  }, []);
  
  // Features observer
  useEffect(() => {
    const featureObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const delay = parseFloat(entry.target.dataset.delay || 0) * 120;
          setTimeout(() => entry.target.classList.add('in'), delay);
        });
      },
      { threshold: 0.15 }
    );
    
    document.querySelectorAll('.feat-card').forEach((el) => featureObserver.observe(el));
    
    return () => featureObserver.disconnect();
  }, []);
  
  // General reveal on scroll observer
  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );
    
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => revealObserver.observe(el));
    
    return () => revealObserver.disconnect();
  }, []);
  
  // Horizontal scroll animation
  useEffect(() => {
    const hscrollWrap = document.getElementById('hscroll-wrap');
    const hscrollTrack = document.getElementById('hscroll-track');
    const hscrollDots = document.getElementById('hscroll-dots');
    const hscrollLabel = document.querySelector('.hscroll-label');
    
    if (!hscrollWrap || !hscrollTrack) return;
    
    const handleHScroll = () => {
      const rect = hscrollWrap.getBoundingClientRect();
      
      if (rect.bottom > 0 && rect.top < window.innerHeight * 2) {
        const scrolled = Math.max(0, -rect.top);
        const total = hscrollWrap.offsetHeight - window.innerHeight;
        const p = Math.min(1, Math.max(0, scrolled / Math.max(1, total)));
        
        // Horizontal scroll for cards
        const cardW = 364; // card width + gap
        const maxShift = (7 - 2.2) * cardW; // 7 events - 2.2 visible
        hscrollTrack.style.transform = `translateX(-${p * maxShift}px)`;
        
        // Parallax effect for heading
        if (hscrollLabel) {
          hscrollLabel.style.transform = `translateY(${scrolled * 0.15}px)`;
          hscrollLabel.style.opacity = 1 - (p * 0.4);
        }
        
        // Update dots
        const allDots = hscrollDots?.querySelectorAll('.hdot');
        if (allDots) {
          const active = Math.round(p * (7 - 1));
          allDots.forEach((d, i) => {
            d.classList.toggle('active', i === active);
          });
        }
      }
    };
    
    window.addEventListener('scroll', handleHScroll);
    return () => window.removeEventListener('scroll', handleHScroll);
  }, []);
  
  // Text scrub animation
  useEffect(() => {
    const scrubWrap = document.getElementById('scrub-wrap');
    const scrubText = document.getElementById('scrub-text');
    
    if (!scrubWrap || !scrubText) return;
    
    // Populate scrub words
    const scrubWords = [
      {w: 'Every', g: false}, {w: 'great', g: false}, {w: 'night', g: false}, {w: 'starts', g: false}, {w: 'with', g: false},
      {w: 'one', g: true}, {w: 'decision.', g: true},
      {w: 'Find', g: false}, {w: 'your', g: false}, {w: 'moment,', g: false},
      {w: 'choose', g: false}, {w: 'your', g: false}, {w: 'seat,', g: false},
      {w: 'and', g: false}, {w: 'make', g: false}, {w: 'memories', g: true}, {w: 'that', g: true}, {w: 'last', g: true}, {w: 'forever.', g: true},
    ];
    
    scrubText.innerHTML = scrubWords.map((wd, idx) => {
      // Add line breaks at specific points for better layout
      const lineBreaks = [8, 12, 15]; // After these indices, add <br>
      const wordHtml = `<span class="scrub-word${wd.g ? ' gold-w' : ''}">${wd.w} </span>`;
      return lineBreaks.includes(idx) ? wordHtml + '<br />' : wordHtml;
    }).join('');
    
    const handleScrub = () => {
      const rect = scrubWrap.getBoundingClientRect();
      
      // Only animate when section is in viewport
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const scrolled = Math.max(0, -rect.top);
        const total = scrubWrap.offsetHeight - window.innerHeight;
        const p = Math.min(1, Math.max(0, scrolled / Math.max(1, total)));
        
        // Light up words based on scroll % (NO PARALLAX MOVEMENT)
        const words = scrubText.querySelectorAll('.scrub-word');
        const threshold = p * words.length;
        words.forEach((w, i) => {
          if (i < threshold) w.classList.add('lit');
          else w.classList.remove('lit');
        });
      }
    };
    
    window.addEventListener('scroll', handleScrub);
    return () => window.removeEventListener('scroll', handleScrub);
  }, []);
  
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let particles = [];
    let stars = [];
    let mouse = { x: 0, y: 0 };
    let t = 0;
    
    // Initialize particles
    const init = () => {
      particles = [];
      stars = [];
      
      for (let i = 0; i < Math.floor(canvas.width / 12); i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: 0.6 + Math.random() * 1.4,
          vx: -0.1 + Math.random() * 0.2,
          vy: -0.4 + Math.random() * 0.35,
          alpha: 0.1 + Math.random() * 0.4,
          gold: Math.random() > 0.7
        });
      }
      
      for (let i = 0; i < 80; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: 0.3 + Math.random() * 0.8,
          alpha: 0.05 + Math.random() * 0.2,
          twinkle: 0.003 + Math.random() * 0.006,
          phase: Math.random() * Math.PI * 2
        });
      }
    };
    
    init();
    
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    });
    
    document.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background gradient
      const bg = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.28, 0,
        canvas.width / 2, canvas.height * 0.28, canvas.height
      );
      bg.addColorStop(0, '#130F1E');
      bg.addColorStop(1, '#07060C');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Stars
      stars.forEach(s => {
        s.phase += s.twinkle;
        const a = s.alpha * (0.5 + 0.5 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 240, 220, ${a})`;
        ctx.fill();
      });
      
      // Particles
      particles.forEach(p => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < 200) {
          p.vx += dx * 0.00004;
          p.vy += dy * 0.00004;
        }
        
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.y < -5) {
          p.y = canvas.height + 5;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold 
          ? `rgba(232, 195, 106, ${p.alpha})`
          : `rgba(245, 242, 236, ${p.alpha * 0.4})`;
        ctx.fill();
      });
      
      t++;
      requestAnimationFrame(animate);
    };
    
    animate();
  };
  
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
      icon: Zap,
      title: 'Instant Booking',
      description: 'Reserve your spot in under 30 seconds. No queues, no waiting, no stress.',
    },
    {
      icon: Lock,
      title: 'Secure Payments',
      description: 'Bank-grade encryption on every transaction. Your data stays yours, always.',
    },
    {
      icon: Star,
      title: 'Zero Hidden Fees',
      description: 'The price you see is the price you pay. Transparency builds trust.',
    },
    {
      icon: Smartphone,
      title: 'Mobile Tickets',
      description: 'Your tickets live on your phone. No printing, no paper — just show and go.',
    },
    {
      icon: RefreshCcw,
      title: 'Easy Refunds',
      description: 'Plans change. Get a full refund up to 24 hours before the event.',
    },
    {
      icon: Globe,
      title: 'Global Events',
      description: 'From Mumbai to NYC — 180+ cities, thousands of events at your fingertips.',
    },
  ];
  
  const stats = [
    { value: '12K+', label: 'Events Yearly' },
    { value: '180+', label: 'Cities Covered' },
    { value: '4M', label: 'Happy Fans' },
    { value: '0%', label: 'Hidden Fees' },
  ];
  
  const hotEvents = [
    { emoji: '🎸', genre: 'Rock', name: 'Coldplay Live', date: 'Apr 3 · Wankhede Stadium, Mumbai', price: '₹4,500', bg: 'linear-gradient(135deg,#1a1228,#2a1818)' },
    { emoji: '🎤', genre: 'Pop', name: 'Diljit Dosanjh', date: 'Apr 7 · Jio World Garden, Mumbai', price: '₹3,500', bg: 'linear-gradient(135deg,#0d1a2a,#1a0d2a)' },
    { emoji: '🏀', genre: 'Sports', name: 'IPL 2026 Final', date: 'May 30 · Wankhede Stadium', price: '₹6,500', bg: 'linear-gradient(135deg,#1a1010,#0d1a10)' },
    { emoji: '🎭', genre: 'Theatre', name: 'Hamilton', date: 'Apr 11 · NCPA, Mumbai', price: '₹2,500', bg: 'linear-gradient(135deg,#1a1500,#100a1a)' },
    { emoji: '🎵', genre: 'Festival', name: 'Sunburn 2026', date: 'Dec 28 · Goa', price: '₹3,999', bg: 'linear-gradient(135deg,#0d1a18,#1a0d10)' },
    { emoji: '✈️', genre: 'Travel', name: 'Dubai Flight', date: 'Daily · Mumbai to Dubai', price: '₹18,000', bg: 'linear-gradient(135deg,#050a1a,#1a0520)' },
    { emoji: '🎬', genre: 'Movie', name: 'Avengers IMAX', date: 'Dec 25 · PVR Phoenix', price: '₹900', bg: 'linear-gradient(135deg,#1a1000,#001a10)' },
  ];
  
  return (
    <div className="min-h-screen relative" style={{ background: '#07060C' }}>
      {/* Progress Bar */}
      <div 
        id="progress-bar"
        className="fixed top-0 left-0 h-0.5 z-[999]"
        style={{ 
          width: '0%',
          background: 'linear-gradient(90deg, #E8C36A, #FF9A3C, #FF4545)',
          transition: 'width 0.1s'
        }}
      />
      
      {/* Canvas Background */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" style={{ background: '#07060C' }} />
      
      {/* Noise Overlay */}
      <div 
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px'
        }}
      />
      
      {/* Main Content Wrapper */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section ref={heroRef} id="hero-sticky" className="relative min-h-screen flex items-center overflow-hidden pt-20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[320px] h-[320px] bg-[#E8C36A]/5 rounded-full blur-[120px]" />
          </div>
          
          <div className="container mx-auto px-6 relative">
            <div className="max-w-4xl mx-auto text-center">
              {/* Eyebrow */}
              <div 
                id="hero-eyebrow"
                className="inline-flex items-center gap-3 text-xs uppercase tracking-widest mb-8 opacity-0 translate-y-5 transition-all duration-700"
                style={{ color: '#E8C36A' }}
              >
                <div className="w-9 h-px" style={{ background: '#E8C36A' }} />
                The World's Most Trusted Ticket Marketplace
                <div className="w-9 h-px" style={{ background: '#E8C36A' }} />
                <div className="flex items-center gap-2 bg-[#FF4545]/14 border border-[#FF4545]/30 rounded-full px-3 py-1 text-[#FF4545] text-[10px] tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF4545] animate-pulse" />
                  LIVE
                </div>
              </div>
              
              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.88] tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                <span className="block overflow-hidden">
                  <span 
                    id="hl1"
                    className="block transform translate-y-[110%] transition-transform duration-1000 cubic-bezier(0.16,1,0.3,1)"
                  >
                    Your Next
                  </span>
                </span>
                <span className="block overflow-hidden">
                  <span 
                    id="hl2"
                    className="block transform translate-y-[110%] transition-transform duration-1000 cubic-bezier(0.16,1,0.3,1) delay-120"
                    style={{ color: '#E8C36A' }}
                  >
                    Unforgettable
                  </span>
                </span>
                <span className="block overflow-hidden">
                  <span 
                    id="hl3"
                    className="block transform translate-y-[110%] transition-transform duration-1000 cubic-bezier(0.16,1,0.3,1) delay-240"
                  >
                    Night Starts Here
                  </span>
                </span>
              </h1>
              
              {/* Subtitle */}
              <p 
                id="hero-sub"
                className="text-sm sm:text-base md:text-lg lg:text-xl font-light text-white/42 max-w-2xl mx-auto mb-12 leading-relaxed opacity-0 translate-y-6 transition-all duration-900 delay-500"
              >
                Discover concerts, sports, travel, and entertainment.<br />
                Buy & sell tickets securely — no hidden fees, ever.
              </p>
              
              {/* Actions */}
              <div 
                id="hero-actions"
                className="flex flex-col sm:flex-row gap-3 justify-center items-center opacity-0 translate-y-6 transition-all duration-900 delay-700"
              >
                <Link to="/tickets" className="font-bold text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-12 py-3 sm:py-4 rounded-full hover:scale-105 transition-transform shadow-lg" style={{ fontFamily: 'Syne, sans-serif', background: '#E8C36A', color: '#07060C' }}>
                  Explore Events
                </Link>
                <Link to="/signup" className="text-xs sm:text-sm font-medium text-white/60 flex items-center gap-2 hover:text-white transition-colors no-underline">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 border border-white/10 rounded-full flex items-center justify-center text-xs">▶</div>
                  Start Selling
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="stats-section reveal-on-scroll relative py-20 px-6 border-t border-white/10 backdrop-blur-xl" style={{ background: 'rgba(7, 6, 12, 0.5)' }}>
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
              {stats.map((stat, idx) => (
                <div 
                  key={idx}
                  className="stat-item text-center p-8 border-r border-white/10 last:border-r-0 opacity-0 translate-y-10 transition-all duration-700"
                  data-delay={idx * 0.12}
                >
                  <div className="stat-num text-5xl md:text-6xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: '#F5F2EC' }}>
                    {stat.value.includes('%') ? (
                      stat.value
                    ) : (
                      <span dangerouslySetInnerHTML={{ 
                        __html: stat.value.replace(/\d+/g, match => `<b style="color:#E8C36A">${match}</b>`)
                      }} />
                    )}
                  </div>
                  <div className="text-xs uppercase tracking-widest text-white/42">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Hot Events Marquee */}
        <section className="relative py-3 md:py-4 border-t border-b border-white/10 overflow-hidden backdrop-blur-xl" style={{ background: 'rgba(232, 195, 106, 0.03)' }}>
          <div className="flex gap-8 md:gap-14 whitespace-nowrap animate-marquee">
            {[...hotEvents, ...hotEvents].map((event, idx) => (
              <div 
                key={idx}
                className="inline-flex items-center gap-3 md:gap-5 text-base sm:text-lg md:text-xl uppercase tracking-widest"
                style={{ fontFamily: 'Syne, sans-serif', color: idx % 4 === 0 ? '#E8C36A' : 'rgba(245,242,236,0.42)' }}
              >
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full flex-shrink-0" style={{ background: '#E8C36A' }} />
                {event.name.toUpperCase()}
              </div>
            ))}
          </div>
        </section>
        
        {/* Featured Tickets */}
        <section className="py-24 px-6 reveal-on-scroll">
          <div className="container mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Featured Tickets
                </h2>
                <p className="text-sm sm:text-base text-white/42">Great deals handpicked for you</p>
              </div>
              <Link to="/tickets" className="text-xs sm:text-sm font-semibold uppercase tracking-wide px-4 sm:px-6 py-2 sm:py-3 border border-[#E8C36A]/45 rounded-full text-[#E8C36A] bg-transparent hover:bg-[#E8C36A] hover:text-[#07060C] transition-all no-underline">
                View All →
              </Link>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 rounded-2xl bg-white/5 animate-pulse" />
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
                <Ticket className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/42">No tickets available at the moment</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Horizontal Scroll Section */}
        <div id="hscroll-wrap" className="hscroll-wrap relative z-10">
          <div className="hscroll-sticky">
            <div className="hscroll-label px-6 md:px-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white reveal-on-scroll" style={{ fontFamily: 'Syne, sans-serif' }}>
                Hot Right Now
              </h2>
              <div className="text-xs sm:text-sm text-white/42 uppercase tracking-wider flex items-center gap-2 reveal-on-scroll">
                Scroll to explore
                <span className="animate-pulse">→</span>
              </div>
            </div>
            <div className="hscroll-track-outer pl-6 md:pl-16 overflow-visible">
              <div id="hscroll-track" className="flex gap-6 will-change-transform">
                {hotEvents.map((event, idx) => (
                  <div key={idx} className="event-card flex-shrink-0 w-[340px] border border-white/10 rounded-[22px] overflow-hidden cursor-pointer hover:border-[#E8C36A]/30 hover:-translate-y-1.5 transition-all duration-300"
                    style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)' }}
                  >
                    <div className="event-banner h-[180px] flex items-center justify-center text-7xl relative" style={{ background: event.bg }}>
                      {event.emoji}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#07060C]/75" />
                    </div>
                    <div className="event-body p-5 md:p-6">
                      <div className="event-genre text-[10px] sm:text-xs uppercase tracking-widest text-[#E8C36A] mb-1 font-semibold">
                        {event.genre}
                      </div>
                      <div className="event-name text-xl sm:text-2xl font-bold mb-1.5 text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                        {event.name}
                      </div>
                      <div className="event-meta text-xs sm:text-sm text-white/42 mb-4 leading-relaxed">
                        {event.date}
                      </div>
                      <div className="event-footer flex items-center justify-between">
                        <div className="event-price text-2xl sm:text-3xl font-bold text-[#E8C36A]" style={{ fontFamily: 'Syne, sans-serif' }}>
                          <small className="text-[10px] sm:text-xs block font-normal text-white/42">from</small>
                          {event.price}
                        </div>
                        <button className="event-btn text-[10px] sm:text-xs font-semibold uppercase tracking-wide px-4 sm:px-5 py-2 border border-[#E8C36A]/25 rounded-full text-[#E8C36A] bg-[#E8C36A]/10 hover:bg-[#E8C36A] hover:text-[#07060C] transition-all">
                          Get Tickets
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div id="hscroll-dots" className="hscroll-dots flex gap-2 justify-center mt-7">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`hdot w-6 h-0.5 rounded bg-white/10 transition-all duration-300 ${i === 0 ? 'active bg-[#E8C36A] w-10' : ''}`} />
              ))}
            </div>
          </div>
        </div>
        
        {/* Text Scrub Section */}
        <div id="scrub-wrap" className="text-scrub-wrap relative z-10">
          <div className="text-scrub-sticky px-6 md:px-16">
            <p id="scrub-text" className="scrub-text text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-relaxed text-center max-w-[960px] mx-auto" style={{ fontFamily: 'Syne, sans-serif' }}>
              {/* Words will be injected by useEffect */}
            </p>
          </div>
        </div>
        
 {/* Features Grid */}
        <section className="features-section reveal-on-scroll py-24 px-6 backdrop-blur-xl border-t border-white/10" style={{ background: 'rgba(7, 6, 12, 0.4)' }}>
          <div className="container mx-auto">
            <div className="text-center max-w-4xl mx-auto mb-16">
              <div className="inline-block text-[10px] sm:text-xs uppercase tracking-widest border border-[#E8C36A]/30 rounded-full px-4 sm:px-5 py-2 mb-6" style={{ color: '#E8C36A' }}>
                Why Ticket Bazar?
              </div>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-[0.95] mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#F5F2EC' }}>
                Everything You Need<br />For The Perfect Experience
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="feat-card p-10 rounded-2xl opacity-0 translate-y-12 scale-[0.96] transition-all duration-700 border border-white/10 hover:border-[#E8C36A]/20"
                  style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)' }}
                  data-delay={idx * 0.12}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(232,195,106,0.08)' }}>
                    <feature.icon className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: '#E8C36A' }} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ fontFamily: 'Syne, sans-serif', color: '#F5F2EC' }}>{feature.title}</h3>
                  <p className="text-sm sm:text-base leading-relaxed text-white/42">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-32 px-6 text-center border-t border-white/10 reveal-on-scroll relative overflow-hidden backdrop-blur-xl" style={{ background: 'rgba(7, 6, 12, 0.5)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#E8C36A]/5 via-transparent to-indigo-500/5" />
          <div className="relative">
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-10 leading-[0.9]" style={{ fontFamily: 'Syne, sans-serif', color: '#F5F2EC' }}>
              Don't Miss<br /><em className="not-italic" style={{ color: '#E8C36A' }}>The Moment</em>
            </h2>
            <Link to="/tickets" className="inline-block font-bold text-base sm:text-xl px-8 sm:px-12 md:px-16 py-4 sm:py-5 rounded-full hover:scale-105 transition-transform shadow-lg" style={{ fontFamily: 'Syne, sans-serif', background: '#E8C36A', color: '#07060C' }}>
              Browse All Events
            </Link>
            <p className="text-xs sm:text-sm text-white/42 mt-6">Over 4 million tickets sold this month alone.</p>
          </div>
        </section>
        
        {/* Footer Mini */}
        <footer className="py-6 sm:py-8 px-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-white/42 gap-4 sm:gap-0">
          <div className="text-base sm:text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#F5F2EC' }}>
            TICKET<span style={{ color: '#E8C36A' }}>BAZAR</span>
          </div>
          <span>© 2026 Ticket Bazar. All rights reserved.</span>
          <span className="flex items-center gap-2" style={{ color: '#E8C36A' }}>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            No Hidden Fees. Ever.
          </span>
        </footer>
      </div>
    </div>
  );
};

export default Home;
