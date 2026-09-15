/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#16261F",
          light: "#1E3329",
          deep: "#0E1A15",
        },
        parchment: {
          DEFAULT: "#EDE6D6",
          dim: "#DED4BE",
        },
        seal: {
          DEFAULT: "#A13D2B",
          light: "#C15A3F",
        },
        moss: {
          DEFAULT: "#2F6F5E",
          light: "#3F9280",
        },
      },
      fontFamily: {
        display: ["Newsreader", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
