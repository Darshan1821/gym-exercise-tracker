/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F172A",
          hover: "#020617"
        },

        accent: "#10B981",

        bg: "#F8FAFC",
        surface: "#FFFFFF",
        border: "#E2E8F0",

        text: {
          DEFAULT: "#0F172A",
          muted: "#64748B"
        },

        danger: "#EF4444"
      }
    }
  },
  plugins: []
};
