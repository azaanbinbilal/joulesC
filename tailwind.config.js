/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#05060A',
          surface: '#0D0F14',
          card: '#12151C',
          elevated: '#181C26',
        },
        neon: {
          green: '#39FF8B',
          cyan: '#00E5FF',
          violet: '#8A5CF6',
          pink: '#FF3DAC',
          amber: '#FFC857',
        },
        text: {
          primary: '#F5F7FA',
          secondary: '#A0A6B8',
          muted: '#5C6275',
        },
        border: {
          subtle: '#1F2330',
          strong: '#2B3142',
        },
      },
      fontFamily: {
        display: ['SpaceMono'],
      },
    },
  },
  plugins: [],
};
