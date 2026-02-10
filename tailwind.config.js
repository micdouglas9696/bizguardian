/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      gridTemplateColumns: {
        '14': 'repeat(14, minmax(0, 1fr))',
        '16': 'repeat(16, minmax(0, 1fr))',
        '20': 'repeat(20, minmax(0, 1fr))',
      },
      colors: {
        primary: "#78866a",
        "primary-dark": "#5f6b53",
        "accent-gold": "#e1a960",
        "accent-gold-metallic": "linear-gradient(135deg, #e1a960 0%, #ffdf9e 50%, #e1a960 100%)",
        "accent-green": "#78866a",
        "accent-brown": "#a46c44",
        "accent-red": "#b44b3f",
        "accent-terracotta": "#d77451",
        "bg-soft": "#fdfbf7",
        "bg-dark": "#121212",
        "bg-black-matte": "#080808",
        "bg-beige-solid": "#f2eee5",
        "bg-card": "#ffffff",
        "text-main": "#1c1c1e",
        "text-secondary": "#636366",
        "eco-light": "#e6d3d3",
      },
      fontFamily: {
        sans: ["Neue Montreal", "Satoshi", "sans-serif"],
        display: ["Neue Montreal", "Satoshi", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "12px",
        'xl': "20px",
        '2xl': "32px",
        '3xl': "48px",
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
        'card': '0 4px 20px -5px rgba(0,0,0,0.05)',
        'hover': '0 20px 40px -10px rgba(0,0,0,0.12)',
        'neon': '0 0 20px rgba(225, 169, 96, 0.4), 0 0 40px rgba(225, 169, 96, 0.2)',
        'glow-primary': '0 0 20px rgba(225, 169, 96, 0.4)',
        'glow-gold': '0 0 35px rgba(225, 169, 96, 0.3)',
        'hud': '0 0 0 1px rgba(255, 255, 255, 0.1), 0 20px 50px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'orbit-rev': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        'texture-drift': {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(60px, 60px, 0)' },
        },
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'slow-zoom': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'reveal-skew': {
          '0%': { transform: 'translateY(40px) skewY(3deg)', opacity: '0', filter: 'blur(10px)' },
          '100%': { transform: 'translateY(0) skewY(0)', opacity: '1', filter: 'blur(0)' },
        },
        'pulse-data': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'scanner-hud': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      },
      animation: {
        'orbit-slow': 'orbit 20s linear infinite',
        'orbit-reverse': 'orbit-rev 25s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 6s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'spin-reverse-slower': 'spin 15s linear infinite reverse',
        'pulse-glow': 'pulse-glow 3s infinite',
        'marquee': 'marquee 35s linear infinite',
        'marquee-reverse': 'marquee-reverse 35s linear infinite',
        'texture-drift': 'texture-drift 4s linear infinite',
        'typing': 'typing 3.5s steps(40, end), blink .75s step-end infinite',
        'slow-zoom': 'slow-zoom 12s ease-in-out infinite alternate',
        'fade-in-up': 'fade-in-up 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'reveal-skew': 'reveal-skew 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'pulse-data': 'pulse-data 2s ease-in-out infinite',
        'scanner-hud': 'scanner-hud 2s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
  ],
}
