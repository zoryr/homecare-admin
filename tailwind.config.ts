import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette brand alignée sur le logo Home & Care (teal + gris chaud)
        brand: {
          50: '#ecf6f8',
          100: '#d3ebf0',
          200: '#a8d6df',
          300: '#7cc1ce',
          400: '#52b1c1',
          500: '#29a4b8',
          600: '#1f8696',
          700: '#19697a',
          800: '#154f5b',
          900: '#0f3942',
        },
        ink: {
          50: '#fafaf7',
          100: '#f5f4ef',
          200: '#e8e6df',
          300: '#d6d3c8',
          400: '#a8a496',
          500: '#76736a',
          600: '#54524a',
          700: '#3b3933',
          800: '#26241f',
          900: '#191814',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(25, 24, 20, 0.04), 0 4px 12px rgba(25, 24, 20, 0.06)',
        ring: '0 0 0 4px rgba(41, 164, 184, 0.15)',
      },
    },
  },
  plugins: [],
};
export default config;
