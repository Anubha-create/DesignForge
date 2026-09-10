/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#080c14',
          surface: '#0d131f',
          card: '#111927',
          border: '#1e293b',
          muted: '#64748b'
        },
        forge: {
          cyan: {
            DEFAULT: '#06b6d4',
            light: '#22d3ee',
            dark: '#0891b2',
            glow: 'rgba(6, 182, 212, 0.25)'
          },
          violet: {
            DEFAULT: '#8b5cf6',
            light: '#a78bfa',
            dark: '#7c3aed',
            glow: 'rgba(139, 92, 246, 0.25)'
          },
          emerald: {
            DEFAULT: '#10b981',
            light: '#34d399',
            dark: '#059669',
            glow: 'rgba(16, 185, 129, 0.25)'
          },
          amber: {
            DEFAULT: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
            glow: 'rgba(245, 158, 11, 0.25)'
          },
          red: {
            DEFAULT: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
            glow: 'rgba(239, 68, 68, 0.25)'
          },
          blue: {
            DEFAULT: '#3b82f6',
            light: '#60a5fa',
            dark: '#2563eb'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.4)',
        'glow-violet': '0 0 20px -5px rgba(139, 92, 246, 0.4)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.4)'
      }
    },
  },
  plugins: [],
}
