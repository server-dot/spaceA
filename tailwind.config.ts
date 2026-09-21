import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/views/**/*.{js,ts,jsx,tsx,mdx}',
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
          DEFAULT: '#ffffff',
          ink: '#1d1c1a',
          body: '#46433f',
          secondary: '#6f6a63',
          muted: '#716b64', // 原 #9c968d 在白底只有 2.9:1，12px 小字過不了 4.5:1
          border: '#e6e2da',
          surface: '#f1eee8',
          card: '#ffffff',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
