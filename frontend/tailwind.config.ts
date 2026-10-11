import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          canvas: '#F5F5F7',
          ink: '#1D1D1F',
          secondary: '#6E6E73',
          tertiary: '#86868B',
          darkCanvas: '#121212',
          darkInk: '#F5F5F7',
          darkSecondary: '#A1A1A6',
        },
        primary: {
          50: '#f5f5f7',
          100: '#eeeeF0',
          200: '#d8d8dc',
          300: '#b8b8be',
          400: '#86868b',
          500: '#6e6e73',
          600: '#1d1d1f',
          700: '#000000',
          800: '#000000',
          900: '#000000',
        },
      },
    },
  },
  plugins: [],
}
export default config
