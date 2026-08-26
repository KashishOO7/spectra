/** @type {import('tailwindcss').Config} */

const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        void: token('void'),
        surface: token('surface'),
        border: token('border'),
        muted: token('muted'),
        dim: token('dim'),
        body: token('body'),
        bright: token('bright'),
        white: token('white'),

        amber: {
          DEFAULT: token('amber'),
          light: token('amber-light'),
          dim: token('amber-dim')
        },
        teal: {
          DEFAULT: token('teal'),
          light: token('teal-light'),
          dim: token('teal-dim')
        },
        red: {
          DEFAULT: token('red'),
          light: token('red-light'),
          dim: token('red-dim')
        },
        green: {
          DEFAULT: token('green'),
          light: token('green-light'),
          dim: token('green-dim')
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'DM Sans', 'system-ui', 'sans-serif']
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
