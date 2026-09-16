import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Optional static export output directory for review builds.
  distDir: process.env['NEXT_BUILD_DIR'] || '.next',
  // Static export for Cloudflare Pages
  output: 'export',

  // Three.js must be transpiled for Next.js App Router / R3F v9
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],

  // Image optimization disabled for static export
  images: {
    unoptimized: true,
  },

  // Remove console.log in production (keep error/warn)
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  // Tailwind v4 with @tailwindcss/postcss handles CSS — no webpack CSS config needed
}

export default nextConfig
