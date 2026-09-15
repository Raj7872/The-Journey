import type { Metadata, Viewport } from 'next'

import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'The Last Train Home',
  description:
    'An interactive cinematic experience. Every destination tells a story. This one ends with a question.',
  robots: {
    index: false, // Private experience — not for public indexing
    follow: false,
  },
  // Open Graph — for sharing
  openGraph: {
    title: 'The Last Train Home',
    description: 'Every destination tells a story. This one ends with a question.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0b0f',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/IMFellEnglish-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/CrimsonText-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/SpecialElite-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
