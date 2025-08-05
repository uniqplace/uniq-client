/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Global Color Palette
        primary: {
          50: '#fefce8',
          100: '#fef9c3', 
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#c8941c', // Primary Warm Gold ⭐
          600: '#b8860b', // Darker Gold
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        // Dark Navy for Sidebar
        navy: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#1c2a3a', // Primary Dark Navy ⭐
        },
        // Accent Gold (lighter)
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#dfb548', // Accent Gold Tint ⭐
          600: '#d4a01f',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        // Neutral colors
        neutral: {
          50: '#f8f9fa',
          100: '#f1f3f4',
          200: '#e5e7eb', // Border/Shadow Gray ⭐
          300: '#dadce0',
          400: '#bdc1c6',
          500: '#9aa0a6',
          600: '#6b7280',
          700: '#5f6368',
          800: '#3c4043',
          900: '#1a1a1a', // Text Primary ⭐
        },
        // Success colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Warning colors
        warning: {
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
        },
        // Error colors
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'Poppins', 'Rubik', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'Inter', 'Rubik', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0,0,0,0.1)',
        'medium': '0 4px 16px -4px rgba(0,0,0,0.15)',
        'large': '0 8px 32px -8px rgba(0,0,0,0.2)',
        'luxury': '0 12px 48px -12px rgba(0,0,0,0.25)',
        'navy': '0 4px 20px -4px rgba(28, 42, 58, 0.3)',
        'gold': '0 4px 20px -4px rgba(200, 148, 28, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
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
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(200, 148, 28, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(200, 148, 28, 0.8)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

