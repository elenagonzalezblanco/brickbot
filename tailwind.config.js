/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lego: {
          red: '#E3000B',
          yellow: '#FFD500',
          blue: '#006DB7',
          green: '#00852B',
          orange: '#FE8A18',
          darkblue: '#003DA5',
          black: '#1B1B1B',
          white: '#F4F4F4',
          grey: '#A0A19F',
          lightgrey: '#E0E0E0',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'brick-fall': 'brickFall 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        brickFall: {
          '0%': { transform: 'translateY(-100px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
