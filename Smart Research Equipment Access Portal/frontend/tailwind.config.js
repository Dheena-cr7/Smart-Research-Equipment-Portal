/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#e8ecf0',
          100: '#c5cdd8',
          200: '#9eadc0',
          300: '#778ca8',
          400: '#5a7295',
          500: '#3d5883',
          600: '#2a4270',
          700: '#1a2f58',
          800: '#0D1B2A',
          900: '#080f18',
          950: '#040810',
        },
        teal: {
          50:  '#e0f5f7',
          100: '#b3e6eb',
          200: '#80d5de',
          300: '#4dc4d1',
          400: '#26b8c7',
          500: '#0B6E7C',
          600: '#0a5f6b',
          700: '#084f59',
          800: '#063f47',
          900: '#042f35',
        },
        mint: {
          50:  '#e0faf6',
          100: '#b3f3e9',
          200: '#80ecdb',
          300: '#4de5cd',
          400: '#26dfbf',
          500: '#00BFA6',
          600: '#00a893',
          700: '#008f7d',
          800: '#007666',
          900: '#005d50',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)',
        'card-hover': '0 4px 12px -2px rgba(0,0,0,0.12), 0 2px 6px -2px rgba(0,0,0,0.08)',
        'nav': '0 1px 3px 0 rgba(0,0,0,0.10)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
