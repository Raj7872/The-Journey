// Tailwind CSS v4 uses @tailwindcss/postcss instead of the old tailwindcss
// plugin + autoprefixer chain. No further config needed.
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
