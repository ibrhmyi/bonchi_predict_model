import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bone: "#f3efe8",
        sand: "#e7dece",
        ink: "#171411",
        stone: "#7d7468",
        olive: "#62715b",
        gold: "#b78543",
        clay: "#cda97d",
      },
      boxShadow: {
        panel: "0 20px 45px rgba(26, 20, 17, 0.08)",
        card: "0 14px 32px rgba(26, 20, 17, 0.1)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        sans: [
          "\"Avenir Next\"",
          "\"Segoe UI\"",
          "\"Helvetica Neue\"",
          "sans-serif",
        ],
        serif: [
          "\"Iowan Old Style\"",
          "\"Palatino Linotype\"",
          "\"Book Antiqua\"",
          "Georgia",
          "serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
