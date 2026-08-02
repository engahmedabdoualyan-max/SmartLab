/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // SmartLab custom colors matching the original design
        'slab': {
          'deep': '#0a0e1a',
          'card': 'rgba(15, 23, 42, 0.65)',
          'card-hover': 'rgba(20, 30, 55, 0.85)',
          'border-glass': 'rgba(148, 163, 184, 0.10)',
          'border-glass-hover': 'rgba(148, 163, 184, 0.18)',
          'text-primary': '#f8fafc',
          'text-secondary': '#94a3b8',
          'text-muted': '#64748b',
          'accent-blue': '#3b82f6',
          'accent-gold': '#fbbf24',
          'accent-amber': '#f59e0b',
          'accent-emerald': '#10b981',
          'accent-red': '#f87171',
          'accent-cyan': '#06b6d4',
          'accent-purple': '#a855f7',
          'accent-orange': '#fb923c',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'lamp-pulse-blue': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(59,130,246,0.3), 0 0 30px rgba(59,130,246,0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(59,130,246,0.5), 0 0 50px rgba(59,130,246,0.15)' },
        },
        'lamp-pulse-green': {
          '0%, 100%': { boxShadow: '0 0 6px rgba(16,185,129,0.3)' },
          '50%': { boxShadow: '0 0 12px rgba(16,185,129,0.5)' },
        },
        'pipe-flow': {
          '0%': { left: '34px', opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { left: 'calc(100% - 34px)', opacity: '0' },
        },
        'icon-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'cursor-blink': {
          '50%': { opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-dot': 'pulse-dot 1.5s infinite',
        'lamp-pulse-blue': 'lamp-pulse-blue 1.5s ease-in-out infinite',
        'lamp-pulse-green': 'lamp-pulse-green 1.5s ease-in-out infinite',
        'pipe-flow': 'pipe-flow 1.8s linear infinite',
        'icon-bounce': 'icon-bounce 2s ease-in-out infinite',
        'cursor-blink': 'cursor-blink 0.8s step-end infinite',
        'fade-in': 'fade-in 0.25s ease',
        'fade-up': 'fade-up 0.6s ease-out',
      },
      fontFamily: {
        sans: ['Cairo', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};