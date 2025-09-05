/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fffbf2',
          100: '#fef3d7',
          200: '#fde7b0',
          300: '#fbd980',
          400: '#f7c24d',
          500: '#e5a823', // gold principal
          600: '#c98817',
          700: '#a16513',
          800: '#7b4b10',
          900: '#5f3a0d',
        },
        gold: {
          50: '#fffbf2',
          100: '#fdf5e1',
          200: '#f9e4b5',
          300: '#f2cf79',
          400: '#eab54a',
          500: '#d49123',
          600: '#b36f16',
          700: '#8a5212',
          800: '#6a3f10',
          900: '#54330e',
        },
        beige: {
          50: '#fdfcf9',
          100: '#f8f3e9',
          200: '#efe2c8',
          300: '#e3cc9f',
          400: '#d3b072',
          500: '#bb9150',
          600: '#9a6e32',
          700: '#7a5326',
          800: '#5e4020',
          900: '#4c341c',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 25px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 50px -12px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
