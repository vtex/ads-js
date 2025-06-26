/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // VTEX Brand Colors
        vtex: {
          // Primary - Rebel Pink
          pink: "#F71963",
          "pink-soft": "#FFF3F6",
          "pink-bubble": "#FFC4DD",

          // Secondary - Serious Black
          black: "#071127",
          "black-dark": "#142032",
          gray: "#787C89",
          "gray-cool": "#a1a8b7",
          "gray-winter": "#E7E9EE",
          "gray-light": "#C3C6CC",

          // Balance Colors
          blue: "#F5F9FF",
          "blue-soft": "#DFE9F8",
          white: "#ffffff",
        },
      },
      fontFamily: {
        vtex: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      gridTemplateColumns: {
        vtex: "repeat(auto-fit, minmax(280px, 1fr))",
      },
    },
  },
  plugins: [],
};
