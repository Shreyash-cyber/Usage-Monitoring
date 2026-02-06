/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1120",
        slate: "#111827",
        "slate-card": "#1e293b",
        mint: "#4ade80",
        sky: "#38bdf8",
        amber: "#f59e0b",
        coral: "#f87171",
        violet: "#a78bfa",
      },
      boxShadow: {
        glow: "0 0 24px rgba(74, 222, 128, 0.1)",
      },
    },
  },
  plugins: [],
};
