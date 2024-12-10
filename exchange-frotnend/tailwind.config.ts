import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        customBg: 'rgb(20 21 27 / <alpha-value>)',
        baseBorderLight: 'rgb(32 33 39 / var(--tw-border-opacity, 1))',
      },
    },
  },
  plugins: [],
} satisfies Config;
