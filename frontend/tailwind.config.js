/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        surface: "#F4F5F7",
        card: "#FFFFFF",
        hairline: "#EBEDF1",
        ink: "#0B0D12",
        "ink-2": "#3A3F47",
        muted: "#8A8F98",
        subtle: "#B4B8BF",
        accent: {
          blue: "#3B6EF6",
          "blue-dark": "#274FD6",
          "blue-light": "#EAF0FE",
          green: "#16A34A",
          "green-light": "#EAFBF1",
          pink: "#EC4899",
          "pink-light": "#FDF0F7",
          amber: "#F59E0B",
          "amber-light": "#FFF7E8",
          orange: "#FB7A3C",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.5rem",
        xl4: "1.75rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 1px 0 rgba(16,24,40,0.03)",
        "card-hover": "0 8px 24px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)",
        modal: "0 25px 60px rgba(16,24,40,0.20), 0 8px 24px rgba(16,24,40,0.10)",
        "btn-primary": "0 4px 14px rgba(59,110,246,0.32)",
        pill: "0 1px 4px rgba(16,24,40,0.10)",
      },
      animation: {
        "fade-in": "fadeIn 0.18s ease-out",
        "slide-up": "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        "scale-in": "scaleIn 0.15s ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        scaleIn: { from: { opacity: 0, transform: "scale(0.96)" }, to: { opacity: 1, transform: "scale(1)" } },
      },
    },
  },
  plugins: [],
};
