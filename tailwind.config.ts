import type { Config } from "tailwindcss";

const cosmosColors = {
  "base-black": "rgba(7, 7, 9, 1)",
  "white-0.1": "rgba(255, 255, 255, 0.1)",
  "white-0.4": "rgba(255, 255, 255, 0.4)",
  "white-0.7": "rgba(255, 255, 255, 0.7)",
  "white-0.09": "rgba(255, 255, 255, 0.09)",
  "white-0.05": "rgba(255, 255, 255, 0.05)",
  "grey-100": "rgba(43, 43, 45, 1)",
  "tabs-bg": "rgba(20, 20, 22, 0.7)",
  "base-orange": "rgba(234, 139, 25, 1)",
  "orange-0.05": "rgba(234, 139, 25, 0.05)",
}

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: cosmosColors,
      backgroundColors: cosmosColors,
      backgroundImage: {
        'landing-page-stars': "url('/assets/svgs/stars-bg.svg')",
      },
      backdropBlur: {
        'footer-link': "16px",
        'tabs-body': "300px"
      },
      animation: {
        'spin-slow': 'spin 55s linear infinite',
      }
    },
  },
  plugins: [],
} satisfies Config;
