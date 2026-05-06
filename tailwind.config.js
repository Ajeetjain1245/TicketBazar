/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Professional Slate & Indigo Palette -> Mapped to Golden & Black Theme
        slate: {
          50: '#FFFFFF',
          100: '#F5F2EC', // Main cream text
          200: '#EAE5D9',
          300: 'rgba(245, 242, 236, 0.8)', // Lighter muted
          400: 'rgba(245, 242, 236, 0.6)', // Muted text
          500: 'rgba(245, 242, 236, 0.4)', // Dim text
          600: 'rgba(255, 255, 255, 0.15)', // Borders hover
          700: 'rgba(255, 255, 255, 0.08)', // Borders subtle
          800: '#14131A', // Card background 
          900: '#0A0910', // Darker backgrounds
          950: '#07060C', // Deepest background
        },
        indigo: {
          50: '#FFF9E6',
          100: '#FFEDBF',
          200: '#FFDF99',
          300: '#FFD173',
          400: '#FF9A3C', // Gold gradient
          500: '#E8C36A', // Primary Gold
          600: '#D4AF57', // Primary dark
          700: '#B08D3E',
          800: '#8C6E2D',
          900: '#634C1A',
          950: '#3D2F0D',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        // Legacy aliases for backward compatibility
        ink: '#0f172a',
        cream: '#f8fafc',
        gold: {
          DEFAULT: '#f59e0b',
          dark: '#d97706',
          light: '#fbbf24',
        },
        teal: {
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        glass: 'rgba(255,255,255,0.07)',
        'glass-border': 'rgba(255,255,255,0.12)',
        primary: {
          50: '#FFF9E6',
          100: '#FFEDBF',
          200: '#FFDF99',
          300: '#FFD173',
          400: '#FF9A3C', // Gold gradient
          500: '#E8C36A', // Primary Gold
          600: '#D4AF57', // Primary dark
          700: '#B08D3E',
          800: '#8C6E2D',
          900: '#634C1A',
          950: '#3D2F0D',
        },
        secondary: {
          50: '#FFFFFF',
          100: '#F5F2EC', // Main cream text
          200: '#EAE5D9',
          300: 'rgba(245, 242, 236, 0.8)', // Lighter muted
          400: 'rgba(245, 242, 236, 0.6)', // Muted text
          500: 'rgba(245, 242, 236, 0.4)', // Dim text
          600: 'rgba(255, 255, 255, 0.15)', // Borders hover
          700: 'rgba(255, 255, 255, 0.08)', // Borders subtle
          800: '#14131A', // Card background 
          900: '#0A0910', // Darker backgrounds
          950: '#07060C', // Deepest background
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out infinite 3s',
        'float-delayed-2': 'float 8s ease-in-out infinite 5s',
        'ticket-float-1': 'ticketFloat1 6s ease-in-out infinite',
        'ticket-float-2': 'ticketFloat2 6s ease-in-out infinite',
        'ticket-float-3': 'ticketFloat3 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.8s ease forwards',
        'slide-down-nav': 'slideDown 0.8s ease forwards',
        'line-grow': 'lineGrow 1s 1s both',
        'pulse-dot': 'pulse 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-40px) scale(1.05)' },
        },
        ticketFloat1: {
          '0%, 100%': { transform: 'rotate(-6deg) translateY(0)' },
          '50%': { transform: 'rotate(-5deg) translateY(-8px)' },
        },
        ticketFloat2: {
          '0%, 100%': { transform: 'rotate(-2deg) translateY(0)' },
          '50%': { transform: 'rotate(-1.5deg) translateY(-12px)' },
        },
        ticketFloat3: {
          '0%, 100%': { transform: 'rotate(1deg) translateY(0)' },
          '50%': { transform: 'rotate(0.5deg) translateY(-16px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        lineGrow: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
    },
  },
  plugins: [],
}
