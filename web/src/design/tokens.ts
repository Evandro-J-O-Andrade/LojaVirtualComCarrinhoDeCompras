/**
 * Angel Cosméticos — Design Tokens
 * Fonte única de verdade para cor, tipografia, espaço, raio, sombra, z-index e motion.
 * Componentes NUNCA devem declarar hex, rem de espaçamento ou sombra ad-hoc.
 */

export const angelColors = {
  // Marca
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

  // Superfícies
  background: '#FAF7F2',
  surface: '#FFFFFF',
  'surface-alt': '#F5EFE8',
  'surface-sunken': '#F0E8DD',
  overlay: 'rgba(45, 36, 32, 0.55)',

  // Texto
  text: {
    DEFAULT: '#2D2420',
    muted: '#8B7355',
    subtle: '#A99484',
    inverse: '#FFFFFF',
  },

  // Bordas
  border: {
    DEFAULT: '#E8D5C4',
    dark: '#D4C4B0',
    strong: '#8E1A5C',
  },

  // Semânticas
  success: '#6B8E6E',
  warning: '#B8955A',
  error: '#C23B5B',
  info: '#7A8CA3',

  // Escala de apoio (nunca usar diretamente em componente sem token semântico)
  blush: '#FCE4EC',
  cream: '#FFF8F0',
  ivory: '#FAF5F0',
  nude: '#E8D5C4',
  charcoal: '#3D3226',
  bronze: '#B8956A',
} as const

export const angelFonts = {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  display: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
  serif: ['Playfair Display', 'Georgia', 'serif'],
} as const

/**
 * Escala tipográfica fluida. Usa clamp() para não depender de breakpoint.
 * Ordem: display, h1, h2, h3, body-lg, body, body-sm, overline, price.
 */
export const angelTypography = {
  display: 'clamp(2.75rem, 1.5rem + 6vw, 6rem)',
  h1: 'clamp(2rem, 1.4rem + 3vw, 3.5rem)',
  h2: 'clamp(1.625rem, 1.2rem + 2vw, 2.5rem)',
  h3: 'clamp(1.25rem, 1.05rem + 1vw, 1.75rem)',
  bodyLg: 'clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)',
  body: '1rem',
  bodySm: '0.875rem',
  overline: '0.75rem',
} as const

export const angelFontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const

export const angelSpacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
  '5xl': '8rem',
  '6xl': '10rem',
} as const

export const angelBreakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export const angelRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
} as const

/** Sombras quentes. Nunca cinza puro — combina com o fundo ivory. */
export const angelShadows = {
  sm: '0 1px 2px 0 rgba(45, 36, 32, 0.05)',
  md: '0 4px 6px -1px rgba(45, 36, 32, 0.08)',
  lg: '0 10px 15px -3px rgba(45, 36, 32, 0.10)',
  xl: '0 20px 25px -5px rgba(45, 36, 32, 0.12)',
  '2xl': '0 25px 50px -12px rgba(45, 36, 32, 0.18)',
  glow: '0 0 20px rgba(142, 26, 92, 0.18)',
  'glow-lg': '0 0 40px rgba(142, 26, 92, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(45, 36, 32, 0.06)',
} as const

export const angelMotion = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    cinematic: '1600ms',
  },
  easing: {
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeIn: 'cubic-bezier(0.64, 0, 0.36, 1)',
    easeInOut: 'cubic-bezier(0.45, 0, 0.25, 1)',
  },
} as const

export const angelZ = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  header: 50,
  overlay: 100,
  modal: 200,
  toast: 300,
  cinematic: 400,
} as const

/** Categorias de negócio — usadas em Home, catálogo e filtros. */
export const angelCategories = {
  beleza: { slug: 'beleza', label: 'Beleza & Cosméticos' },
  moda: { slug: 'moda', label: 'Moda Feminina' },
  casa: { slug: 'casa', label: 'Cama, Mesa & Banho' },
} as const
