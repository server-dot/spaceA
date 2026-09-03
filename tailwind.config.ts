import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-noto-sans-tc)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-noto-serif-tc)', 'serif'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        paper: {
          DEFAULT: '#fbfaf7',
          ink: '#1d1c1a',
          body: '#46433f',
          secondary: '#6f6a63',
          muted: '#9c968d',
          border: '#e6e2da',
          surface: '#f1eee8',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
