import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Javari Platform',
  description: 'Your Story. Our Design.',
  icons: {
    icon: '/assets/logos/javari/javari-glyph-32.png',
    apple: '/assets/logos/javari/javari-glyph-512.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
