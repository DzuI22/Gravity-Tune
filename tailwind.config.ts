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
        background: "var(--background)",
        foreground: "var(--foreground)",
        spotify: {
          green: "#1DB954",
          black: "#121212",
          dark: "#181818",
          card: "#282828",
          text: "#B3B3B3",
        },
        applemusic: {
          accent: "#FA2D48",
          glass: "rgba(255, 255, 255, 0.08)",
          glassBorder: "rgba(255, 255, 255, 0.12)",
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        glow: 'pulseGlow 6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
export default config;
