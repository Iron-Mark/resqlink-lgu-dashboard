/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0052FF', // A brighter, more modern blue
          secondary: '#6366F1', // Indigo
          accent: '#14B8A6', // Teal
        },
        status: {
          high: '#F43F5E', // Rose
          medium: '#F97316', // Orange
          low: '#3B82F6', // Blue
          resolved: '#22C55E', // Green
        },
        ui: {
          background: '#F8F9FA', // Very light gray
          surface: '#FFFFFF', // White
          border: '#E5E7EB', // Lighter gray for borders
          text: '#111827', // Almost black for high contrast
          subtext: '#6B7280', // Medium gray for secondary text
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)',
      }
    }
  },
  plugins: [],
}
