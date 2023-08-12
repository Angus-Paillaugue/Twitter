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
        'primary': {
          '50': '#f5fdff', 
          '100': '#e6f8fc', 
          '200': '#c5effc', 
          '300': '#a2e1fa', 
          '400': '#5dc2f5', 
          '500': '#1d9bf0', 
          '600': '#1885d9', 
          '700': '#1064b3', 
          '800': '#0a4a8f', 
          '900': '#05316b', 
          '950': '#021c45'
        },
        "text-main":"#2D2E32",
        "border":"#2f3336"
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
  darkMode: 'class',
}