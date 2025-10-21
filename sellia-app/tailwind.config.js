/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      // Colors
      colors: {
        primary: '#D4A574',
        'primary-dark': '#8B7355',
        'primary-light': '#F5E6D3',
        dark: '#2D1B0A',
        neutral: {
          50: '#F9F7F4',
          100: '#EEE8E0',
          200: '#E0D5C7',
          300: '#D4A574',
          400: '#8B7355',
          500: '#6B5344',
          600: '#4A3728',
          700: '#2D1B0A',
          800: '#1a0f06',
          900: '#0d0703',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-gentle': 'pulseGentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.8' },
        },
      },
      boxShadow: {
        'elegant': '0 10px 25px -5px rgba(212, 165, 116, 0.1)',
        'elevation': '0 20px 50px -10px rgba(45, 27, 10, 0.1)',
      },
    },
  },
  plugins: [],
}
