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
        // ── DQ Dark Navy palette ──────────────────────────────────────
        dq: {
          bg:     '#04091a',   // page void
          void:   '#020610',   // deepest dark
          window: '#07121f',   // window interior
          border: '#b8cce0',   // double-border color (light blue-white)
          text:   '#e8f0f8',   // main text
          muted:  '#4a6080',   // muted/disabled text
          gold:   '#f0c030',   // gold highlight
          yellow: '#ffd700',   // bright gold
          blue:   '#4080e0',   // DQ magic blue
          green:  '#30c840',   // DQ HP green
        },
        // ── Parchment palette ─────────────────────────────────────────
        parchment: {
          DEFAULT: '#f4e4bc',
          light:   '#f8eecf',
          dark:    '#d4c49c',
          ink:     '#2c1810',
          sepia:   '#8b7355',
          shadow:  '#5a3a2a',
        },
        // ── Stat colours ──────────────────────────────────────────────
        stat: {
          vigor:    '#ef4444',
          intellect:'#3b82f6',
          social:   '#22c55e',
          fortune:  '#f59e0b',
          will:     '#a855f7',
        },
        // ── Difficulty colours ────────────────────────────────────────
        difficulty: {
          easy:   '#22c55e',
          normal: '#f59e0b',
          hard:   '#ef4444',
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
        'dq-cursor':   'dqCursor 1s step-end infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 6px #f0c030, 0 0 12px #f0c030' },
          '50%':     { boxShadow: '0 0 14px #ffd700, 0 0 28px #ffd700, 0 0 42px #c89010' },
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
        dqCursor: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
