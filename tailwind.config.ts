import type { Config } from "tailwindcss";

export default {
  darkMode: "class", // Class-based dark mode
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: "#ffffff", // Light background
          dark: "#1a1a1a", // Dark background
        },
        foreground: {
          light: "#333333", // Light text color
          dark: "#dcdcdc", // Dark text color
        },
        card: {
          DEFAULT: "#ffffff",
          dark: "#1a1a1a",
        },
        popover: {
          DEFAULT: "#ffffff",
          dark: "#1a1a1a",
        },
        primary: {
          DEFAULT: "hsl(222, 47%, 11%)", // Primary color
          dark: "hsl(210, 40%, 98%)", // Dark mode primary color
        },
        secondary: {
          DEFAULT: "hsl(210, 40%, 96%)",
          dark: "hsl(217, 32%, 17%)",
        },
        muted: {
          DEFAULT: "hsl(210, 40%, 96%)",
          dark: "hsl(217, 32%, 17%)",
        },
        accent: {
          DEFAULT: "hsl(210, 40%, 96%)",
          dark: "hsl(217, 32%, 17%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 84%, 60%)",
          dark: "hsl(0, 62%, 30%)",
        },
        border: {
          light: "hsl(214, 31%, 91%)",
          dark: "hsl(217, 32%, 17%)",
        },
        input: {
          light: "#e0e0e0",
          dark: "#2a2a2a",
        },
        ring: {
          light: "hsl(222, 84%, 4%)",
          dark: "hsl(212, 26%, 83%)",
        },
        button: {
          light: "#d6d6d6",
          dark: "#333333",
        },
        chart: {
          "1": "hsl(12, 76%, 61%)",
          "2": "hsl(173, 58%, 39%)",
          "3": "hsl(197, 37%, 24%)",
          "4": "hsl(43, 74%, 66%)",
          "5": "hsl(27, 87%, 67%)",
        },
      },
      borderRadius: {
        lg: "12px", // Example for large radius
        md: "10px",
        sm: "8px",
      },
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
        title: ["Orbitron", "sans-serif"], // Orbitron for titles
        mono: ["Fira Code", "monospace"], // Example for mono fonts
      },
      animation: {
        rainbow: "rainbow 2s infinite linear",
        grid: "grid 15s linear infinite",
        meteor: "meteor 5s linear infinite",
      },
      keyframes: {
        rainbow: {
          "0%": { "background-position": "0%" },
          "100%": { "background-position": "200%" },
        },
        grid: {
          "0%": { transform: "translateY(-50%)" },
          "100%": { transform: "translateY(0)" },
        },
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
