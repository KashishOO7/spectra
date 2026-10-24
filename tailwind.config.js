
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    fontSize: {
      xs:    ['var(--fs-xs)',   { lineHeight: '1.45' }],
      sm:    ['var(--fs-sm)',   { lineHeight: '1.55' }],
      base:  ['var(--fs-base)', { lineHeight: '1.6' }],
      lg:    ['var(--fs-lg)',   { lineHeight: '1.4' }],
      '2xl': ['var(--fs-2xl)',  { lineHeight: '1.2' }],
      '3xl': ['var(--fs-3xl)',  { lineHeight: '1.1' }]
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    extend: {
      colors: {
        void: token('void'),
        surface: {
          DEFAULT: token('surface'),
          2: token('surface-2')
        },
        border: token('border'),
        muted: token('muted'),
        dim: token('dim'),
        body: token('body'),
        bright: token('bright'),
        white: token('white'),

        accent: {
          DEFAULT: token('accent'),
          ink: token('accent-ink'),
          light: token('accent-light'),
          dim: token('accent-dim')
        },
        teal: {
          DEFAULT: token('teal'),
          light: token('teal-light'),
          dim: token('teal-dim')
        },
        viz: {
          DEFAULT: token('viz'),
          off: token('viz-off')
        },
        red: {
          DEFAULT: token('red'),
          light: token('red-light'),
          dim: token('red-dim')
        }
      },
      fontFamily: {
        sans: ['Public Sans', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace']
      },
      backgroundImage: {
        'grid-void': `
          linear-gradient(rgb(var(--c-grid) / var(--c-grid-a)) 1px, transparent 1px),
          linear-gradient(90deg, rgb(var(--c-grid) / var(--c-grid-a)) 1px, transparent 1px)
        `
      },
      backgroundSize: {
        'grid-sm': '24px 24px',
        'grid-md': '48px 48px'
      }
    }
  },
  plugins: []
};
