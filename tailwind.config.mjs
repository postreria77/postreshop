import { heroui } from "@heroui/react";
import fluid, { extract, fontSize, screens } from "fluid-tailwind";
import defaultTheme from "tailwindcss/defaultTheme";
//** @type {import("prettier").Config} *//** @type {import("prettier").Config} */** @type {import('tailwindcss').Config} */
export default {
  content: {
    files: [
      "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
      "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    extract,
  },
  theme: {
    screens,
    fontSize,
    fontFamily: {
      sans: ["Objectivity", ...defaultTheme.fontFamily.sans],
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
  darkMode: "class",
  plugins: [
    fluid,
    heroui({
      defaultTheme: "dark",
      defaultExtendTheme: "dark",
    }),
  ],
};
