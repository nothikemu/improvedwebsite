import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'rgb(15, 15, 15)',
          100: 'rgb(25, 25, 25)',
          200: 'rgb(35, 35, 35)',
          300: 'rgb(50, 50, 50)',
          400: 'rgb(80, 80, 80)',
          500: 'rgb(120, 120, 120)',
          600: 'rgb(200, 200, 200)',
          700: 'rgb(220, 220, 220)',
          800: 'rgb(240, 240, 240)',
          900: 'rgb(255, 255, 255)',
        },
        neutral: {
          0: 'rgb(0, 0, 0)',
          50: 'rgb(10, 10, 10)',
          100: 'rgb(20, 20, 20)',
          200: 'rgb(30, 30, 30)',
          300: 'rgb(50, 50, 50)',
          400: 'rgb(80, 80, 80)',
          500: 'rgb(120, 120, 120)',
          600: 'rgb(160, 160, 160)',
          700: 'rgb(190, 190, 190)',
          800: 'rgb(220, 220, 220)',
          900: 'rgb(240, 240, 240)',
          950: 'rgb(255, 255, 255)',
        },
        success: {
          50: 'rgb(0, 50, 0)',
          600: 'rgb(0, 255, 0)',
          900: 'rgb(200, 255, 200)',
        },
        error: {
          600: 'rgb(255, 85, 85)',
        },
        warning: {
          600: 'rgb(255, 255, 100)',
        },
      },
      fontFamily: {
        // --font-poppins is intentionally left undefined, as in the original:
        // text inside the windows takes 7.css's Segoe UI stack from `.window`.
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      borderRadius: {
        sm: '0px',
        md: '0px',
        DEFAULT: '0px',
        lg: '0px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
        DEFAULT: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
        md: '0px 4px 16px -2px rgba(0, 0, 0, 0.08), 0px 2px 4px -1px rgba(0, 0, 0, 0.08)',
        lg: '0px 12px 32px -4px rgba(0, 0, 0, 0.08), 0px 4px 8px -2px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
export default config;
