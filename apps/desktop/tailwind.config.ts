import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ludex: {
          ink: "#080912",
          panel: "#111320",
          panelSoft: "#181a2a",
          cyan: "#28f4ff",
          pink: "#ff4fd8",
          violet: "#9b5cff",
          text: "#f7f3ff",
          muted: "#9ca3c7"
        }
      },
      boxShadow: {
        neon: "0 0 32px rgba(40, 244, 255, 0.18)"
      }
    }
  },
  plugins: []
} satisfies Config;

