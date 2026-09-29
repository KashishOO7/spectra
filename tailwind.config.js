/** @type {import('tailwindcss').Config} */

// Every colour and every size resolves to a CSS variable in src/styles/app.css, which is the one
// home for them. The rgb(... / <alpha-value>) form keeps opacity modifiers such as
// bg-void/90 working; a plain var() would silently drop them.
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    /**
     * Six sizes, and only six. This sits in `theme`, not `extend`, on purpose: Tailwind's own
     * text-xl, text-4xl and the rest then produce no CSS at all, so a seventh size cannot be
     * reached for by class. The values live in app.css as --fs-*, where the two headline steps
     * come down on a phone. Weights are 400 to 700, the four the font link loads.
     */
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

        // The button: teal in light, white in dark. `accent-ink` is the label on it.
        accent: {
          DEFAULT: token('accent'),
          ink: token('accent-ink'),
          light: token('accent-light'),
          dim: token('accent-dim')
        },
        // The marks: ticks, progress, links, drawings. Teal in both themes.
        teal: {
          DEFAULT: token('teal'),
          light: token('teal-light'),
          dim: token('teal-dim')
        },
        // Drawings: the one muted teal and the ground it sits on.
        viz: {
          DEFAULT: token('viz'),
          off: token('viz-off')
        },
        // One use only, the scam tag on Real or scam. The visual gate fails red anywhere else.
        red: {
          DEFAULT: token('red'),
          light: token('red-light'),
          dim: token('red-dim')
        }
      },
      fontFamily: {
        // One face (§15.1). Monospace stays only for code on /methodology, and is whatever the
        // machine already has, so nothing is fetched for it.
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
