/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte}',
    "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}"
  ],
  theme: {
    extend: {
      fontFamily:{
        sans:["Poppins"]
      },
      colors: {
        primary: {
          '50': '#f2f9fc', 
          '100': '#e6f3fc', 
          '200': '#bfdcf5', 
          '300': '#9cc4f0', 
          '400': '#5a8fe6', 
          '500': '#1d4ed8', 
          '600': '#1843c4', 
          '700': '#1033a3', 
          '800': '#0a2482', 
          '900': '#061861', 
          '950': '#030d40'
      },
      "text-main":"#2D2E32"
      },
      boxShadow: {
        "sm":"rgba(0, 0, 0, 0.12) 0px 0px 8px",
        "md":"rgba(0, 0, 0, 0.12) 0px 4px 10px",
        "lg":"rgba(0, 0, 0, 0.12) 0px 6px 16px",
        "xl":"rgba(0, 0, 0, 0.18) 0px 8px 20px",
      },
      borderRadius: {
        lg:"0.75rem"
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
  darkMode: 'class',
}