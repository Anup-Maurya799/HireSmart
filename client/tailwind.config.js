export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5B8DEF",
          light: "#7FA5F2",
          dark: "#3F6FD1",
        },
        secondary: "#C9B8F5",
        accent: "#7FD1B9",
        highlight: "#FFC9A3",
        base: "#F5F8FF",
        ink: "#334155",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
