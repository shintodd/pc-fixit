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
        // Light mode (soft, eye-friendly matte palette)
        ink: "#1c2128",
        "ink-secondary": "#57606a",
        "ink-tertiary": "#6b7280",
        surface: "#f6f8fa",
        "surface-raised": "#ffffff",
        subtle: "#eaeef2",
        "subtle-hover": "#dfe4ea",
        line: "rgba(27, 31, 36, 0.08)",
        "line-strong": "rgba(27, 31, 36, 0.15)",
        accent: {
          DEFAULT: "#1a73e8",
          soft: "#e8f0fe",
          hover: "#1557b0",
        },
        critical: "#d93025",
        warn: "#b06000",
        ok: "#188038",
        imessage: "#1a73e8",

        // Dark mode tokens (referenced with dark:)
        dark: {
          surface: "#0d0f12",
          "surface-raised": "#161b22",
          ink: "#e6edf3",
          "ink-secondary": "#8b949e",
          "ink-tertiary": "#7d8792",
          subtle: "#161b22",
          "subtle-hover": "#1f2937",
          line: "rgba(230, 237, 243, 0.08)",
          "line-strong": "rgba(230, 237, 243, 0.16)",
          card: "#161b22",
          accent: "#58a6ff",
          critical: "#f85149",
          warn: "#d29922",
          ok: "#3fb950",
        },
      },
      borderRadius: {
        xl2: "20px",
        pill: "999px",
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
