import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Grimoire / Soulsborne palette ─────────────────────────────
        grim: {
          bg:       '#0d0b08',
          surface:  '#1a1610',
          raised:   '#221e16',
          border:   '#6b5d3f',
          borderDim:'#3a3428',
          gold:     '#c4a35a',
          goldDim:  '#8b7a50',
          text:     '#d4cfc0',
          muted:    '#6a6050',
          dim:      '#3a3428',
          crimson:  '#8b2020',
          ink:      '#0a0806',
        },
        stat: {
          vigor:    '#9a4535',
          intellect:'#3a6a8a',
          social:   '#4a7a4a',
          fortune:  '#a88040',
          will:     '#6a3a5a',
        },
        difficulty: {
          easy:   '#5a8a4a',
          normal: '#a88040',
          hard:   '#9a4535',
        },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        fell:   ['"IM Fell English"', 'serif'],
      },
      animation: {
        'float':       'float 3s ease-in-out infinite',
        'glow-pulse':  'glowPulse 2.5s ease-in-out infinite',
        'level-up':    'levelUp 0.55s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
        'fade-in-up':  'fadeInUp 0.45s ease-out forwards',
        'stamp-in':    'stampIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
        'sparkle':     'sparkle 1.4s ease-in-out infinite',
        'slide-up':    'slideUp 0.3s ease-out forwards',
        'pop-in':      'popIn 0.25s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 4px #c4a35a, 0 0 8px #c4a35a' },
          '50%':     { boxShadow: '0 0 10px #c4a35a, 0 0 20px #c4a35a' },
        },
        levelUp: {
          '0%':   { transform: 'scale(0.5)', opacity: '0' },
          '70%':  { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        stampIn: {
          '0%':   { transform: 'scale(2.5) rotate(-6deg)', opacity: '0' },
          '100%': { transform: 'scale(1)   rotate(-6deg)', opacity: '1' },
        },
        sparkle: {
          '0%,100%': { opacity: '0', transform: 'scale(0)' },
          '50%':     { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%':   { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
