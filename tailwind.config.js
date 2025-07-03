/** @type {import('tailwindcss').Config} */
const defaultConfig = require("shadcn/ui/tailwind.config")

module.exports = {
  ...defaultConfig,
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./**/*.{js,ts,jsx,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    ...defaultConfig.theme,
    extend: {
      ...defaultConfig.theme.extend,
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        ...defaultConfig.theme.extend.colors,
        "tandt-bg": "#F0F2F5",
        "tandt-primary": "#0D6EFD",
        "tandt-secondary": "#6C757D",
        "tandt-light": "#F8F9FA",
        "tandt-dark": "#212529",
        "tandt-border": "#DEE2E6",
        "tandt-card-bg": "#FFFFFF",
        "tandt-card-header": "#F7F7F7",
        "tandt-card-alt-bg": "#FFFBEA",
        "tandt-success": "#198754",
        "tandt-danger": "#DC3545",
        "tandt-warning": "#FFC107",
      },
    },
  },
  plugins: [...defaultConfig.plugins, require("tailwindcss-animate")],
}
