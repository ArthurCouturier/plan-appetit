/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        textPrimary: 'var(--textPrimary)',
        textSecondary: 'var(--textSecondary)',
        thirdary: 'var(--thirdary)',
        bgColor: 'var(--bgColor)',
        coutYellow: 'var(--coutYellow)',
        coutPurple: 'var(--coutPurple)',
        coutBase: 'var(--coutBase)',
        borderColor: 'var(--borderColor)',
        confirmation1: 'var(--confirmation1)',
        cancel1: 'var(--cancel1)',
        confirmation2: 'var(--confirmation2)',
        cancel2: 'var(--cancel2)',
      },
    },
  },
  plugins: [],
};
