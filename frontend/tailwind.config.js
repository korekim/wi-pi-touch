/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette using CSS variables
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card-background)',
          foreground: 'var(--foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary-accent)',
          foreground: 'var(--background)',
        },
        secondary: {
          DEFAULT: 'var(--secondary-accent)',
          foreground: 'var(--background)',
        },
        muted: {
          DEFAULT: 'var(--card-background)',
          foreground: 'var(--muted-text)',
        },
        accent: {
          DEFAULT: 'var(--success-accent)',
          foreground: 'var(--background)',
        },
        destructive: {
          DEFAULT: 'var(--danger-accent)',
          foreground: 'var(--foreground)',
        },
        border: 'var(--border-color)',
        input: 'var(--card-background)',
        ring: 'var(--primary-accent)',
        // Override default Tailwind colors to use our theme
        gray: {
          50: 'var(--card-background)',
          100: 'var(--card-background)',
          200: 'var(--border-color)',
          300: 'var(--border-color)',
          400: 'var(--muted-text)',
          500: 'var(--muted-text)',
          600: 'var(--foreground)',
          700: 'var(--foreground)',
          800: 'var(--background)',
          900: 'var(--background)',
        },
        blue: {
          400: 'var(--secondary-accent)',
          500: 'var(--primary-accent)',
          600: 'var(--primary-accent)',
          700: 'var(--secondary-accent)',
        },
        white: 'var(--foreground)',
        black: 'var(--background)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      boxShadow: {
        'custom': '0 4px 16px var(--shadow-color)',
        'custom-lg': '0 8px 32px var(--shadow-color)',
        'glow': '0 0 20px var(--glow-color)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px var(--glow-color)' },
          '100%': { boxShadow: '0 0 20px var(--glow-color), 0 0 30px var(--glow-color)' },
        },
      },
    },
  },
  plugins: [],
}
