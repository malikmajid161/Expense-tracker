import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./sections/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#0e0e1a", soft: "#13131f" },
        accent: {
          purple: "#a855f7",
          pink: "#ec4899",
          cyan: "#06b6d4",
        },
      },
      fontFamily: {
        sans: ["var(--font-figtree)", "system-ui", "sans-serif"],
        display: ["var(--font-space)", "system-ui", "sans-serif"],
      },
      animation: {
        "gradient-shift": "gradient-shift 6s ease infinite",
        float: "float 6s ease-in-out infinite",
        "scroll-down": "scroll-down 2s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "scroll-down": {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(12px)", opacity: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5", filter: "blur(40px)" },
          "50%": { opacity: "0.9", filter: "blur(60px)" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(168,85,247,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(168,85,247,0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
export default config;
