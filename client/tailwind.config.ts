import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0a0a0a",
        "surface-light": "#141414",
        "surface-lighter": "#1e1e1e",
        accent: "#ff6b4a",
        "accent-muted": "#ff6b4a80",
      },
    },
  },
  plugins: [],
} satisfies Config;
