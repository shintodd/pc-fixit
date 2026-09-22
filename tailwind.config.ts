import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
      },
      colors: {
        // Light mode (Apple DESIGN.md: Action Blue, Parchment, Ink)
        ink: "#1d1d1f",
        "ink-secondary": "#7a7a7a",
        "ink-tertiary": "#86868b",
        surface: "#f5f5f7",
        "surface-raised": "#ffffff",
        subtle: "#e8e8ed",
        "subtle-hover": "#d2d2d7",
        line: "rgba(0, 0, 0, 0.08)",
        "line-strong": "rgba(0, 0, 0, 0.16)",
        accent: {
          DEFAULT: "#0066cc",
          soft: "rgba(0, 102, 204, 0.08)",
          hover: "#0071e3",
        },
        critical: "#ff3b30",
        warn: "#ff9500",
        ok: "#34c759",
        imessage: "#0071e3",

        // Dark mode tokens (Apple DESIGN.md: Surface tiles, Sky Blue, Body on dark)
        dark: {
          surface: "#161617",
          "surface-raised": "#272729",
          ink: "#f5f5f7",
          "ink-secondary": "#a1a1a6",
          "ink-tertiary": "#86868b",
          subtle: "#242426",
          "subtle-hover": "#2a2a2c",
          line: "rgba(255, 255, 255, 0.12)",
          "line-strong": "rgba(255, 255, 255, 0.20)",
          card: "#272729",
          accent: "#2997ff",
          critical: "#ff453a",
          warn: "#ffd60a",
          ok: "#30d158",
        },
      },
      borderRadius: {
        apple: "18px",
        xl2: "20px",
        pill: "9999px",
        "2xs": "2px",
      },
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
      },
      scale: {
        98: "0.98",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(17,19,24,0.04)",
        "2xs": "0 1px 1px rgba(17,19,24,0.03)",
        card: "0 1px 2px rgba(17,19,24,0.04), 0 4px 16px rgba(17,19,24,0.06)",
        "card-hover": "0 4px 12px rgba(17,19,24,0.06), 0 12px 32px rgba(17,19,24,0.08)",
        "card-active": "0 1px 3px rgba(17,19,24,0.08)",
        glass: "0 8px 32px 0 rgba(26, 115, 232, 0.05), 0 1px 2px 0 rgba(0,0,0,0.04)",
        glow: "0 0 24px -4px rgba(26, 115, 232, 0.3)",
        "glow-sm": "0 0 12px -2px rgba(26, 115, 232, 0.2)",
        // Dark mode shadows
        "card-dark": "0 1px 2px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
        "card-hover-dark": "0 4px 12px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.3)",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.175, 0.885, 0.32, 1.15)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "typing-dot": {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-6px)", opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.06)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.4s ease both",
        shimmer: "shimmer 2.5s infinite linear",
        "typing-dot": "typing-dot 1.4s infinite ease-in-out",
        "pulse-glow": "pulse-glow 3s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
