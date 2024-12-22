import fluid, { extract, fontSize, screens } from "fluid-tailwind";
//** @type {import("prettier").Config} *//** @type {import("prettier").Config} */** @type {import('tailwindcss').Config} */
export default {
  content: {
    files: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
    extract,
  },
  theme: {
    screens,
    fontSize,
    fontFamily: {
      sans: ["Objectivity", "sans-serif"],
    },
    extend: {
      colors: {
        dark: "#141414",
        "dark-2": "#0A0A0A",
        light: "#FAF8F4",
        brand: "#E0AA3E",
        "brand-2": "#FFCF70",
      },
    },
  },
  plugins: [fluid],
};

