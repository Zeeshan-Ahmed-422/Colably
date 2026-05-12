/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1320px' },
    },
    extend: {
      colors: {
        bg: 'hsl(230 24% 6%)',
        panel: 'hsl(230 18% 9%)',
        panel2: 'hsl(230 16% 12%)',
        border: 'hsl(230 14% 18%)',
        muted: 'hsl(230 8% 60%)',
        fg: 'hsl(220 14% 96%)',
        brand: {
          DEFAULT: '#7c5cff',
          50:  '#f3efff',
          100: '#e6dfff',
          200: '#cabaff',
          300: '#ad94ff',
          400: '#8f6eff',
          500: '#7c5cff',
          600: '#6244db',
          700: '#4a31ad',
          800: '#33207a',
          900: '#1f1450',
        },
        accent: '#22d3ee',
        success: '#22c55e',
        warning: '#f59e0b',
        danger:  '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 30px rgba(0,0,0,0.35)',
        glow: '0 0 40px rgba(124,92,255,0.35)',
      },
      backgroundImage: {
        'grid-faint': 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-20': '20px 20px',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        floaty:  { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
      },
      animation: {
        shimmer: 'shimmer 2.5s linear infinite',
        floaty:  'floaty 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
