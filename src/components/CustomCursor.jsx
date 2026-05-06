import { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const hasPointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasPointer) return;

    setIsVisible(true);

    // Direct DOM manipulation — no React re-render, zero latency
    const updatePosition = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px';
        cursorRef.current.style.top = e.clientY + 'px';
      }
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', updatePosition, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    const addListeners = (el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    };
    const removeListeners = (el) => {
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };

    const selector = 'a, button, [role="button"], input, textarea, select, [data-cursor-hover]';
    document.querySelectorAll(selector).forEach(addListeners);

    const observer = new MutationObserver(() => {
      document.querySelectorAll(selector).forEach((el) => {
        removeListeners(el);
        addListeners(el);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.querySelectorAll(selector).forEach(removeListeners);
      observer.disconnect();
    };
  }, []);

  if (!isVisible) return null;

  const size = isHovering ? 40 : 32;
  const scale = isClicking ? 0.85 : 1;

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-[9999]"
      style={{
        /* position is set directly via DOM — no transition on left/top */
        willChange: 'left, top',
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${isHovering ? -15 : -30}deg)`,
        transition: 'transform 0.12s ease-out, width 0.15s, height 0.15s, filter 0.15s',
        width: size,
        height: size,
        filter: isHovering
          ? 'drop-shadow(0 0 10px rgba(255,193,7,0.6))'
          : 'drop-shadow(0 0 4px rgba(255,193,7,0.3))',
      }}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <path
          d="M8 14C8 11.79 9.79 10 12 10H52C54.21 10 56 11.79 56 14V25C53.24 25 51 27.24 51 30C51 32.76 53.24 35 56 35V46C56 48.21 54.21 50 52 50H12C9.79 50 8 48.21 8 46V35C10.76 35 13 32.76 13 30C13 27.24 10.76 25 8 25V14Z"
          fill="url(#ticketGrad)"
          stroke="#fd7e14"
          strokeWidth="1.5"
        />
        <line x1="40" y1="14" x2="40" y2="50" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6"/>
        <path d="M48 28L49.2 31.1L52.5 31.3L49.9 33.5L50.7 36.7L48 34.9L45.3 36.7L46.1 33.5L43.5 31.3L46.8 31.1L48 28Z" fill="#1e293b" opacity="0.7"/>
        <rect x="14" y="19" width="18" height="2.5" rx="1.25" fill="#1e293b" opacity="0.35"/>
        <rect x="14" y="25" width="14" height="2" rx="1" fill="#1e293b" opacity="0.25"/>
        <rect x="14" y="30" width="16" height="2" rx="1" fill="#1e293b" opacity="0.25"/>
        <rect x="14" y="35" width="12" height="2" rx="1" fill="#1e293b" opacity="0.2"/>
        <g opacity="0.3">
          <rect x="14" y="41" width="1.5" height="5" rx="0.5" fill="#1e293b"/>
          <rect x="17" y="41" width="2.5" height="5" rx="0.5" fill="#1e293b"/>
          <rect x="21" y="41" width="1" height="5" rx="0.5" fill="#1e293b"/>
          <rect x="23.5" y="41" width="2" height="5" rx="0.5" fill="#1e293b"/>
          <rect x="27" y="41" width="1.5" height="5" rx="0.5" fill="#1e293b"/>
          <rect x="30" y="41" width="2.5" height="5" rx="0.5" fill="#1e293b"/>
          <rect x="34" y="41" width="1" height="5" rx="0.5" fill="#1e293b"/>
        </g>
        <defs>
          <linearGradient id="ticketGrad" x1="8" y1="10" x2="56" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffc107"/>
            <stop offset="1" stopColor="#fd7e14"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default CustomCursor;
