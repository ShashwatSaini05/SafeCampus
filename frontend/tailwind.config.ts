import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark background system
        bg: {
          primary: "#070714",
          secondary: "#0d0d1f",
          card: "#12122a",
          elevated: "#1a1a35",
          border: "#2a2a4a",
        },
        // Accent system
        accent: {
          purple: "#7c3aed",
          violet: "#8b5cf6",
          cyan: "#06b6d4",
          indigo: "#6366f1",
          pink: "#ec4899",
          red: "#ef4444",
        },
        // Status colors
        status: {
          pending: "#f59e0b",
          review: "#3b82f6",
          resolved: "#10b981",
        },
        // Category colors
        category: {
          ragging: "#ef4444",
          harassment: "#f59e0b",
          safety: "#3b82f6",
          other: "#8b5cf6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-hero":
          "radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.1) 0%, transparent 60%)",
        "gradient-card":
          "linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(6,182,212,0.05) 100%)",
      },
      animation: {
        "slide-in": "slideIn 0.5s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
        "bounce-gentle": "bounceGentle 2s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(124,58,237,0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(6,182,212,0.5)" },
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
