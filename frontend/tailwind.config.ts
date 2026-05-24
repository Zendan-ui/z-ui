import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00b4ff',
          purple: '#7c3aed',
          pink: '#c471f5',
          green: '#22c55e',
          yellow: '#f59e0b',
          red: '#ef4444',
        },
        cyber: {
          bg: '#000000',
          surface: '#050510',
          card: '#0a0a18',
          deep: '#0f0f22',
          border: 'rgba(255,255,255,0.06)',
        },
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #00b4ff, #7c3aed)',
        'gradient-card': 'linear-gradient(135deg, rgba(0,180,255,0.04), rgba(124,58,237,0.03))',
      },
      animation: {
        'glow': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 20s ease-in-out infinite',
        'fade-up': 'fadeUp 0.5s ease-out both',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,180,255,0.08)' },
          '50%': { boxShadow: '0 0 40px rgba(0,180,255,0.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0,180,255,0.15)',
        'neon-strong': '0 0 40px rgba(0,180,255,0.2)',
        'glass': '0 0 40px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
