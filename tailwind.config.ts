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
        void: {
          DEFAULT: "#0d0820",
          50: "#1a0f3a",
          100: "#140c2e",
        },
        parchment: {
          DEFAULT: "#f4e4bc",
          dark: "#d4c49c",
          ink: "#2c1810",
          shadow: "#8b7355",
        },
        gold: {
          DEFAULT: "#d4a017",
          light: "#f0c040",
          dark: "#a07010",
          glow: "#ffd700",
        },
        magic: {
          purple: "#7b2d8b",
          blue: "#2d4fa8",
          glow: "#c084fc",
        },
        stat: {
          vigor: "#ef4444",
          intellect: "#3b82f6",
          social: "#22c55e",
          fortune: "#f59e0b",
          will: "#a855f7",
        },
        difficulty: {
          easy: "#22c55e",
          normal: "#f59e0b",
          hard: "#ef4444",
        },
      },
      fontFamily: {
        cinzel: ["Cinzel", "serif"],
        fell: ['"IM Fell English"', "serif"],
        medieval: ["MedievalSharp", "Cinzel", "serif"],
      },
      animation: {
        "particle-float": "particleFloat 6s ease-in-out infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "stamp-in": "stampIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        "level-up": "levelUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        "xp-fill": "xpFill 1s ease-out forwards",
        "chart-grow": "chartGrow 1s ease-out forwards",
        "shimmer": "shimmer 2s linear infinite",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "page-turn": "pageTurn 0.6s ease-out forwards",
        "float": "float 3s ease-in-out infinite",
        "sparkle": "sparkle 1.5s ease-in-out infinite",
      },
      keyframes: {
        particleFloat: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)", opacity: "0.6" },
          "50%": { transform: "translateY(-20px) rotate(180deg)", opacity: "1" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 5px #d4a017, 0 0 10px #d4a017" },
          "50%": { boxShadow: "0 0 15px #ffd700, 0 0 30px #ffd700, 0 0 45px #d4a017" },
        },
        stampIn: {
          "0%": { transform: "scale(3) rotate(-5deg)", opacity: "0" },
          "100%": { transform: "scale(1) rotate(-5deg)", opacity: "1" },
        },
        levelUp: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "70%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        xpFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--xp-width)" },
        },
        chartGrow: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pageTurn: {
          "0%": { transform: "perspective(1200px) rotateY(-30deg)", opacity: "0" },
          "100%": { transform: "perspective(1200px) rotateY(0deg)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0", transform: "scale(0)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
