import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ops: {
          bg: "#0A0A0A",
          accent: "#FF2A2A",
          text: "#E5E5E5",
          card: "#1A1A1A",
        },
      },
      fontFamily: {
        mono: ["var(--font-ops-mono)", "JetBrains Mono", "IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        ops: "4px",
      },
    },
  },
};

export default config;
