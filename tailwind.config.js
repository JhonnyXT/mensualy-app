/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        surface: "#F7F7F8",
        "surface-secondary": "#F0F0F3",
        border: "#E5E5EA",
        text: {
          primary: "#0B0B0F",
          secondary: "#6B6B70",
          tertiary: "#9A9AA0",
        },
        accent: {
          DEFAULT: "#4F46E5",
          soft: "#EEF0FD",
        },
        success: {
          DEFAULT: "#1FA463",
          soft: "#E3F6EC",
        },
        danger: {
          DEFAULT: "#E0453C",
          soft: "#FDEAE9",
        },
        warning: {
          DEFAULT: "#B7791F",
          soft: "#FBF0DD",
        },
      },
      borderRadius: {
        card: "16px",
        pill: "999px",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
