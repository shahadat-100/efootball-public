import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#fafafa',
        foreground: '#111111',
        card: '#ffffff',
        'card-foreground': '#111111',
        popover: '#ffffff',
        'popover-foreground': '#111111',
        primary: '#c8102e',          // Classic football red
        'primary-foreground': '#ffffff',
        secondary: '#f5f5f5',
        'secondary-foreground': '#111111',
        muted: '#f3f4f6',
        'muted-foreground': '#6b7280',
        accent: '#c8102e',
        'accent-foreground': '#ffffff',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
        border: '#e5e7eb',
        input: '#ffffff',
        ring: '#c8102e',
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        heading: ['"Oswald"', 'sans-serif'],
        mono: ['monospace'],
      },
      boxShadow: {
        DEFAULT: '0 1px 3px rgba(0,0,0,0.08)',
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.05)',
        lg: '0 10px 15px rgba(0,0,0,0.05)',
        xl: '0 20px 25px rgba(0,0,0,0.05)',
        none: 'none',
        'glow-red': '0 4px 20px rgba(200,16,46,0.15)',
        'glow-emerald': '0 4px 20px rgba(16,185,129,0.15)',
        'glow-amber': '0 4px 20px rgba(245,158,11,0.15)',
        'glow-blue': '0 4px 20px rgba(59,130,246,0.15)',
        'glow-purple': '0 4px 20px rgba(168,85,247,0.15)',
        'lift': '0 20px 40px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04)',
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      borderWidth: {
        DEFAULT: '1px',
        '2': '2px',
      },
      letterSpacing: {
        tight: '-0.02em',
      },
      screens: {
        'sidebar-sm': '640px',
        'sidebar-md': '768px',
        'sidebar-lg': '1024px',
        'sidebar-xl': '1280px',
      },
      animation: {
        'stagger-in': 'staggerFadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in-scale': 'fadeInScale 0.3s ease-out forwards',
        'bar-grow': 'barGrow 0.8s ease-out forwards',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        staggerFadeIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(200,16,46,0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(200,16,46,0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeInScale: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        barGrow: {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config