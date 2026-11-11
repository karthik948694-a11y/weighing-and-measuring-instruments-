tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        plum: {
          DEFAULT: '#5C1D48',
          light: '#7B2860',
          lighter: '#9E3B7D',
          dark: '#471437',
          deep: '#320B26',
          subtle: '#F5EBF1',
          border: '#DFCCD8',
        },
        milk: {
          DEFAULT: '#FAF6F0',
          pure: '#FFFFFF',
          light: '#FAF6F0',
          deep: '#F0EAE1',
          subtle: '#F5EFE6',
          line: '#E2D9CC',
          border: '#E2D9CC',
          warm: '#EAE1D2',
        },
        raspberry: {
          DEFAULT: '#5C1D48',
          light: '#7B2860',
          dark: '#471437',
          deep: '#320B26',
        },
        'pale-sky': {
          DEFAULT: '#FAF6F0',
          deep: '#F0EAE1',
          line: '#E2D9CC',
        },
        navy: {
          DEFAULT: '#471437',
          light: '#5C1D48',
          lighter: '#7B2860',
          dark: '#320B26',
          deep: '#23071A',
        },
        gold: {
          DEFAULT: '#5C1D48',
          light: '#7B2860',
          lighter: '#DFCCD8',
          dark: '#471437',
          deep: '#320B26',
        },
        sapphire: {
          DEFAULT: '#5C1D48',
          light: '#7B2860',
          dark: '#471437',
          deep: '#320B26',
        },
        emerald: {
          DEFAULT: '#0D6E63',
          light: '#14B8A6',
          dark: '#0A524A',
        },
        ruby: {
          DEFAULT: '#991B1B',
          light: '#DC2626',
          dark: '#7F1D1D',
        },
        amber: {
          DEFAULT: '#B45309',
          light: '#F59E0B',
          dark: '#92400E',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glass': '0 4px 12px rgba(40, 15, 32, 0.06)',
        'glass-hover': '0 8px 20px rgba(40, 15, 32, 0.10)',
        'brass': 'none',
        'sapphire': 'none',
        'plum': '0 4px 14px rgba(92, 29, 72, 0.25)',
        'dark-card': '0 8px 20px rgba(0, 0, 0, 0.35)',
      },
    },
  },
};
