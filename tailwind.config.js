/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        void: '#080c12',       
        surface: '#0d1421',    
        border: '#1a2540',     
        muted: '#2a3a5c',      
        dim: '#4a6080',       
        body: '#8ba4c0',       
        bright: '#c8dff0',  
        white: '#f0f8ff',      
        
        amber: {
          DEFAULT: '#d4862a',
          light: '#f0a84e',
          dim: '#7a4a12'
        },
        teal: {
          DEFAULT: '#2a8a8a',
          light: '#3dbfbf',
          dim: '#144444'
        },
        red: {
          DEFAULT: '#c0392b',
          light: '#e74c3c',
          dim: '#5c1a14'
        },
        green: {
          DEFAULT: '#27ae60',
          light: '#2ecc71',
          dim: '#12522c'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'DM Sans', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        'grid-void': `
          linear-gradient(rgba(26, 37, 64, 0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(26, 37, 64, 0.4) 1px, transparent 1px)
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
