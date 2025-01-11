/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#1E3A8A', // Custom dark blue for the background
        'form-bg': '#1F2937', // Dark gray for form background
        'input-bg': '#374151', // Input field background
        'placeholder': '#9CA3AF', // Placeholder text color
      },
      spacing: {
        72: '18rem', // Custom spacing for wider containers
      },
      borderRadius: {
        xl: '1rem', // Custom border radius for rounded corners
      },
    },
  },
  plugins: [],
};
