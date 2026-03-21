/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0d1117",
          card: "#161b22",
          hover: "#1c2128",
          border: "#30363d",
        },
        accent: {
          DEFAULT: "#58a6ff",
          green: "#3fb950",
          purple: "#bc8cff",
          orange: "#d29922",
          red: "#f85149",
        },
      },
    },
  },
  plugins: [],
};
