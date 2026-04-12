import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#005354",
        surface: "#f8fafb",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f7f8",
        "surface-container": "#eef2f3",
        "surface-container-high": "#e8ecef",
        "surface-container-highest": "#e2e6e9",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        serif: ["var(--font-noto-serif)", "system-ui", "serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
