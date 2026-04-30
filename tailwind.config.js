export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        shrink: {
          "0%":   { height: "100%" },
          "100%": { height: "0%" },
        },
      },
      animation: {
        shrink: "shrink 10s linear forwards",
      },
    },
  },
  plugins: [],
};