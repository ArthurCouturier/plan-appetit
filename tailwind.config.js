/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coutYellow: '#f4cf77',
        coutPurple: '#2f2e6e',
        coutBase: '#a5b4fc',
      },
    },
  },
  plugins: [],
}