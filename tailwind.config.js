/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./home.html",
    "./login.html",
    "./spawn.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@e-infra/design-system/**/*.{js,jsx,ts,tsx}",
    "./c9088/**/*.{js,jsx,ts,tsx,html}",
    "./cas/**/*.{js,jsx,ts,tsx,html}",
    "./elter-ri/**/*.{js,jsx,ts,tsx,html}",
  ],
  plugins: [require("tailwindcss-animate")],
};
