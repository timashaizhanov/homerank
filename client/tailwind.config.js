/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0d1b2a",
        navy: "#102a43",
        amber: "#d4a017",
        sand: "#f5efe2",
        mist: "#d9e2ec"
      },
      fontFamily: {
        heading: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"]
      },
      boxShadow: {
        card: "0 24px 60px rgba(16, 42, 67, 0.12)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(212,160,23,0.2), transparent 28%), linear-gradient(135deg, rgba(16,42,67,1), rgba(13,27,42,1))"
      }
    }
  },
  plugins: []
};
