/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0C0D12",
        surface: "#15171E",
        "surface-2": "#1C1E27",
        border: "#262936",
        "border-hi": "#363A4A",
        "text-primary": "#E4E5EA",
        "text-muted": "#878BA0",
        "text-dim": "#50546B",
        accent: "#7C6AEF",
        "accent-light": "#9B8DF5",
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
