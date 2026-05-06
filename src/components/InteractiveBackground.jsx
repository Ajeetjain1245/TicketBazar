import { useEffect, useRef } from 'react';

const InteractiveBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    let W, H;
    let particles = [];
    let starField = [];
    let t = 0;
    
    // Safely get window dimensions even on initial load
    const getWindowSize = () => ({
      w: typeof window !== 'undefined' ? window.innerWidth : 1000,
      h: typeof window !== 'undefined' ? window.innerHeight : 800
    });
    
    let { w, h } = getWindowSize();
    let mouse = { x: w / 2, y: h / 2 };

    const resize = () => {
      const size = getWindowSize();
      W = canvas.width = size.w;
      H = canvas.height = size.h;
    };
    
    const initParticles = () => {
      particles = [];
      const count = Math.floor(W / 14);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.5 + Math.random() * 1.7, // randBetween(0.5, 2.2)
          vx: (Math.random() - 0.5) * 0.3, // roughly randBetween(-0.15, 0.15)
          vy: -(Math.random() * 0.35 + 0.05), // randBetween(-0.4, -0.05)
          alpha: 0.1 + Math.random() * 0.45, // randBetween(0.1, 0.55),
          gold: Math.random() > 0.75,
        });
      }
      starField = [];
      for (let i = 0; i < 90; i++) {
        starField.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.3 + Math.random() * 0.9, // randBetween(0.3, 1.2)
          alpha: 0.05 + Math.random() * 0.25, // randBetween(0.05, 0.3)
          twinkle: 0.003 + Math.random() * 0.007, // randBetween(0.003, 0.01)
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    resize();
    initParticles();
    
    const handleResize = () => {
      resize();
      initParticles();
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const lights = [
      { x: W * 0.15, ang: -0.3, speed: 0.003, hue: 'rgba(232,195,106,', width: 200 },
      { x: W * 0.5,  ang:  0.1, speed: 0.004, hue: 'rgba(200,200,255,', width: 160 },
      { x: W * 0.85, ang:  0.4, speed: 0.0025, hue: 'rgba(232,195,106,', width: 200 },
    ];

    const animate = () => {
      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const bg = ctx.createRadialGradient(W/2, H*0.3, 0, W/2, H*0.3, H);
      bg.addColorStop(0, '#130F1E');
      bg.addColorStop(1, '#07060C');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Spotlights
      lights.forEach((l, i) => {
        l.ang += Math.sin(t * l.speed + i) * 0.006;
        const endX = l.x + Math.sin(l.ang) * H * 0.8;
        const endY = H * 0.85;
        const grad = ctx.createLinearGradient(l.x, -40, endX, endY);
        grad.addColorStop(0, l.hue + '0.08)');
        grad.addColorStop(1, l.hue + '0)');
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(l.x - l.width/2, -40);
        ctx.lineTo(l.x + l.width/2, -40);
        ctx.lineTo(endX + l.width * 1.8, endY);
        ctx.lineTo(endX - l.width * 1.8, endY);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      });

      // Stars
      starField.forEach(s => {
        s.phase += s.twinkle;
        const a = s.alpha * (0.5 + 0.5 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,240,220,${a})`;
        ctx.fill();
      });

      // Particles
      particles.forEach(p => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 200) {
          p.vx += dx * 0.00005;
          p.vy += dy * 0.00005;
        }
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        if (p.x < -5) p.x = W + 5;
        if (p.x > W + 5) p.x = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(232,195,106,${p.alpha})`
          : `rgba(245,242,236,${p.alpha * 0.5})`;
        ctx.fill();
      });

      // Central glow
      const glow = ctx.createRadialGradient(W/2, H*0.35, 0, W/2, H*0.35, W*0.4);
      glow.addColorStop(0, 'rgba(232,195,106,0.05)');
      glow.addColorStop(1, 'rgba(232,195,106,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      t++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
      {/* Fallback dark background */}
      <div className="absolute inset-0 bg-[#07060C]"></div>
      
      {/* Canvas for the particles and spotlights */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Noise Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px',
          zIndex: 1
        }}
      ></div>

      {/* Gradient Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(7,6,12,0.7) 100%)',
          zIndex: 2
        }}
      ></div>
    </div>
  );
};

export default InteractiveBackground;
