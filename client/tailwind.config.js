/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Figtree", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#0B1518",
          900: "#12242B",
          800: "#1C343D",
          700: "#2A4A54",
          500: "#5C7A84",
          300: "#A8BDC4",
        },
        paper: {
          50: "#FBF7F1",
          100: "#F4EFE6",
          200: "#E8DFD0",
        },
        clay: {
          500: "#B85C38",
          600: "#9A4A2C",
          100: "#F3DFD4",
        },
        sage: {
          500: "#3F6F5B",
          100: "#D7E6DE",
        },
        brass: {
          400: "#C4A574",
          200: "#E6D5B8",
        },
      },
      boxShadow: {
        card: "0 1px 0 rgba(18,36,43,0.04), 0 12px 32px -18px rgba(18,36,43,0.35)",
      },
    },
  },
  plugins: [],
};
