import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Elemental / Architecture palette
        ion: {
          DEFAULT: "#f4b740", // Trapped-Ion — amber
          soft: "#f7cf7a",
        },
        superc: {
          DEFAULT: "#4ea8ff", // Superconducting — electric blue
          soft: "#8fcaff",
        },
        atom: {
          DEFAULT: "#7cf29a", // Neutral-Atom — teal/green
          soft: "#b4f7c6",
        },
        // UI
        quantum: {
          bg: "#0a0d14",
          panel: "#111722",
          line: "#2a3550",
          gold: "#e8b06a",
          hp: "#7ee081",
          shield: "#8fcaff",
          moxie: "#ffd24a",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui"],
      },
      keyframes: {
        breathe: {
          "0%,100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-3px) scale(1.01)" },
        },
        sway: {
          "0%,100%": { transform: "rotate(-1.2deg)" },
          "50%": { transform: "rotate(1.2deg)" },
        },
        glitch: {
          "0%,100%": { transform: "translate(0,0)", opacity: "1" },
          "20%": { transform: "translate(-3px,2px)", opacity: "0.7" },
          "40%": { transform: "translate(3px,-2px)", opacity: "0.9" },
          "60%": { transform: "translate(-2px,-1px)", opacity: "0.6" },
          "80%": { transform: "translate(2px,1px)", opacity: "0.85" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        scan: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 24px" },
        },
      },
      animation: {
        breathe: "breathe 3.4s ease-in-out infinite",
        sway: "sway 4.2s ease-in-out infinite",
        glitch: "glitch 0.35s steps(2) infinite",
        float: "float 4s ease-in-out infinite",
        scan: "scan 1s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
