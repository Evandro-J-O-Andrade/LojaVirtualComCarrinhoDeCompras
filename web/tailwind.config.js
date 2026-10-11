/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8E1A5C',
          dark: '#6D1448',
          light: '#A82A6E',
          muted: '#C77BA5',
          contrast: '#FFFFFF',
        },
        champagne: {
          DEFAULT: '#C4A87C',
          light: '#E8D5C4',
          dark: '#8B7355',
        },
        background: '#FAF7F2',
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F5EFE8',
          sunken: '#F0E8DD',
        },
        overlay: 'rgba(45, 36, 32, 0.55)',
        content: {
          DEFAULT: '#2D2420',
          muted: '#8B7355',
          subtle: '#A99484',
          inverse: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E8D5C4',
          dark: '#D4C4B0',
          strong: '#8E1A5C',
        },
        success: '#6B8E6E',
        warning: '#B8955A',
        error: '#C23B5B',
        info: '#7A8CA3',
        blush: '#FCE4EC',
        cream: '#FFF8F0',
        ivory: '#FAF5F0',
        nude: '#E8D5C4',
        charcoal: '#3D3226',
        bronze: '#B8956A',

        // DEPRECATED: aliases da paleta legada. Mapeados para a paleta nova.
        // Existem apenas para as páginas antigas do Phase 3–9.
        // NÃO usar em código novo — remover quando a migração da paleta concluir.
        'deep-rose': '#8E1A5C',
        'soft-black': '#2D2420',
        'warm-gray': '#8B7355',
        rose: '#C77BA5',
        coral: '#C4746C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        display: ['clamp(2.75rem, 1.5rem + 6vw, 6rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        h1: ['clamp(2rem, 1.4rem + 3vw, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.015em' }],
        h2: ['clamp(1.625rem, 1.2rem + 2vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        h3: ['clamp(1.25rem, 1.05rem + 1vw, 1.75rem)', { lineHeight: '1.25' }],
        'body-lg': ['clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)', { lineHeight: '1.65' }],
        body: ['1rem', { lineHeight: '1.65' }],
        'body-sm': ['0.875rem', { lineHeight: '1.55' }],
        overline: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.18em' }],
      },
      spacing: {
        '5xl': '8rem',
        '6xl': '10rem',
        '7xl': '12rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(45, 36, 32, 0.05)',
        md: '0 4px 6px -1px rgba(45, 36, 32, 0.08)',
        lg: '0 10px 15px -3px rgba(45, 36, 32, 0.10)',
        xl: '0 20px 25px -5px rgba(45, 36, 32, 0.12)',
        '2xl': '0 25px 50px -12px rgba(45, 36, 32, 0.18)',
        glow: '0 0 20px rgba(142, 26, 92, 0.18)',
        'glow-lg': '0 0 40px rgba(142, 26, 92, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(45, 36, 32, 0.06)',
      },
      transitionTimingFunction: {
        angel: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      zIndex: {
        header: '50',
        overlay: '100',
        modal: '200',
        toast: '300',
        cinematic: '400',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'hero-panel-in': {
          '0%': { opacity: '0', transform: 'translateX(-2.5rem)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'hero-panel-in-alt': {
          '0%': { opacity: '0', transform: 'translateX(2.5rem)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'hero-media-in': {
          '0%': {
            opacity: '0',
            transform: 'translateX(3rem) scale(1.04)',
          },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        'hero-media-in-alt': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-3rem) scale(1.04)',
          },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        'hero-kenburns': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.06)' },
        },
        'wordmark-in': {
          '0%': { opacity: '0', letterSpacing: '0.5em', filter: 'blur(8px)' },
          '100%': { opacity: '1', letterSpacing: '0.24em', filter: 'blur(0)' },
        },
        'rule-draw': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'intro-curtain-up': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        'intro-veil-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-down': 'fade-down 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'hero-panel-in': 'hero-panel-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
        'hero-panel-in-alt': 'hero-panel-in-alt 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
        'hero-media-in': 'hero-media-in 1.1s cubic-bezier(0.16, 1, 0.3, 1) both',
        'hero-media-in-alt': 'hero-media-in-alt 1.1s cubic-bezier(0.16, 1, 0.3, 1) both',
        'hero-kenburns': 'hero-kenburns 8s ease-out both',
        'wordmark-in': 'wordmark-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
        'rule-draw': 'rule-draw 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'intro-curtain-up': 'intro-curtain-up 0.7s cubic-bezier(0.64, 0, 0.36, 1) both',
        'intro-veil-in': 'intro-veil-in 0.4s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
