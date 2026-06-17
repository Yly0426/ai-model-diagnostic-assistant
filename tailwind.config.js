/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Noto Sans SC", "Space Grotesk", "Inter", "system-ui", "sans-serif"],
        body: ["Noto Sans SC", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        ink: "#05070f",
        panel: "rgba(12, 20, 38, 0.62)",
        cyanline: "#43d9ff",
        orbit: "#8b7dff",
      },
      maxWidth: {
        shell: "1700px",
      },
      boxShadow: {
        glow: "0 0 42px rgba(67, 217, 255, 0.22)",
      },
    },
  },
  plugins: [],
};
