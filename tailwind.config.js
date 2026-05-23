/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          sidebar: '#111827',
          accent: '#4F46E5',
          gold: '#B5945B', // Premium gold accent from mockup
          goldHover: '#967946',
          bg: '#F9FAFB',
          card: '#FFFFFF',
          text: '#111827',
          muted: '#6B7280',
          border: '#E5E7EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 4px 20px -2px rgba(17, 24, 39, 0.05), 0 2px 6px -1px rgba(17, 24, 39, 0.02)',
        card: '0 10px 30px -5px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01)',
      }
    },
  },
  plugins: [],
}
